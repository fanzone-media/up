import {
  CardToken,
  CardToken__factory,
  CardAuction,
  CardAuction__factory,
  ERC725Y,
  FanzoneToken,
  FanzoneToken__factory,
  Lns,
  Lns__factory,
  LSP1UniversalReceiverDelegateUP,
  LSP1UniversalReceiverDelegateUP__factory,
  LSP6KeyManager,
  LSP6KeyManager__factory,
  UniversalProfile,
  UniversalProfile__factory,
} from "../typechain";
import {
  buildLSP3Profile,
  buildLSP4Metadata,
  encodeWithSchema,
  getSchemaKey,
  LSP3ProfileData,
  LSP4MetadataData,
  LSPMappings,
  updateAddToArrayMetadata,
} from "./LSPSchema";
import { waitForTxOnNetwork, waitForFactoryDeployTxOnNetwork } from "./network";
import {
  executeCallToUniversalProfileViaKeyManager,
  executeCallToUniversalProfileViaKeyManagerWithMetaTx,
} from "./universalProfile";
import { displayOnChainData } from "./display";
import {
  buildKeyManagerMetaTx,
  LSP6_KEY_MANAGER_PERMISSIONS,
} from "./keyManager";

import type { BigNumberish } from "ethers";
import type { Address, SignerWithAddress } from "./types";

//
// --- contract deploys
//

export type CardTokenDeployParams = {
  name: string;
  symbol: string;
  creators: Array<Address>;
  creatorRevenueShares: Array<BigNumberish>;
  tokenSupplyCap: BigNumberish;
  scoreMin: BigNumberish;
  scoreMax: BigNumberish;
  scoreScale: BigNumberish;
  scoreMaxTokenId: BigNumberish;
  isMigrating: boolean;
};
export type CardTokenDeployResult = {
  contract: CardToken;
  deployParams: CardTokenDeployParams;
};
export const deployCardToken = async (
  networkName: string,
  deployer: SignerWithAddress,
  deployParams: CardTokenDeployParams,
  logger = (..._data: Array<any>) => {}
): Promise<CardTokenDeployResult> => {
  const factory = new CardToken__factory(deployer);

  const contract = await factory.deploy(
    deployParams.name,
    deployParams.symbol,
    deployParams.creators,
    deployParams.creatorRevenueShares,
    deployParams.tokenSupplyCap,
    deployParams.scoreMin,
    deployParams.scoreMax,
    deployParams.scoreScale,
    deployParams.scoreMaxTokenId,
    deployParams.isMigrating
  );
  await waitForFactoryDeployTxOnNetwork(
    networkName,
    contract.deployTransaction,
    logger
  );

  return {
    contract,
    deployParams,
  };
};

export type FanzoneTokenDeployParams = {
  name: string;
  symbol: string;
  tokenSupplyCap: BigNumberish;
};
export type FanzoneTokenDeployResult = {
  contract: FanzoneToken;
  deployParams: FanzoneTokenDeployParams;
};
export const deployFanzoneToken = async (
  networkName: string,
  deployer: SignerWithAddress,
  deployParams: FanzoneTokenDeployParams,
  logger = (..._data: Array<any>) => {}
): Promise<FanzoneTokenDeployResult> => {
  const factory = new FanzoneToken__factory(deployer);

  const contract = await factory.deploy(
    deployParams.name,
    deployParams.symbol,
    deployParams.tokenSupplyCap
  );
  await waitForFactoryDeployTxOnNetwork(
    networkName,
    contract.deployTransaction,
    logger
  );

  return {
    contract,
    deployParams,
  };
};

export type CardAuctionDeployParams = {};
export type CardAuctionDeployResult = {
  contract: CardAuction;
  deployParams: CardAuctionDeployParams;
};
export const deployCardAuction = async (
  networkName: string,
  deployer: SignerWithAddress,
  deployParams: CardAuctionDeployParams = {},
  logger = (..._data: Array<any>) => {}
): Promise<CardAuctionDeployResult> => {
  const factory = new CardAuction__factory(deployer);

  const contract = await factory.deploy();
  await waitForFactoryDeployTxOnNetwork(
    networkName,
    contract.deployTransaction,
    logger
  );

  return {
    contract,
    deployParams,
  };
};

