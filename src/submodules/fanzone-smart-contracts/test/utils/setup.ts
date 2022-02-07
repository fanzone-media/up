import hre from "hardhat";
import { ethers } from "ethers";

import {
  CardTokenDeployResult,
  deployCardToken,
  deployCardAuction,
  CardAuctionDeployResult,
  deployFanzoneToken,
  deployLSP6KeyManager,
  FanzoneTokenDeployResult,
  setupCardToken,
  setupFanzoneToken,
  setupUniversalProfile,
} from "../../utils/deployers";

import { deployTestCardMarket, TestCardMarketDeployResult } from "./deployers";
import {
  getHdWalletAccounts,
  NamedAccountsToSignerMap,
  alreadyDeployedUniversalProfileContracts,
  NamedAccountsInHdWalletWithUniversalProfile,
} from "../../utils/hdwallet";
import { isLocalTestnet, waitForTxOnNetwork } from "../../utils/network";
import { LSP6_KEY_MANAGER_PERMISSIONS } from "../../utils/keyManager";
import { LSPMappings, getSchemaKey } from "../../utils/LSPSchema";
import {
  UniversalProfile,
  UniversalProfile__factory,
  LSP6KeyManager,
} from "../../typechain";

import type { SignerWithAddress } from "../../utils/types";
import type { BigNumberish, BytesLike } from "ethers";

// local testnet will be fast, and others SLOW
export const getTimeoutForNetwork = (networkName: string) =>
  networkName === "hardhat" ? 30 * 1000 : 2 * 60 * 1000;

//
// --- UniversalProfile helpers
//

export type NamedAccountsWithUniversalProfileMap =
  NamedAccountsInHdWalletWithUniversalProfile<UniversalProfile>;
export const getUniversalProfiles = async (
  accounts: NamedAccountsToSignerMap
): Promise<NamedAccountsWithUniversalProfileMap> => {
  let universalProfiles = {} as NamedAccountsWithUniversalProfileMap;
  const namedAccountsToHaveUniversalProfile: Array<
    keyof NamedAccountsWithUniversalProfileMap
  > = ["owner", "tokenReceiver", "tokenBuyer", "athlete", "team", "league"];

  if (isLocalTestnet(hre.network.name)) {
    // when on local testnet we will deploy new profiles
    const deployResults = await Promise.all(
      namedAccountsToHaveUniversalProfile.map(async (accountName) => {
        const universalProfileOwner = accounts[accountName];

        const { deployedUniversalProfile } = await setupUniversalProfile(
          hre.network.name,
          universalProfileOwner,
          universalProfileOwner.address,
          {
            name: accountName,
            description: "really cool profile",
          }
        );

        return {
          accountName,
          deployedUniversalProfile,
        };
      })
    );

    universalProfiles = deployResults.reduce(
      (acc, { accountName, deployedUniversalProfile }) => {
        acc[accountName] = deployedUniversalProfile.contract;
        return acc;
      },
      {} as NamedAccountsWithUniversalProfileMap
    );
  } else if (hre.network.name === "l14") {
    // when we are on the l14 network, profiles should be deployed already
    Object.keys(alreadyDeployedUniversalProfileContracts).forEach(
      (accountName) => {
        const universalProfileContractAddress =
          alreadyDeployedUniversalProfileContracts[
            accountName as keyof NamedAccountsWithUniversalProfileMap
          ];

        if (!ethers.utils.isAddress(universalProfileContractAddress)) {
          throw new Error(
            `Invalid address for UniversalProfile contract "${accountName}". Check the .env file for section "PROFILE_ADDRESS_*"`
          );
        }
      }
    );

    const fetchResult = await Promise.all(
      namedAccountsToHaveUniversalProfile.map(async (accountName) => {
        const account = accounts[accountName as keyof NamedAccountsToSignerMap];
        const contract = UniversalProfile__factory.connect(
          alreadyDeployedUniversalProfileContracts[accountName],
          account
        );

        return { accountName, contract };
      })
    );

    universalProfiles = fetchResult.reduce((acc, { accountName, contract }) => {
      acc[accountName] = contract;
      return acc;
    }, {} as NamedAccountsWithUniversalProfileMap);
  } else {
    throw new Error(
      `not sure where to look up the named accounts UniversalProfile for network ${hre.network.name}`
    );
  }

  // sanity checking that UniversalProfile is there and owner matches what we have mapped
  await Promise.all(
    Object.keys(universalProfiles).map(async (accountName) => {
      const account = accounts[accountName as keyof NamedAccountsToSignerMap];
      const universalProfile =
        universalProfiles[
          accountName as keyof NamedAccountsWithUniversalProfileMap
        ];
      const contractOwner = await universalProfile.owner();

      if (contractOwner !== account.address) {
        throw new Error(
          `owner mismatch for UniversalProfile ${universalProfile.address} for account ${accountName}`
        );
      }
    })
  );

  return universalProfiles;
};

//
// --- KeyManager helpers
//

export type NamedAccountsWithKeyManagerMap =
  NamedAccountsInHdWalletWithUniversalProfile<LSP6KeyManager>;
