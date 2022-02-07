import hre from "hardhat";
import { expect } from "chai";
import { ethers } from "ethers";

import {
  LSPMappings,
  getSchemaKey,
  fetchLSP5Data,
  isFetchDataForSchemaResultList,
} from "../utils/LSPSchema";
import { executeCallToUniversalProfileViaKeyManager } from "../utils/universalProfile";
import {
  getTimeoutForNetwork,
  setupTestCardTokenContext,
  TestCardTokenContext,
} from "./utils/setup";
import {
  unpackCardScenarioToUniversalProfileViaKeyManager,
  transferFromScenarioToUniversalProfileViaKeyManager,
  transferFromScenarioToEOA,
  UnpackCardTxParams,
  TransferFromTxParams,
  encodeUnpackCardTxDataForUniversalProfile,
  CreateMetadataForTxParams,
  encodeCreateMetadataForTxDataForUniversalProfile,
} from "./utils/cardToken";
import { waitForTxOnNetwork, WaitForTxOnNetworkResult } from "../utils/network";
import { tokenIdAsBytes32 } from "../utils/cardToken";

import type { BytesLike } from "ethers";
import type { CardToken, ERC725Y } from "../typechain";

describe("CardToken", function () {
  mocha.suite.timeout(getTimeoutForNetwork(hre.network.name));

  // NOTE: to prevent confusion with using one deployed CardToken, the named tokenIds are defined
  // here.. `finalTokenId` is used as the `tokenSupplyCap` param for the CardToken deploy
  type TokenIdMap = {
    sendToEOA: BytesLike;
    sendToUniversalProfile: BytesLike;
    finalTokenId: BytesLike;
  };
  const tokenIdMap: TokenIdMap = {
    sendToEOA: tokenIdAsBytes32("1"),
    sendToUniversalProfile: tokenIdAsBytes32("2"),
    finalTokenId: tokenIdAsBytes32("3"),
  };

  let context: TestCardTokenContext;
  before(async () => {
    context = await setupTestCardTokenContext({
      cardTokenParams: { tokenSupplyCap: tokenIdMap.finalTokenId },
    });
  });

  let snapshot: number;
  beforeEach(async () => {
    snapshot = await hre.ethers.provider.send("evm_snapshot", []);
  });

  afterEach(async () => {
    await hre.ethers.provider.send("evm_revert", [snapshot]);
  });

  describe("owner", async () => {
    it("should return the owner address", async () => {
      const { universalProfiles, cardToken } = context;

      const owner = await cardToken.contract.owner();
      expect(ethers.utils.getAddress(owner)).to.eq(
        ethers.utils.getAddress(universalProfiles.owner.address),
        "contract starts being owned by UniversalProfile of owner accounts"
      );
    });
  });

  describe("name", async () => {
    it("should return the token name", async () => {
      const { cardToken } = context;

      const name = await cardToken.contract.name();
      expect(name).to.eq(cardToken.deployParams.name, "can query token name");
    });
  });

  describe("symbol", async () => {
    it("should return the token symbol", async () => {
      const { cardToken } = context;

      const symbol = await cardToken.contract.symbol();
      expect(symbol).to.eq(
        cardToken.deployParams.symbol,
        "can query token symbol"
      );
    });
  });

  describe("getData", () => {
    it("should allow querying the inherited ERC725Y store", async () => {
      const { cardToken } = context;

      const [metadata] = await cardToken.contract.getData([
        getSchemaKey("SupportedStandards:LSP4DigitalAsset"),
      ]);
      expect(metadata).to.eq(
        "0xa4d96624",
        "SupportedStandards:LSP4DigitalAsset should be set"
      );
    });
  });

  describe("totalSupply", async () => {
    it("should return the amount of cards that have been minted", async () => {
      const { cardToken } = context;

      const totalSupply = await cardToken.contract.totalSupply();
      expect(totalSupply).to.eq(
        ethers.BigNumber.from(0),
        "contract starts with zero minted tokens"
      );
    });
  });

  describe("tokenSupplyCap", () => {
    it("should return the amount of cards that can be minted", async () => {
      const { cardToken } = context;

      const tokenSupplyCap = await cardToken.contract.tokenSupplyCap();
      expect(tokenSupplyCap).to.eq(
        cardToken.deployParams.tokenSupplyCap,
        "contract tokenSupplyCap shows amount of tokens that can be minted"
      );
    });
  });

  describe("mintableSupply", () => {
    it("should return the amount of cards that can still be minted", async () => {
      const { cardToken } = context;

      const mintableSupply = await cardToken.contract.mintableSupply();
      expect(mintableSupply).to.eq(
        ethers.BigNumber.from(cardToken.deployParams.tokenSupplyCap),
        "contract starts with `deployParams.tokenSupplyCap` available tokens"
      );
    });
  });

  describe("calculateScore", () => {
    describe("when tokenId is invalid", () => {
      describe("when tokenId is zero", () => {
        it("should fail", async () => {
          const { cardToken } = context;

          const tokenId = tokenIdAsBytes32("0");
          await expect(
            cardToken.contract.calculateScore(tokenId)
          ).to.be.revertedWith("CardToken: invalid tokenId");
        });
      });

      describe("when tokenId is greater than token supply cap", () => {
        it("should fail", async () => {
          const { cardToken } = context;

          const tokenId = tokenIdAsBytes32(
            ethers.BigNumber.from(cardToken.deployParams.tokenSupplyCap).add(
              "1"
            )
          );
          await expect(
            cardToken.contract.calculateScore(tokenId)
          ).to.be.revertedWith("CardToken: invalid tokenId");
        });
      });
    });

    describe("when tokenId is valid", () => {
      describe("when tokenId is one", async () => {
        it("should allow querying what the score will be for a given tokenId", async () => {
          const { cardToken } = context;

          const tokenId = tokenIdAsBytes32(ethers.BigNumber.from("1"));
          // magic value, based on current implementation of card token scoring
          const expectedScore = "20.00";

          const score = await cardToken.contract.calculateScore(tokenId);
          expect(score).to.eq(
            expectedScore,
            "can query for score based on tokenId"
          );
        });
      });

      describe("when tokenId is equal to token supply cap", async () => {
        it("should allow querying what the score will be for a given tokenId", async () => {
          const { cardToken } = context;

          const tokenId = tokenIdAsBytes32(
            ethers.BigNumber.from(cardToken.deployParams.tokenSupplyCap)
          );
          // magic value, based on current implementation of card token scoring
          const expectedScore = "15.56";

          const score = await cardToken.contract.calculateScore(tokenId);
          expect(score).to.eq(
            expectedScore,
            "can query for score based on tokenId"
          );
        });
      });
    });
  });

  describe("unpackCard", () => {
    const unpackCardSuccessScenario = async (
      txParams: UnpackCardTxParams,
      sendTransaction: () => Promise<WaitForTxOnNetworkResult>
    ) => {
      const { cardToken } = context;

      // pre-conditions
      const [preAllTokenHolders] = await Promise.all([
        // TODO: only here to satisfy LSP4DigitalCertificate `tokenHolders`
        cardToken.contract.allTokenHolders(),
      ]);
      expect(
        preAllTokenHolders.includes(
          ethers.utils.hexZeroPad(txParams.to.toLowerCase(), 32)
        )
      ).to.eq(false, "to address begins without any tokens");

      // effects
      await sendTransaction();

      // post-conditions
      const [postAllTokenHolders] = await Promise.all([
        // TODO: only here to satisfy LSP4DigitalCertificate `tokenHolders`
        cardToken.contract.allTokenHolders(),
      ]);
      expect(
        postAllTokenHolders.includes(
          ethers.utils.hexZeroPad(txParams.to.toLowerCase(), 32)
        )
      ).to.eq(true, "to is included in allTokenHolders");
    };

    const unpackCardErrorScenario = async (
      _txParams: UnpackCardTxParams,
      sendTransaction: () => Promise<WaitForTxOnNetworkResult>,
      expectedError: string,
      mintableSupplyCheck: boolean = true
    ) => {
      const { cardToken } = context;

      // pre-conditions
      const [preTokenSupply, preMintableSupply] = await Promise.all([
        cardToken.contract.totalSupply(),
        cardToken.contract.mintableSupply(),
      ]);

      if (mintableSupplyCheck) {
        expect(preMintableSupply.gt(0)).to.eq(
          true,
          "must start with mintableSupply"
        );
      }

      // effects
      await expect(sendTransaction()).to.be.revertedWith(expectedError);

      // post-conditions
      const [postTokenSupply, postMintableSupply] = await Promise.all([
        cardToken.contract.totalSupply(),
        cardToken.contract.mintableSupply(),
      ]);

      expect(postTokenSupply).to.eq(
        preTokenSupply,
        "failure to unpack a card leaves totalSupply unchanged"
      );
      expect(postMintableSupply).to.eq(
        preMintableSupply,
        "failure to unpack a card leaves mintableSupply unchanged"
      );
    };

    describe("when non-owner sends tx", () => {
      it("should fail", async () => {
        const { cardToken, accounts, universalProfiles } = context;

        const txParams = {
          to: universalProfiles.tokenReceiver.address,
          tokenId: tokenIdMap.finalTokenId,
        };
        await unpackCardErrorScenario(
          txParams,
          () =>
            waitForTxOnNetwork(
              hre.network.name,
              cardToken.contract
                .connect(accounts.anyone)
                .unpackCard(txParams.to, txParams.tokenId)
            ),
          "Ownable: caller is not the owner"
        );
      });
    });

    describe("when owner sends tx", () => {
      describe("successful txs", () => {
        it("should successfully mint a token to a non-contract address", async () => {
          const { accounts, cardToken, keyManagers, universalProfiles } =
            context;

          const txParams = {
            to: accounts.tokenBuyer.address,
            tokenId: tokenIdMap.sendToEOA,
          };
          await unpackCardSuccessScenario(txParams, () =>
            unpackCardScenarioToUniversalProfileViaKeyManager(
              cardToken.contract,
              txParams,
              universalProfiles.owner,
              keyManagers.owner
            )
          );
        });

        it("should successfully mint a token to a UniversalProfile address", async () => {
          const { cardToken, keyManagers, universalProfiles } = context;

          // pre-conditions
          const [preReceivedAssets] = await fetchLSP5Data(
            universalProfiles.tokenBuyer as ERC725Y
          );
          if (!isFetchDataForSchemaResultList(preReceivedAssets)) {
            throw new Error("preReceivedAssets was not a list");
          } else {
            expect(
              preReceivedAssets.listEntries
                .map((x) => x.value)
                .includes(cardToken.contract.address.toLowerCase())
            ).to.eq(
              false,
              "UniversalProfile does not own token before minting"
            );
          }

          const cardTokenReceivedAssetsMapKey =
            LSPMappings.LSP5ReceivedAssetsMap.buildKey(
              cardToken.contract.address
            );
          const [preReceivedAssetsMapCardTokenValue] =
            await universalProfiles.tokenBuyer.getData([
              cardTokenReceivedAssetsMapKey,
            ]);
          expect(preReceivedAssetsMapCardTokenValue).to.eq(
            "0x",
            "UniversalProfile does not own token before minting"
          );

          // effects
          const txParams = {
            to: universalProfiles.tokenBuyer.address,
            tokenId: tokenIdMap.sendToUniversalProfile,
          };
          await unpackCardSuccessScenario(txParams, () =>
            unpackCardScenarioToUniversalProfileViaKeyManager(
              cardToken.contract,
              txParams,
              universalProfiles.owner,
              keyManagers.owner
            )
          );

          // post-conditions
          const [postReceivedAssets] = await fetchLSP5Data(
            universalProfiles.tokenBuyer as ERC725Y
          );
          if (!isFetchDataForSchemaResultList(postReceivedAssets)) {
            throw new Error("postReceivedAssets was not a list");
          } else {
            expect(
              postReceivedAssets.listEntries
                .map((x) => x.value)
                .includes(cardToken.contract.address.toLowerCase())
            ).to.eq(true, "UniversalProfile does own token after minting");
          }

          const [postReceivedAssetsMapCardTokenValue] =
            await universalProfiles.tokenBuyer.getData([
              cardTokenReceivedAssetsMapKey,
            ]);
          expect(postReceivedAssetsMapCardTokenValue).to.eq(
            // bytes8(index) + bytes4(ERC165 interface id for LSP8)
            "0x000000000000000049399145",
            "UniversalProfile does own token after minting"
          );
        });
      });

      describe("reverting txs", () => {
        it("should error when tokenId has already been minted", async () => {
          const { accounts, cardToken, keyManagers, universalProfiles } =
            context;

          const txParams = {
            to: accounts.tokenReceiver.address,
            tokenId: tokenIdMap.sendToEOA,
          };

          await unpackCardScenarioToUniversalProfileViaKeyManager(
            cardToken.contract,
            txParams,
            universalProfiles.owner,
            keyManagers.owner
          );

          const sendTransaction = () =>
            waitForTxOnNetwork(
              hre.network.name,
              executeCallToUniversalProfileViaKeyManager(
                keyManagers.owner,
                encodeUnpackCardTxDataForUniversalProfile(
                  cardToken.contract,
                  txParams,
                  universalProfiles.owner
                )
              )
            );
          await unpackCardErrorScenario(
            txParams,
            sendTransaction,
            "LSP8: tokenId already minted"
          );
        });

        it("should error when tokenId is zero", async () => {
          const { accounts, cardToken, keyManagers, universalProfiles } =
            context;

          const txParams = {
            to: accounts.tokenReceiver.address,
            tokenId: tokenIdAsBytes32("0"),
          };

          const sendTransaction = () =>
            waitForTxOnNetwork(
              hre.network.name,
              executeCallToUniversalProfileViaKeyManager(
                keyManagers.owner,
                encodeUnpackCardTxDataForUniversalProfile(
                  cardToken.contract,
                  txParams,
                  universalProfiles.owner
                )
              )
            );
          await unpackCardErrorScenario(
            txParams,
            sendTransaction,
            "CardToken: invalid tokenId"
          );
        });

        it("should error when tokenId is greater than tokenSupplyCap", async () => {
          const { accounts, cardToken, keyManagers, universalProfiles } =
            context;

          const txParams = {
            to: accounts.tokenReceiver.address,
            tokenId: tokenIdAsBytes32(
              ethers.BigNumber.from(cardToken.deployParams.tokenSupplyCap).add(
                1
              )
            ),
          };

          const sendTransaction = () =>
            waitForTxOnNetwork(
              hre.network.name,
              executeCallToUniversalProfileViaKeyManager(
                keyManagers.owner,
                encodeUnpackCardTxDataForUniversalProfile(
                  cardToken.contract,
                  txParams,
                  universalProfiles.owner
                )
              )
            );
          await unpackCardErrorScenario(
            txParams,
            sendTransaction,
            "CardToken: invalid tokenId"
          );
        });

        it("should error when there is no more mintableSupply", async () => {
          const { accounts, cardToken, keyManagers, universalProfiles } =
            context;

          // mint all tokens
          const allTokenIds = Object.keys(tokenIdMap);
          for (let i = 0; i < allTokenIds.length; i++) {
            await unpackCardScenarioToUniversalProfileViaKeyManager(
              cardToken.contract,
              {
                to: accounts.tokenReceiver.address,
                tokenId: tokenIdMap[allTokenIds[i] as keyof typeof tokenIdMap],
              },
              universalProfiles.owner,
              keyManagers.owner
            );
          }

          // pre-conditions
          const preMintableSupply = await cardToken.contract.mintableSupply();
          expect(preMintableSupply).to.eq(
            0,
            "must start with no mintableSupply"
          );

          // effects
          const txParams = {
            to: accounts.anyone.address,
            tokenId: tokenIdMap.finalTokenId,
          };

          const sendTransaction = () =>
            waitForTxOnNetwork(
              hre.network.name,
              executeCallToUniversalProfileViaKeyManager(
                keyManagers.owner,
                encodeUnpackCardTxDataForUniversalProfile(
                  cardToken.contract,
                  txParams,
                  universalProfiles.owner
                )
              )
            );
          await unpackCardErrorScenario(
            txParams,
            sendTransaction,
            "LSP8CappedSupply: tokenSupplyCap reached",
            false
          );
        });
      });
    });
  });

  describe("transferFrom", () => {
    const transferLastTokenScenario = async (
      txParams: TransferFromTxParams,
      sendTransaction: () => Promise<WaitForTxOnNetworkResult>
    ) => {
      const { cardToken } = context;

      // pre-conditions
      const [preBalanceOfFrom, preAllTokenHolders] = await Promise.all([
        cardToken.contract.balanceOf(txParams.from),
        // TODO: only here to satisfy LSP4DigitalCertificate `tokenHolders`
        cardToken.contract.allTokenHolders(),
      ]);

      expect(preBalanceOfFrom).to.eq(1, "from should start with one token");
      expect(
        preAllTokenHolders.includes(
          ethers.utils.hexZeroPad(txParams.from.toLowerCase(), 32)
        )
      ).to.eq(true, "from address should start as a token holder");

      // effects
      await sendTransaction();

      // post-conditions
      const [postBalanceOfFrom, postAllTokenHolders] = await Promise.all([
        cardToken.contract.balanceOf(txParams.from),
        // TODO: only here to satisfy LSP4DigitalCertificate `tokenHolders`
        cardToken.contract.allTokenHolders(),
      ]);
      expect(postBalanceOfFrom).to.eq(
        0,
        "from address should end with no tokens"
      );
      expect(
        postAllTokenHolders.includes(
          ethers.utils.hexZeroPad(txParams.from.toLowerCase(), 32)
        )
      ).to.eq(false, "from address should end as not a token holder");
    };

    describe("when transfering the last token from a UniversalProfile address", () => {
      it("should clean metadata about the tokenOwner address", async () => {
        const { cardToken, keyManagers, universalProfiles } = context;

        const fromKeyManager = keyManagers.tokenBuyer;
        const fromUniversalProfile = universalProfiles.tokenBuyer;
        const txParams = {
          from: fromUniversalProfile.address,
          to: universalProfiles.tokenReceiver.address,
          tokenId: tokenIdMap.sendToUniversalProfile,
        };

        const cardTokenReceivedAssetsMapKey =
          LSPMappings.LSP5ReceivedAssetsMap.buildKey(
            cardToken.contract.address
          );

        await unpackCardScenarioToUniversalProfileViaKeyManager(
          cardToken.contract,
          {
            to: txParams.from,
            tokenId: txParams.tokenId,
          },
          universalProfiles.owner,
          keyManagers.owner
        );

        // pre-conditions
        const [preReceivedAssets] = await fetchLSP5Data(
          fromUniversalProfile as ERC725Y
        );
        if (!isFetchDataForSchemaResultList(preReceivedAssets)) {
          throw new Error("preReceivedAssets was not a list");
        } else {
          expect(
            preReceivedAssets.listEntries
              .map((x) => x.value)
              .includes(cardToken.contract.address.toLowerCase())
          ).to.eq(true, "UniversalProfile does own token before transfering");
        }

        const [preReceivedAssetsMapCardTokenValue] =
          await fromUniversalProfile.getData([cardTokenReceivedAssetsMapKey]);
        expect(preReceivedAssetsMapCardTokenValue).to.eq(
          // bytes8(index) + bytes4(ERC165 interface id for LSP8)
          "0x000000000000000049399145",
          "UniversalProfile does own token before transfering"
        );

        await transferLastTokenScenario(txParams, () =>
          transferFromScenarioToUniversalProfileViaKeyManager(
            cardToken.contract,
            txParams,
            fromUniversalProfile,
            fromKeyManager
          )
        );

        // post-conditions
        const [postReceivedAssets] = await fetchLSP5Data(
          fromUniversalProfile as ERC725Y
        );
        if (!isFetchDataForSchemaResultList(postReceivedAssets)) {
          throw new Error("postReceivedAssets was not a list");
        } else {
          expect(
            postReceivedAssets.listEntries
              .map((x) => x.value)
              .includes(cardToken.contract.address.toLowerCase())
          ).to.eq(
            false,
            "UniversalProfile does not own token after transfering"
          );
        }

        const [postReceivedAssetsMapCardTokenValue] =
          await fromUniversalProfile.getData([cardTokenReceivedAssetsMapKey]);
        expect(postReceivedAssetsMapCardTokenValue).to.eq(
          "0x",
          "UniversalProfile does not own token after transfering"
        );
      });
    });

    describe("when transfering the last token from an account address", () => {
      it("should clean metadata about the tokenOwner address", async () => {
        const { cardToken, accounts, keyManagers, universalProfiles } = context;

        const fromAccount = accounts.tokenBuyer;
        const txParams = {
          from: fromAccount.address,
          to: accounts.tokenReceiver.address,
          tokenId: tokenIdMap.sendToEOA,
        };
        await unpackCardScenarioToUniversalProfileViaKeyManager(
          cardToken.contract,
          {
            to: txParams.from,
            tokenId: txParams.tokenId,
          },
          universalProfiles.owner,
          keyManagers.owner
        );

        await transferLastTokenScenario(txParams, () =>
          transferFromScenarioToEOA(cardToken.contract, txParams, fromAccount)
        );
      });
    });
  });

  describe("createMetadataAddressFor", () => {
    const createMetadataForErrorScenario = async (
      cardToken: CardToken,
      txParams: CreateMetadataForTxParams,
      sendTransaction: () => Promise<WaitForTxOnNetworkResult>,
      expectedError: string
    ) => {
      // pre-conditions
      try {
        const preMetadataAddressOf = await cardToken.metadataAddressOf(
          txParams.tokenId
        );

        throw new Error(
          `tokenId ${txParams.tokenId} metadata already exists ${preMetadataAddressOf}`
        );
      } catch (error: any) {
        const expectedError =
          "LSP8Metadata: metadata query for nonexistent token";
        if (error.message.indexOf(expectedError) === -1) {
          throw error;
        }
      }

      // effects
      await expect(sendTransaction()).to.be.revertedWith(expectedError);
    };

    describe("when owner sends tx", () => {
      describe("reverting txs", () => {
        describe("when tokenId is zero", () => {
          it("should fail to create metadata", async () => {
            const { cardToken, keyManagers, universalProfiles } = context;

            const txParams = {
              tokenId: tokenIdAsBytes32("0"),
            };

            const sendTransaction = () =>
              waitForTxOnNetwork(
                hre.network.name,
                executeCallToUniversalProfileViaKeyManager(
                  keyManagers.owner,
                  encodeCreateMetadataForTxDataForUniversalProfile(
                    cardToken.contract,
                    txParams,
                    universalProfiles.owner
                  )
                )
              );
            await createMetadataForErrorScenario(
              cardToken.contract,
              txParams,
              sendTransaction,
              "CardToken: invalid tokenId"
            );
          });
        });

        describe("when tokenId is greater than tokenSupplyCap", () => {
          it("should fail to create metadata", async () => {
            const { cardToken, keyManagers, universalProfiles } = context;

            const txParams = {
              tokenId: tokenIdAsBytes32(
                ethers.BigNumber.from(tokenIdMap.finalTokenId).add(1)
              ),
            };

            const sendTransaction = () =>
              waitForTxOnNetwork(
                hre.network.name,
                executeCallToUniversalProfileViaKeyManager(
                  keyManagers.owner,
                  encodeCreateMetadataForTxDataForUniversalProfile(
                    cardToken.contract,
                    txParams,
                    universalProfiles.owner
                  )
                )
              );
            await createMetadataForErrorScenario(
              cardToken.contract,
              txParams,
              sendTransaction,
              "CardToken: invalid tokenId"
            );
          });
        });
      });

      describe("successful txs", () => {
        describe("when tokenId has been minted", () => {
          it("should create a new ERC725Y contract for a tokenId", async () => {
            const { cardToken, keyManagers, universalProfiles } = context;

            const txParams = {
              tokenId: tokenIdMap.sendToUniversalProfile,
            };

            await unpackCardScenarioToUniversalProfileViaKeyManager(
              cardToken.contract,
              {
                to: universalProfiles.tokenBuyer.address,
                tokenId: txParams.tokenId,
              },
              universalProfiles.owner,
              keyManagers.owner
            );

            // pre-conditions
            const [preMetadataAddressOf] = await Promise.all([
              cardToken.contract.metadataAddressOf(txParams.tokenId),
            ]);
            expect(preMetadataAddressOf).to.eq(
              ethers.constants.AddressZero,
              "tokenId starts with no metadata"
            );

            // effect
            const txResult = await waitForTxOnNetwork(
              hre.network.name,
              executeCallToUniversalProfileViaKeyManager(
                keyManagers.owner,
                encodeCreateMetadataForTxDataForUniversalProfile(
                  cardToken.contract,
                  txParams,
                  universalProfiles.owner
                )
              )
            );

            // post-conditions
            const [postMetadataAddressOf] = await Promise.all([
              cardToken.contract.metadataAddressOf(txParams.tokenId),
            ]);
            expect(postMetadataAddressOf).to.not.eq(
              ethers.constants.AddressZero,
              "tokenId finishes with metadata"
            );
            await expect(txResult.sentTx)
              .to.emit(cardToken.contract, "MetadataAddressCreated")
              .withArgs(txParams.tokenId, postMetadataAddressOf);
          });

          it("should not create a new ERC725Y if a tokenId already has a metadata contract", async () => {
            const { cardToken, keyManagers, universalProfiles } = context;

            const txParams = {
              tokenId: tokenIdMap.sendToUniversalProfile,
            };

            await unpackCardScenarioToUniversalProfileViaKeyManager(
              cardToken.contract,
              {
                to: universalProfiles.tokenBuyer.address,
                tokenId: txParams.tokenId,
              },
              universalProfiles.owner,
              keyManagers.owner
            );
            await executeCallToUniversalProfileViaKeyManager(
              keyManagers.owner,
              encodeCreateMetadataForTxDataForUniversalProfile(
                cardToken.contract,
                txParams,
                universalProfiles.owner
              )
            );

            // pre-conditions
            const [preMetadataOf] = await Promise.all([
              cardToken.contract.metadataAddressOf(txParams.tokenId),
            ]);

            expect(preMetadataOf).to.not.eq(
              ethers.constants.AddressZero,
              "tokenId starts with metadata"
            );

            // effects
            await waitForTxOnNetwork(
              hre.network.name,
              executeCallToUniversalProfileViaKeyManager(
                keyManagers.owner,
                encodeCreateMetadataForTxDataForUniversalProfile(
                  cardToken.contract,
                  txParams,
                  universalProfiles.owner
                )
              )
            );

            // post-conditions
            const [postMetadataOf] = await Promise.all([
              cardToken.contract.metadataAddressOf(txParams.tokenId),
            ]);

            expect(postMetadataOf).to.eq(
              preMetadataOf,
              "tokenId finishes with same metadata"
            );
          });
        });
      });
    });
  });

  describe("migrateCard", () => {
    // TODO: add some scenarios
  });
});
