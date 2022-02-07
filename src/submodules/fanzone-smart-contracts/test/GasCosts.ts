import hre from "hardhat";
import { ethers } from "ethers";

import { deployCardToken } from "../utils/deployers";
import {
  getHdWalletAccounts,
  NamedAccountsToSignerMap,
} from "../utils/hdwallet";
import { WaitForTxOnNetworkResult } from "../utils/network";
import {
  transferFromScenarioToEOA,
  transferFromScenarioToUniversalProfileViaKeyManager,
  transferFromScenarioToUniversalProfileViaKeyManagerWithMetaTx,
  unpackCardScenarioToEOA,
  unpackCardScenarioToUniversalProfileViaKeyManager,
  unpackCardScenarioToUniversalProfileViaKeyManagerWithMetaTx,
} from "./utils/cardToken";
import { setupTestCardTokenContext, TestCardTokenContext } from "./utils/setup";
import { tokenIdAsBytes32 } from "../utils/cardToken";

import type { CardToken } from "../typechain";
import type { BigNumber } from "ethers";

// NOTE: we do not use a UniversalProfile to own the CardToken so the gas-reporter can show costs per
// function instead rolling it into the `UniversalProfile.execute` entrypoint
(hre.network.name === "hardhat" ? describe : describe.skip)("Gas Costs", () => {
  const tokenSupplyCap = "1000";
  const tokenIdList = [
    "1",
    "2",
    "5",
    "10",
    "20",
    "50",
    "100",
    "200",
    "500",
    tokenSupplyCap,
  ].map((tokenIdAsNumber) => ({
    tokenIdAsNumber,
    tokenId: tokenIdAsBytes32(tokenIdAsNumber),
  }));

  // TODO: roll up data into a table (since its not so nice to read the console.log and the gas
  // reporter for hardhat is mixing all results)
  const buildGasReporter = (scenarioName: string) => {
    const gasUsedList: Array<BigNumber> = [];

    const recordGas = async (
      context: { [key: string]: string },
      txResult: Promise<WaitForTxOnNetworkResult>
    ) => {
      const { txReceipt } = await txResult;
      console.log({ context, gasCost: txReceipt.gasUsed.toString() });

      gasUsedList.push(txReceipt.gasUsed);
    };

    const reportAverageCost = () => {
      const totalGasUsed = gasUsedList.reduce((acc, x) => {
        return acc.add(x);
      }, ethers.BigNumber.from(0));

      const averageGasUsed = totalGasUsed.div(gasUsedList.length);

      console.log(
        "---\n",
        `(${scenarioName}) average gas used: ${averageGasUsed.toString()}`
      );
    };

    return {
      recordGas,
      reportAverageCost,
    };
  };

  describe("CardToken scenarios", () => {
    type Context = {
      accounts: NamedAccountsToSignerMap;
      cardToken: CardToken;
    };
    let context: Context;

    const setupCardToken = async () => {
      const accounts = await getHdWalletAccounts(hre);

      const cardTokenDeployResult = await deployCardToken(
        hre.network.name,
        accounts.owner,
        {
          name: "gas reporter test",
          symbol: "GAS",
          creators: [accounts.athlete.address, accounts.team.address],
          creatorRevenueShares: [90, 10],
          tokenSupplyCap,
          scoreMax: 20,
          scoreMin: 15,
          scoreScale: 1,
          scoreMaxTokenId: tokenSupplyCap,
          isMigrating: false,
        }
      );

      const cardToken = cardTokenDeployResult.contract;

      context = { accounts, cardToken };
    };

    describe("CardToken with EOA receivers", () => {
      before(setupCardToken);

      describe("unpackCard", () => {
        it("should report gas cost for contract function", async () => {
          const { cardToken, accounts } = context;
          const gasContext = buildGasReporter("EOA receiver: unpackCard");

          for (const { tokenId, tokenIdAsNumber } of tokenIdList) {
            await gasContext.recordGas(
              { tokenId, tokenIdAsNumber },
              unpackCardScenarioToEOA(
                cardToken,
                {
                  to: accounts.tokenBuyer.address,
                  tokenId,
                },
                accounts.owner
              )
            );
          }

          gasContext.reportAverageCost();
        });
      });

      describe("transferFrom", () => {
        it("should report gas cost for contract function", async () => {
          const { cardToken, accounts } = context;
          const gasContext = buildGasReporter("EOA receiver: transferFrom");

          const fromAccount = accounts.tokenBuyer;
          const toAccount = accounts.tokenReceiver;

          for (const { tokenId, tokenIdAsNumber } of tokenIdList) {
            await gasContext.recordGas(
              { tokenId, tokenIdAsNumber },
              transferFromScenarioToEOA(
                cardToken,
                {
                  from: fromAccount.address,
                  to: toAccount.address,
                  tokenId,
                },
                fromAccount
              )
            );
          }

          gasContext.reportAverageCost();
        });
      });
    });

    describe("CardToken with UniversalProfile receivers owned by KeyManager", () => {
      let context: TestCardTokenContext;
      before(async () => {
        context = await setupTestCardTokenContext({
          cardTokenParams: { tokenSupplyCap },
        });
      });

      describe("unpackCard", () => {
        it("should report gas cost for contract function", async () => {
          const { cardToken, universalProfiles, keyManagers } = context;
          const gasContext = buildGasReporter(
            "UniversalProfile receiver owned by KeyManager: unpackCard"
          );

          const universalProfile = universalProfiles.owner;
          const keyManager = keyManagers.owner;

          for (const { tokenId, tokenIdAsNumber } of tokenIdList) {
            await gasContext.recordGas(
              { tokenId, tokenIdAsNumber },
              unpackCardScenarioToUniversalProfileViaKeyManager(
                cardToken.contract,
                { to: universalProfiles.tokenBuyer.address, tokenId },
                universalProfile,
                keyManager
              )
            );
          }
        });
      });

      describe("transferFrom", () => {
        it("should report gas cost for contract function", async () => {
          const { cardToken, keyManagers, universalProfiles } = context;
          const gasContext = buildGasReporter(
            "UniversalProfile receiver owned by KeyManager: transferFrom"
          );

          const fromUniversalProfile = universalProfiles.tokenBuyer;
          const toUniversalProfile = universalProfiles.tokenReceiver;
          const keyManager = keyManagers.tokenBuyer;

          for (const { tokenId, tokenIdAsNumber } of tokenIdList) {
            await gasContext.recordGas(
              { tokenId, tokenIdAsNumber },
              transferFromScenarioToUniversalProfileViaKeyManager(
                cardToken.contract,
                {
                  from: fromUniversalProfile.address,
                  to: toUniversalProfile.address,
                  tokenId,
                },
                fromUniversalProfile,
                keyManager
              )
            );
          }

          gasContext.reportAverageCost();
        });
      });
    });

    describe("CardToken with UniversalProfile receivers owned by KeyManager using meta tx", () => {
      let context: TestCardTokenContext;
      before(async () => {
        context = await setupTestCardTokenContext({
          cardTokenParams: { tokenSupplyCap },
        });
      });

      describe("unpackCard", () => {
        it("should report gas cost for contract function", async () => {
          const { accounts, cardToken, universalProfiles, keyManagers } =
            context;
          const gasContext = buildGasReporter(
            "UniversalProfile receiver owned by KeyManager using meta tx: unpackCard"
          );

          const universalProfile = universalProfiles.owner;
          const keyManager = keyManagers.owner;
          const signer = accounts.owner;

          for (const { tokenId, tokenIdAsNumber } of tokenIdList) {
            await gasContext.recordGas(
              { tokenId, tokenIdAsNumber },
              unpackCardScenarioToUniversalProfileViaKeyManagerWithMetaTx(
                cardToken.contract,
                { to: universalProfiles.tokenBuyer.address, tokenId },
                universalProfile,
                keyManager,
                signer
              )
            );
          }
        });
      });

      describe("transferFrom", () => {
        it("should report gas cost for contract function", async () => {
          const { accounts, cardToken, keyManagers, universalProfiles } =
            context;
          const gasContext = buildGasReporter(
            "UniversalProfile receiver owned by KeyManager using meta tx: transferFrom"
          );

          const fromUniversalProfile = universalProfiles.tokenBuyer;
          const toUniversalProfile = universalProfiles.tokenReceiver;
          const keyManager = keyManagers.tokenBuyer;
          const signer = accounts.tokenBuyer;

          for (const { tokenId, tokenIdAsNumber } of tokenIdList) {
            await gasContext.recordGas(
              { tokenId, tokenIdAsNumber },
              transferFromScenarioToUniversalProfileViaKeyManagerWithMetaTx(
                cardToken.contract,
                {
                  from: fromUniversalProfile.address,
                  to: toUniversalProfile.address,
                  tokenId,
                },
                fromUniversalProfile,
                keyManager,
                signer
              )
            );
          }

          gasContext.reportAverageCost();
        });
      });
    });
  });
});
