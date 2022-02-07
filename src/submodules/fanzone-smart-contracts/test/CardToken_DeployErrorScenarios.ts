import hre from "hardhat";
import { expect } from "chai";

import { deployCardToken, CardTokenDeployParams } from "../utils/deployers";
import {
  getHdWalletAccounts,
  NamedAccountsToSignerMap,
} from "../utils/hdwallet";

(hre.network.name === "hardhat" ? describe : describe.skip)(
  "CardToken - Deployment Error Scenarios",
  () => {
    let accounts: NamedAccountsToSignerMap;
    before(async () => {
      accounts = await getHdWalletAccounts(hre);
    });

    const buildValidDeployParams = (): CardTokenDeployParams => ({
      name: "error scenarios",
      symbol: "BANG",
      creators: [accounts.athlete.address],
      creatorRevenueShares: [100],
      tokenSupplyCap: 10,
      scoreMin: 15,
      scoreMax: 20,
      scoreScale: 1,
      scoreMaxTokenId: 5,
      isMigrating: false,
    });

    describe("CreatorsRequired", async () => {
      it("should fail to deploy", async () => {
        const deployParams: CardTokenDeployParams = {
          ...buildValidDeployParams(),
          name: "creators.length === 0",
          creators: [],
        };

        await expect(
          deployCardToken(hre.network.name, accounts.owner, deployParams)
        ).to.be.revertedWith("CardToken: CreatorsRequired");
      });
    });

    describe("CreatorsShareSize", async () => {
      it("should fail to deploy", async () => {
        const deployParams: CardTokenDeployParams = {
          ...buildValidDeployParams(),
          name: "creatorRevenueShares.length != creators.length",
          creators: [accounts.athlete.address, accounts.team.address],
          creatorRevenueShares: [100],
        };

        await expect(
          deployCardToken(hre.network.name, accounts.owner, deployParams)
        ).to.be.revertedWith("CardToken: CreatorsShareSize");
      });
    });

    describe("CreatorsRevenueShareSum", async () => {
      it("should fail to deploy", async () => {
        const deployParams: CardTokenDeployParams = {
          ...buildValidDeployParams(),
          name: "sum(creatorRevenueShares) !== 100",
          creators: [accounts.athlete.address, accounts.team.address],
          creatorRevenueShares: [100, 10],
        };

        await expect(
          deployCardToken(hre.network.name, accounts.owner, deployParams)
        ).to.be.revertedWith("CardToken: CreatorsRevenueShareSum");
      });
    });

    describe("TokenSupplyCapRequired", async () => {
      it("should fail to deploy", async () => {
        const deployParams: CardTokenDeployParams = {
          ...buildValidDeployParams(),
          name: "tokenSupplyCap === 0",
          tokenSupplyCap: 0,
        };

        await expect(
          deployCardToken(hre.network.name, accounts.owner, deployParams)
        ).to.be.revertedWith("LSP8CappedSupply: tokenSupplyCap is zero");
      });
    });

    describe("ScoreMinMaxRange", async () => {
      it("should fail to deploy", async () => {
        const deployParams: CardTokenDeployParams = {
          ...buildValidDeployParams(),
          name: "scoreMin > scoreMax",
          scoreMin: 11,
          scoreMax: 1,
        };

        await expect(
          deployCardToken(hre.network.name, accounts.owner, deployParams)
        ).to.be.revertedWith("CardToken: ScoreMinMaxRange");
      });
    });

    describe("ScoreScaleZero", async () => {
      it("should fail to deploy", async () => {
        const deployParams: CardTokenDeployParams = {
          ...buildValidDeployParams(),
          name: "scoreScale === 0",
          scoreScale: 0,
        };

        await expect(
          deployCardToken(hre.network.name, accounts.owner, deployParams)
        ).to.be.revertedWith("CardToken: ScoreScaleZero");
      });
    });

    describe("ScoreMaxTokenIdZero", async () => {
      it("should fail to deploy", async () => {
        const deployParams: CardTokenDeployParams = {
          ...buildValidDeployParams(),
          name: "scoreMaxTokenId === 0",
          scoreMaxTokenId: 0,
        };

        await expect(
          deployCardToken(hre.network.name, accounts.owner, deployParams)
        ).to.be.revertedWith("CardToken: ScoreMaxTokenIdZero");
      });
    });

    describe("ScoreMaxTokenIdLargerThanSupplyCap", async () => {
      it("should fail to deploy", async () => {
        const deployParams: CardTokenDeployParams = {
          ...buildValidDeployParams(),
          name: "scoreMaxTokenId > tokenSupplyCap",
          tokenSupplyCap: 10,
          scoreMaxTokenId: 11,
        };

        await expect(
          deployCardToken(hre.network.name, accounts.owner, deployParams)
        ).to.be.revertedWith("CardToken: ScoreMaxTokenIdLargerThanSupplyCap");
      });
    });
  }
);