export type LnsDeployParams = {
  name: string;
  symbol: string;
  price: BigNumberish;
};
export type LnsDeployResult = {
  contract: Lns;
  deployParams: LnsDeployParams;
};
export const deployLns = async (
  networkName: string,
  deployer: SignerWithAddress,
  deployParams: LnsDeployParams,
  logger = (..._data: Array<any>) => {}
): Promise<LnsDeployResult> => {
  const factory = new Lns__factory(deployer);

  const contract = await factory.deploy(
    deployParams.name,
    deployParams.symbol,
    deployParams.price
  );

  await waitForFactoryDeployTxOnNetwork(
    networkName,
    contract.deployTransaction,
    logger
  );

  return {
    contract,
    deployParams,
  };
};

export type UniversalProfileDeployParams = {
  newOwner: Address;
};
export type UniversalProfileDeployResult = {
  contract: UniversalProfile;
  deployParams: UniversalProfileDeployParams;
};
export const deployUniversalProfile = async (
  networkName: string,
  deployer: SignerWithAddress,
  deployParams: UniversalProfileDeployParams,
  logger = (..._data: Array<any>) => {}
): Promise<UniversalProfileDeployResult> => {
  const factory = new UniversalProfile__factory(deployer);

  const contract = await factory.deploy(deployParams.newOwner);
  await waitForFactoryDeployTxOnNetwork(
    networkName,
    contract.deployTransaction,
    logger
  );

  return {
    contract,
    deployParams,
  };
};

export type LSP6KeyManagerDeployParams = {
  universalProfile: Address;
};
export type LSP6KeyManagerDeployResult = {
  contract: LSP6KeyManager;
  deployParams: LSP6KeyManagerDeployParams;
};
export const deployLSP6KeyManager = async (
  networkName: string,
  deployer: SignerWithAddress,
  deployParams: LSP6KeyManagerDeployParams,
  logger = (..._data: Array<any>) => {}
): Promise<LSP6KeyManagerDeployResult> => {
  const factory = new LSP6KeyManager__factory(deployer);

  const contract = await factory.deploy(deployParams.universalProfile);
  await waitForFactoryDeployTxOnNetwork(
    networkName,
    contract.deployTransaction,
    logger
  );

  return {
    contract,
    deployParams,
  };
};

export type LSP1UniversalReceiverDelegateUPDeployParams = {};
export type LSP1UniversalReceiverDelegateUPDeployResult = {
  contract: LSP1UniversalReceiverDelegateUP;
  deployParams: LSP1UniversalReceiverDelegateUPDeployParams;
};
export const deployLSP1UniversalReceiverDelegateUP = async (
  networkName: string,
  deployer: SignerWithAddress,
  deployParams: LSP1UniversalReceiverDelegateUPDeployParams,
  logger = (..._data: Array<any>) => {}
): Promise<LSP1UniversalReceiverDelegateUPDeployResult> => {
  const factory = new LSP1UniversalReceiverDelegateUP__factory(deployer);

  const contract = await factory.deploy();
  await waitForFactoryDeployTxOnNetwork(
    networkName,
    contract.deployTransaction,
    logger
  );

  return {
    contract,
    deployParams,
  };
};

//
// --- contract setups that require multiple deploys to achieve desired state
//

export const setupUniversalProfile = async (
  networkName: string,
  deployer: SignerWithAddress,
  universalProfileOwnerAddress: Address,
  lsp3ProfileData: LSP3ProfileData,
  delaySettingUniversalProfileERC725YData: boolean = false,
  logger = (..._data: Array<any>) => {}
) => {
  logger("deploying UniversalProfile");
  const deployedUniversalProfile = await deployUniversalProfile(
    networkName,
    deployer,
    {
      newOwner: deployer.address,
    },
    logger
  );
  logger(
    "deployed UniversalProfile",
    displayOnChainData(deployedUniversalProfile.contract.address)
  );

  logger("deploying LSP1UniversalReceiverDelegateUP");
  const deployedUniversalReceiverDelegate =
    await deployLSP1UniversalReceiverDelegateUP(
      networkName,
      deployer,
      {},
      logger
    );
  logger(
    "deployed LSP1UniversalReceiverDelegateUP",
    displayOnChainData(deployedUniversalReceiverDelegate.contract.address)
  );

  logger(
    "building ERC725Y data [LSP3Profile, LSP1UniversalReceiverDelegate] for UniversalProfile"
  );
  const encodedLSP3Profile = await buildLSP3Profile(
    networkName,
    lsp3ProfileData
  );
  const universalProfileERC725YData = {
    keys: [
      getSchemaKey("LSP3Profile"),
      getSchemaKey("LSP1UniversalReceiverDelegate"),
    ],
    values: [
      encodedLSP3Profile,
      deployedUniversalReceiverDelegate.contract.address,
    ],
  };

  if (!delaySettingUniversalProfileERC725YData) {
    logger("setting ERC725Y data on UniversalProfile");
    logger(JSON.stringify(universalProfileERC725YData, null, 2));

    await waitForTxOnNetwork(
      networkName,
      deployedUniversalProfile.contract.setData(
        universalProfileERC725YData.keys,
        universalProfileERC725YData.values
      ),
      logger
    );
  }

  if (deployer.address !== universalProfileOwnerAddress) {
    logger("calling transferOwnership on UniversalProfile");
    logger(
      displayOnChainData({
        oldOwner: deployer.address,
        newOwner: universalProfileOwnerAddress,
      })
    );

    await waitForTxOnNetwork(
      networkName,
      deployedUniversalProfile.contract.transferOwnership(
        universalProfileOwnerAddress
      ),
      logger
    );
  }

  return {
    deployedUniversalProfile,
    deployedUniversalReceiverDelegate,
    universalProfileERC725YData,
  };
};

