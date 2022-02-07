import hre from "hardhat";
import { expect } from "chai";
import { ethers } from "ethers";

import cardScoreFixtures, { CardScoreFixtures } from "./fixtures/cardScore";
import {
  getHdWalletAccounts,
  NamedAccountsToSignerMap,
} from "../utils/hdwallet";
import { deployCardToken, CardTokenDeployResult } from "../utils/deployers";
import { tokenIdAsBytes32 } from "../utils/cardToken";

const calculateScore = (
  tokenSupply: number,
  scoreMin: number,
  scoreMax: number,
  scoreScale: number,
  tokenId: number
) => {
  let scoreMinScaled = scoreMin / scoreScale;
  let scoreMaxScaled = scoreMax / scoreScale;

  let x1 = scoreMaxScaled - scoreMinScaled;
  let x2 = Math.pow(tokenSupply / 10, 2);
  let x_1_2 = x1 / x2;

  let x3 = tokenId / 10 - 0.1;
  let x4 = tokenSupply / 10;
  let x_3_4 = Math.pow(x3 - x4, 2);

  let x5 = scoreMinScaled;

  let x_final = x_1_2 * x_3_4 + x5;

  return x_final.toFixed(2);
};

(hre.network.name === "local-testnet" ? describe : describe.skip)(
  "CardToken - Scores",
  function () {
    mocha.suite.timeout(2 * 60 * 1000);

    let accounts: NamedAccountsToSignerMap;
    before(async () => {
      accounts = await getHdWalletAccounts(hre);
    });

    describe("when using pre-calculated scores", () => {
      for (const fixtureName of Object.keys(cardScoreFixtures)) {
        const fixture =
          cardScoreFixtures[fixtureName as keyof CardScoreFixtures];

        describe(`when scoring card set "${fixtureName}"`, () => {
          let deployedCardToken: CardTokenDeployResult;
          before(async () => {
            // dont need to set any metadata via ERC725Y, only need a CardToken
            deployedCardToken = await deployCardToken(
              hre.network.name,
              accounts.owner,
              {
                name: fixtureName,
                symbol: "NFT",
                creators: [accounts.athlete.address],
                creatorRevenueShares: [100],
                tokenSupplyCap: fixture.tokenSupplyCap,
                scoreMin: fixture.scoreMin,
                scoreMax: fixture.scoreMax,
                scoreScale: fixture.scoreScale,
                scoreMaxTokenId: fixture.tokenSupplyCap,
                isMigrating: false,
              }
            );
          });

          it("should match the fixture scores", async () => {
            let hadError = false;

            await Promise.all(
              Object.keys(fixture.scoreMap).map(async (tokenId) => {
                const expectedScore = fixture.scoreMap[tokenId];
                const score = await deployedCardToken.contract.calculateScore(
                  tokenIdAsBytes32(tokenId)
                );

                try {
                  expect(score).to.eq(
                    expectedScore,
                    `calculateScore should match fixture score for tokenId ${tokenId} in ${fixtureName}`
                  );

                  expect(score).to.eq(
                    calculateScore(
                      fixture.tokenSupplyCap,
                      fixture.scoreMin,
                      fixture.scoreMax,
                      fixture.scoreScale,
                      parseInt(tokenId, 10)
                    ),
                    `calculateScore should match js score for tokenId ${tokenId} in ${fixtureName}`
                  );
                } catch (error: any) {
                  console.log(error.message);
                  hadError = true;
                }
              })
            );

            if (hadError) {
              throw new Error(`scoring mismatch in card set ${fixtureName}`);
            }
          });
        });
      }
    });

    describe("when deploy param scoreMaxTokenId is different than tokenSupplyCap", () => {
      let deployedCardToken: CardTokenDeployResult;

      before(async () => {
        deployedCardToken = await deployCardToken(
          hre.network.name,
          accounts.owner,
          {
            name: "alternative scoring",
            symbol: "NFT",
            creators: [accounts.athlete.address],
            creatorRevenueShares: [100],
            tokenSupplyCap: 100,
            scoreMin: 15,
            scoreMax: 20,
            scoreScale: 10,
            scoreMaxTokenId: 50,
            isMigrating: false,
          }
        );
      });

      describe("when tokenId is less than or equal to scoreMaxTokenId", () => {
        it("should return a score using the calculation", async () => {
          const { deployParams, contract: cardToken } = deployedCardToken;

          await Promise.all(
            [
              ethers.BigNumber.from("1"),
              ethers.BigNumber.from(deployParams.scoreMaxTokenId).sub(1),
              ethers.BigNumber.from(deployParams.scoreMaxTokenId),
            ].map(async (tokenId) => {
              const expectedScore = calculateScore(
                ethers.BigNumber.from(deployParams.tokenSupplyCap).toNumber(),
                ethers.BigNumber.from(deployParams.scoreMin).toNumber(),
                ethers.BigNumber.from(deployParams.scoreMax).toNumber(),
                ethers.BigNumber.from(deployParams.scoreScale).toNumber(),
                tokenId.toNumber()
              );
              const score = await cardToken.calculateScore(
                tokenIdAsBytes32(tokenId)
              );

              expect(score).to.eq(
                expectedScore,
                `calculateScore should match expectedScore for tokenId ${tokenId}`
              );
            })
          );
        });
      });

      describe("when tokenId is equal to scoreMaxTokenId", () => {
        it("should return a constant score using scoreMin value", async () => {
          const { deployParams, contract: cardToken } = deployedCardToken;

          await Promise.all(
            [
              ethers.BigNumber.from(deployParams.scoreMaxTokenId).add(1),
              ethers.BigNumber.from(deployParams.tokenSupplyCap),
            ].map(async (tokenId) => {
              const expectedScore = (
                ethers.BigNumber.from(deployParams.scoreMin).toNumber() /
                ethers.BigNumber.from(deployParams.scoreScale).toNumber()
              ).toFixed(2);
              const score = await cardToken.calculateScore(
                tokenIdAsBytes32(tokenId)
              );

              expect(score).to.eq(
                expectedScore,
                `calculateScore should match expectedScore for tokenId ${tokenId}`
              );
            })
          );
        });
      });
    });
  }
);