export const getKeyManagerContracts = async (
  accounts: NamedAccountsToSignerMap,
  universalProfiles: NamedAccountsWithUniversalProfileMap
): Promise<NamedAccountsWithKeyManagerMap> => {
  let keyManagers = {} as NamedAccountsWithKeyManagerMap;
  const namedAccountsToHaveKeyManager: Array<
    keyof NamedAccountsWithKeyManagerMap
  > = ["owner", "tokenReceiver", "tokenBuyer", "athlete", "team", "league"];

  if (isLocalTestnet(hre.network.name)) {
    // when on local testnet we will deploy new key manager recipients
    const deployResults = await Promise.all(
      namedAccountsToHaveKeyManager.map(async (accountName) => {
        const keyManagerOwner = accounts[accountName];
        const universalProfile = universalProfiles[accountName];

        const deployedKeyManager = await deployLSP6KeyManager(
          hre.network.name,
          keyManagerOwner,
          {
            universalProfile: universalProfile.address,
          }
        );

        // fetch LSP1UniversalReceiverDelegate
        const [universalReceiverDelegateAddress] =
          await universalProfile.getData([
            getSchemaKey("LSP1UniversalReceiverDelegate"),
          ]);

        const keyManagerPermissions = {
          keys: [
            // give KeyManager owner all permissions
            LSPMappings.LSP6KeyManagerAddressPermissions.buildKey(
              keyManagerOwner.address
            ),
            // UniversalReceiverDelegate permission to setData
            LSPMappings.LSP6KeyManagerAddressPermissions.buildKey(
              universalReceiverDelegateAddress
            ),
          ],
          values: [
            // give KeyManager owner all permissions
            LSP6_KEY_MANAGER_PERMISSIONS.ALL_PERMISSIONS,
            // UniversalReceiverDelegate needs permission to setData for token hooks
            LSP6_KEY_MANAGER_PERMISSIONS.SET_DATA,
          ],
        };

        await waitForTxOnNetwork(
          hre.network.name,
          universalProfile.setData(
            keyManagerPermissions.keys,
            keyManagerPermissions.values
          )
        );

        // change ownership of UniversalProfile to LSP6KeyManager
        await waitForTxOnNetwork(
          hre.network.name,
          universalProfile.transferOwnership(
            deployedKeyManager.contract.address
          )
        );

        return {
          accountName,
          deployedKeyManager,
        };
      })
    );

    keyManagers = deployResults.reduce(
      (acc, { accountName, deployedKeyManager }) => {
        acc[accountName] = deployedKeyManager.contract;
        return acc;
      },
      {} as NamedAccountsWithKeyManagerMap
    );
  } else {
    throw new Error(
      `not sure where to look up the named accounts LSP6KeyManager for network ${hre.network.name}`
    );
  }

  return keyManagers;
};

//
// --- setup test helpers
//

const getDeployer = (accounts: NamedAccountsToSignerMap): SignerWithAddress => {
  // NOTE: by convention using `accounts.owner` as the deployer, which means by default all
  // transactions will be signed by that address; use `contract.connect(anotherAddress)` to sign
  // with a different account
  return accounts.owner;
};

export interface TestUniversalProfileWithKeyManagerContext {
  accounts: NamedAccountsToSignerMap;
  keyManagers: NamedAccountsWithKeyManagerMap;
  universalProfiles: NamedAccountsWithUniversalProfileMap;
}
export const setupTestUniversalProfileWithKeyManagerContext =
  async (): Promise<TestUniversalProfileWithKeyManagerContext> => {
    const accounts = await getHdWalletAccounts(hre);
    const universalProfiles = await getUniversalProfiles(accounts);
    const keyManagers = await getKeyManagerContracts(
      accounts,
      universalProfiles
    );

    return {
      accounts,
      keyManagers,
      universalProfiles,
    };
  };

export interface TestCardTokenContext
  extends TestUniversalProfileWithKeyManagerContext {
  cardToken: CardTokenDeployResult;
}
export type SetupTestCardTokenContextParams = {
  cardTokenParams: { tokenSupplyCap: BigNumberish };
};
export const setupTestCardTokenContext = async ({
  cardTokenParams,
}: SetupTestCardTokenContextParams): Promise<TestCardTokenContext> => {
  const baseContext = await setupTestUniversalProfileWithKeyManagerContext();
  const { accounts, keyManagers, universalProfiles } = baseContext;

  const deployer = getDeployer(accounts);

  // deploy contracts
  const cardTokenSetup = await setupCardToken(
    hre.network.name,
    deployer,
    universalProfiles.owner,
    keyManagers.owner,
    {
      name: `German Mens Team 2021 - test - ${Date.now()}`,
      symbol: `GM2021-test-${Date.now()}`,
      creators: [
        universalProfiles.athlete.address,
        universalProfiles.team.address,
        universalProfiles.league.address,
      ],
      creatorRevenueShares: [
        ethers.BigNumber.from(20),
        ethers.BigNumber.from(30),
        ethers.BigNumber.from(50),
      ],
      tokenSupplyCap: cardTokenParams.tokenSupplyCap,
      scoreMax: 20,
      scoreMin: 15,
      scoreScale: 1,
      scoreMaxTokenId: cardTokenParams.tokenSupplyCap,
      isMigrating: false,
    },
    {
      description: "German Mens Team 2021 - test description",
    }
  );

  return {
    ...baseContext,
    cardToken: cardTokenSetup.deployedCardToken,
  };
};