export const setupUniversalProfileWithKeyManager = async (
  networkName: string,
  deployer: SignerWithAddress,
  lsp3ProfileData: LSP3ProfileData,
  keyManagerPermissions: {
    keys: Array<string>;
    values: Array<string>;
  },
  logger = (..._data: Array<any>) => {}
) => {
  const {
    deployedUniversalProfile,
    deployedUniversalReceiverDelegate,
    universalProfileERC725YData: universalProfileERC725YDataBase,
  } = await setupUniversalProfile(
    networkName,
    deployer,
    deployer.address, // use same address to skip the UniversalProfile ownership transfer
    lsp3ProfileData,
    true,
    logger
  );

  logger("deploying KeyManager");
  const deployedKeyManager = await deployLSP6KeyManager(
    networkName,
    deployer,
    {
      universalProfile: deployedUniversalProfile.contract.address,
    },
    logger
  );
  logger(
    "deployed KeyManager",
    displayOnChainData(deployedKeyManager.contract.address)
  );

  logger(
    "building ERC725Y data [...KeyManagerPermissions] for UniversalProfile"
  );
  // set values for "AddressPermissions[]"
  const providedAddressesWithPermissions = new Set<string>();
  const permissionPrefix =
    LSPMappings.LSP6KeyManagerAddressPermissions.buildKey("");
  // find all provided addresses
  keyManagerPermissions.keys.forEach((permissionKey) => {
    if (permissionKey.startsWith(permissionPrefix)) {
      const address = permissionKey.replace(permissionPrefix, "0x");
      providedAddressesWithPermissions.add(address);
    }
  });

  // UniversalReceiverDelegate needs permission to setData for token hooks
  const keyPermissionsUniversalReceiverDelegateSetData = {
    key: LSPMappings.LSP6KeyManagerAddressPermissions.buildKey(
      deployedUniversalReceiverDelegate.contract.address
    ),
    value: LSP6_KEY_MANAGER_PERMISSIONS.SET_DATA,
  };
  providedAddressesWithPermissions.add(
    deployedUniversalReceiverDelegate.contract.address
  );

  const encodedLSP6AddressPermissions = await updateAddToArrayMetadata(
    "AddressPermissions[]",
    deployedUniversalProfile.contract,
    Array.from(providedAddressesWithPermissions)
  );

  const universalProfileERC725YData = {
    keys: [
      ...universalProfileERC725YDataBase.keys,
      ...keyManagerPermissions.keys,
      keyPermissionsUniversalReceiverDelegateSetData.key,
      ...encodedLSP6AddressPermissions.keys,
    ],
    values: [
      ...universalProfileERC725YDataBase.values,
      ...keyManagerPermissions.values,
      keyPermissionsUniversalReceiverDelegateSetData.value,
      ...encodedLSP6AddressPermissions.values,
    ],
  };

  logger("setting ERC725Y data on UniversalProfile");
  logger(JSON.stringify(universalProfileERC725YData, null, 2));
  await waitForTxOnNetwork(
    networkName,
    deployedUniversalProfile.contract.setData(
      universalProfileERC725YData.keys,
      universalProfileERC725YData.values
    ),
    logger
  );

  logger("calling transferOwnership on UniversalProfile");
  logger(
    displayOnChainData({
      oldOwner: deployer.address,
      newOwner: deployedKeyManager.contract.address,
    })
  );
  await waitForTxOnNetwork(
    networkName,
    deployedUniversalProfile.contract.transferOwnership(
      deployedKeyManager.contract.address
    ),
    logger
  );

  return {
    deployedUniversalProfile,
    deployedUniversalReceiverDelegate,
    deployedKeyManager,
  };
};

// used to setup either a LSP7 or LSP8
export const setupDigitalAsset = async (
  networkName: string,
  deployer: SignerWithAddress,
  universalProfile: UniversalProfile,
  digitalAsset: ERC725Y,
  keyManager: LSP6KeyManager,
  digitalAssetERC725YData: { keys: Array<string>; values: Array<string> },
  withMetaTx: boolean = false,
  logger = (..._data: Array<any>) => {}
) => {
  // NOTE: transfering ownership immediately after deploying to enforce using the ERC725X `execute`
  // call via the owner UniversalProfile
  logger("calling transferOwnership on CardToken");
  logger(
    displayOnChainData({
      oldOwner: deployer.address,
      newOwner: universalProfile.address,
    })
  );
  await waitForTxOnNetwork(
    networkName,
    digitalAsset.transferOwnership(universalProfile.address),
    logger
  );

  const cardTokenSetDataTxData = digitalAsset.interface.encodeFunctionData(
    "setData",
    [digitalAssetERC725YData.keys, digitalAssetERC725YData.values]
  );

  logger("setting ERC725Y data for CardToken");
  logger(JSON.stringify(digitalAssetERC725YData, null, 2));
  // TODO: we could sanity check here that we have access to make execute calls for KeyManager branches
  if (withMetaTx) {
    logger("using meta tx");
    const universalProfileExecuteTxData =
      universalProfile.interface.encodeFunctionData("execute", [
        "0x0",
        digitalAsset.address,
        "0",
        cardTokenSetDataTxData,
      ]);

    const { metaTxNonce, metaTxSignature } = await buildKeyManagerMetaTx(
      keyManager,
      deployer,
      universalProfileExecuteTxData
    );

    await waitForTxOnNetwork(
      networkName,
      executeCallToUniversalProfileViaKeyManagerWithMetaTx(
        keyManager,
        universalProfileExecuteTxData,
        metaTxNonce,
        metaTxSignature
      ),
      logger
    );
  } else {
    const universalProfileExecuteTxData =
      universalProfile.interface.encodeFunctionData("execute", [
        "0x0",
        digitalAsset.address,
        "0",
        cardTokenSetDataTxData,
      ]);

    await waitForTxOnNetwork(
      networkName,
      executeCallToUniversalProfileViaKeyManager(
        keyManager,
        universalProfileExecuteTxData
      ),
      logger
    );
  }

  logger("updating 'LSP3IssuedAssets[]' on CardToken owner UniversalProfile");
  const encodedLSP3IssuedAssets = await updateAddToArrayMetadata(
    "LSP3IssuedAssets[]",
    universalProfile,
    [digitalAsset.address]
  );

  // TODO: we could sanity check here that we have access to make setData calls for KeyManager branches
  if (withMetaTx) {
    logger("using meta tx");
    const universalProfileSetDataTxData =
      universalProfile.interface.encodeFunctionData("setData", [
        encodedLSP3IssuedAssets.keys,
        encodedLSP3IssuedAssets.values,
      ]);

    const { metaTxNonce, metaTxSignature } = await buildKeyManagerMetaTx(
      keyManager,
      deployer,
      universalProfileSetDataTxData
    );

    await waitForTxOnNetwork(
      networkName,
      executeCallToUniversalProfileViaKeyManagerWithMetaTx(
        keyManager,
        universalProfileSetDataTxData,
        metaTxNonce,
        metaTxSignature
      ),
      logger
    );
  } else {
    const universalProfileSetDataTxData =
      universalProfile.interface.encodeFunctionData("setData", [
        encodedLSP3IssuedAssets.keys,
        encodedLSP3IssuedAssets.values,
      ]);

    await waitForTxOnNetwork(
      networkName,
      executeCallToUniversalProfileViaKeyManager(
        keyManager,
        universalProfileSetDataTxData
      ),
      logger
    );
  }
};