export interface TestFanzoneTokenContext
  extends TestUniversalProfileWithKeyManagerContext {
  fanzoneToken: FanzoneTokenDeployResult;
}
export type SetupTestFanzoneTokenContextParams = {
  fanzoneTokenParams: {
    tokenSupplyCap: BigNumberish;
  };
};
export const setupTestFanzoneTokenContext = async ({
  fanzoneTokenParams,
}: SetupTestFanzoneTokenContextParams): Promise<TestFanzoneTokenContext> => {
  const baseContext = await setupTestUniversalProfileWithKeyManagerContext();
  const { accounts, keyManagers, universalProfiles } = baseContext;

  const deployer = getDeployer(accounts);

  // deploy contracts
  const fanzoneTokenSetup = await setupFanzoneToken(
    hre.network.name,
    deployer,
    universalProfiles.owner,
    keyManagers.owner,
    {
      name: `FanzoneToken - test - ${Date.now()}`,
      symbol: `FNZ-test-${Date.now()}`,
      tokenSupplyCap: fanzoneTokenParams.tokenSupplyCap,
    },
    {
      description: "Fanzone credit token",
    }
  );

  return {
    ...baseContext,
    fanzoneToken: fanzoneTokenSetup.deployedFanzoneToken,
  };
};

export interface TestCardAuctionContext
  extends TestUniversalProfileWithKeyManagerContext {
  cardAuction: CardAuctionDeployResult;
  cardToken: CardTokenDeployResult;
  fanzoneToken: FanzoneTokenDeployResult;
}
export type SetupTestCardAuctionContextParams = {
  cardAuctionParams: { tokenIdsToMint: Array<BytesLike> };
};
export const setupTestCardAuctionContext = async ({
  cardAuctionParams,
}: SetupTestCardAuctionContextParams): Promise<TestCardAuctionContext> => {
  const baseContext = await setupTestUniversalProfileWithKeyManagerContext();
  const { accounts } = baseContext;

  const deployer = getDeployer(accounts);

  // deploy contracts
  const deployedCardAuction = await deployCardAuction(
    hre.network.name,
    deployer
  );
  const deployedCardToken = await deployCardToken(hre.network.name, deployer, {
    name: "testa",
    symbol: "TST",
    creators: [deployer.address],
    creatorRevenueShares: ["100"],
    tokenSupplyCap: "100",
    scoreMin: "1",
    scoreMax: "2",
    scoreScale: "1",
    scoreMaxTokenId: "100",
    isMigrating: false,
  });
  const deployedFanzoneToken = await deployFanzoneToken(
    hre.network.name,
    deployer,
    {
      name: `FanzoneToken - test - ${Date.now()}`,
      symbol: `FNZ-test-${Date.now()}`,
      tokenSupplyCap: "100",
    }
  );

  for (let i = 0; i < cardAuctionParams.tokenIdsToMint.length; i++) {
    const tokenId = cardAuctionParams.tokenIdsToMint[i];
    await deployedCardToken.contract.unpackCard(
      accounts.owner.address,
      tokenId
    );
  }

  return {
    ...baseContext,
    cardAuction: deployedCardAuction,
    cardToken: deployedCardToken,
    fanzoneToken: deployedFanzoneToken,
  };
};

export interface TestCardMarketContext
  extends TestUniversalProfileWithKeyManagerContext {
  cardMarket: TestCardMarketDeployResult;
  fanzoneToken: FanzoneTokenDeployResult;
}
export type SetupTestCardMarketContextParams = {
  cardMarketParams: { tokenIdsToMint: Array<BytesLike> };
};
export const setupTestCardMarketContext = async ({
  cardMarketParams,
}: SetupTestCardMarketContextParams): Promise<TestCardMarketContext> => {
  const baseContext = await setupTestUniversalProfileWithKeyManagerContext();
  const { accounts } = baseContext;

  const deployer = getDeployer(accounts);

  // deploy contracts
  const deployedCardMarket = await deployTestCardMarket(
    hre.network.name,
    deployer,
    {
      name: "testa",
      symbol: "TST",
    }
  );
  const deployedFanzoneToken = await deployFanzoneToken(
    hre.network.name,
    deployer,
    {
      name: `FanzoneToken - test - ${Date.now()}`,
      symbol: `FNZ-test-${Date.now()}`,
      tokenSupplyCap: "100",
    }
  );

  for (let i = 0; i < cardMarketParams.tokenIdsToMint.length; i++) {
    const tokenId = cardMarketParams.tokenIdsToMint[i];
    await deployedCardMarket.contract.mint(
      accounts.owner.address,
      tokenId,
      true,
      ethers.utils.toUtf8Bytes("setup tokenIdsToMint")
    );
  }

  return {
    ...baseContext,
    cardMarket: deployedCardMarket,
    fanzoneToken: deployedFanzoneToken,
  };
};