export const setupCardToken = async (
  networkName: string,
  deployer: SignerWithAddress,
  universalProfile: UniversalProfile,
  keyManager: LSP6KeyManager,
  cardTokenDeployParams: CardTokenDeployParams,
  lsp4MetadataData: LSP4MetadataData,
  lsp4MetadataDataExtra:
    | {
        batch: string;
        batchMax: string;
        cardType: string;
        edition: string;
        editionCategory: string;
        editionSet: string;
        league: string;
        metacardIndex: string;
        scoreMax: string;
        scoreMin: string;
        season: string;
        team: string;
        tier: string;
        tierLabel: string;
        zone: string;
      }
    | {} = {},
  withMetaTx: boolean = false,
  logger = (..._data: Array<any>) => {}
) => {
  logger("deploying CardToken");
  const deployedCardToken = await deployCardToken(
    networkName,
    deployer,
    cardTokenDeployParams,
    logger
  );
  logger(
    "deployed CardToken",
    displayOnChainData(deployedCardToken.contract.address)
  );

  logger("building ERC725Y data [LSP4Metadata, LSP4Creators[]] for CardToken");
  const encodedLSP4Metadata = await buildLSP4Metadata(
    networkName,
    lsp4MetadataData,
    lsp4MetadataDataExtra
  );
  // TODO: contract constructor might set this data, then we dont need to do this
  const encodedCreators: Array<{
    key: string;
    value: string;
  }> = encodeWithSchema(
    "LSP4Creators[]",
    deployedCardToken.deployParams.creators
  );

  // TODO: this is a little weird to need to transform the data again.. mayeb the latest erc725.js
  // makes this nicer to work with when calling `contract.setData(bytes32[], bytes[])`
  const creatorERC725YData = encodedCreators.reduce(
    (acc, { key, value }) => {
      acc.keys.push(key);
      acc.values.push(value);

      return acc;
    },
    {
      keys: [],
      values: [],
    } as { keys: Array<string>; values: Array<string> }
  );

  const cardTokenERC725YData = {
    keys: [getSchemaKey("LSP4Metadata"), ...creatorERC725YData.keys],
    values: [encodedLSP4Metadata, ...creatorERC725YData.values],
  };

  await setupDigitalAsset(
    networkName,
    deployer,
    universalProfile,
    deployedCardToken.contract as ERC725Y,
    keyManager,
    cardTokenERC725YData,
    withMetaTx,
    logger
  );

  return { deployedCardToken };
};

export const setupFanzoneToken = async (
  networkName: string,
  deployer: SignerWithAddress,
  universalProfile: UniversalProfile,
  keyManager: LSP6KeyManager,
  fanzoneTokenDeployParams: FanzoneTokenDeployParams,
  lsp4MetadataData: LSP4MetadataData,
  withMetaTx: boolean = false,
  logger = (..._data: Array<any>) => {}
) => {
  logger("deploying FanzoneToken");
  const deployedFanzoneToken = await deployFanzoneToken(
    networkName,
    deployer,
    fanzoneTokenDeployParams,
    logger
  );
  logger(
    "deployed FanzoneToken",
    displayOnChainData(deployedFanzoneToken.contract.address)
  );

  logger(
    "building ERC725Y data [LSP4Metadata, LSP4Creators[]] for FanzoneToken"
  );
  const encodedLSP4Metadata = await buildLSP4Metadata(
    networkName,
    lsp4MetadataData
  );
  const encodedCreators: Array<{
    key: string;
    value: string;
  }> = encodeWithSchema("LSP4Creators[]", [deployer.address]);

  // TODO: this is a little weird to need to transform the data again.. mayeb the latest erc725.js
  // makes this nicer to work with when calling `contract.setData(bytes32[], bytes[])`
  const creatorERC725YData = encodedCreators.reduce(
    (acc, { key, value }) => {
      acc.keys.push(key);
      acc.values.push(value);

      return acc;
    },
    {
      keys: [],
      values: [],
    } as { keys: Array<string>; values: Array<string> }
  );

  const fanzoneTokenERC725YData = {
    keys: [getSchemaKey("LSP4Metadata"), ...creatorERC725YData.keys],
    values: [encodedLSP4Metadata, ...creatorERC725YData.values],
  };

  await setupDigitalAsset(
    networkName,
    deployer,
    universalProfile,
    deployedFanzoneToken.contract as ERC725Y,
    keyManager,
    fanzoneTokenERC725YData,
    withMetaTx,
    logger
  );

  return { deployedFanzoneToken };
};
