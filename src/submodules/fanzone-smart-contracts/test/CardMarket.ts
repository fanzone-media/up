import hre from "hardhat";
import { expect } from "chai";
import { ethers } from "ethers";

import {
  getTimeoutForNetwork,
  setupTestCardMarketContext,
  TestCardMarketContext,
} from "./utils/setup";
import { tokenIdAsBytes32 } from "../utils/cardToken";
import {
  getBalanceOfAcceptedToken,
  parseMarketState,
  prepareMarket,
  prepareToBuyWithToken,
} from "./utils/cardMarket";

import type { BigNumber, BytesLike } from "ethers";
import type { Address, SignerWithAddress } from "../utils/types";

describe("CardMarket", function () {
  mocha.suite.timeout(getTimeoutForNetwork(hre.network.name));

  type TokenIdMap = {
    withMarket: BytesLike;
    noMarket: BytesLike;
    doesNotExist: BytesLike;
  };
  const tokenIdMap: TokenIdMap = {
    withMarket: tokenIdAsBytes32("1"),
    noMarket: tokenIdAsBytes32("2"),
    doesNotExist: tokenIdAsBytes32("3"),
  };

  let context: TestCardMarketContext;
  before(async () => {
    context = await setupTestCardMarketContext({
      cardMarketParams: {
        tokenIdsToMint: [tokenIdMap.withMarket, tokenIdMap.noMarket],
      },
    });
  });

  let snapshot: number;
  beforeEach(async () => {
    snapshot = await hre.ethers.provider.send("evm_snapshot", []);
  });

  afterEach(async () => {
    await hre.ethers.provider.send("evm_revert", [snapshot]);
  });

  describe("marketFor", () => {
    describe("when tx params are invalid", () => {
      describe("when there is no market for the tokenId", () => {
        it("should fail", async () => {
          const { cardMarket } = context;

          await expect(
            cardMarket.contract.marketFor(tokenIdMap.noMarket)
          ).to.be.revertedWith("CardMarket: no market for tokenId");
        });
      });
    });

    describe("when tx params are valid", () => {
      it("should return market", async () => {
        const { accounts, cardMarket } = context;

        const seller = accounts.owner;
        const marketParams = await prepareMarket(
          {
            tokenId: tokenIdMap.withMarket,
            acceptedToken: ethers.constants.AddressZero,
            minimumAmount: ethers.BigNumber.from("10"),
          },
          seller,
          cardMarket.contract
        );

        const marketFor = await cardMarket.contract.marketFor(
          marketParams.tokenId
        );
        expect(parseMarketState(marketFor)).to.eql({
          acceptedToken: marketParams.acceptedToken,
          minimumAmount: marketParams.minimumAmount,
        });
      });
    });
  });

  describe("setMarketFor", () => {
    type SetMarketForTxParams = {
      tokenId: BytesLike;
      acceptedToken: Address;
      minimumAmount: BigNumber;
    };

    const setMarketForSuccessScenario = async (
      { tokenId, acceptedToken, minimumAmount }: SetMarketForTxParams,
      signer: SignerWithAddress
    ) => {
      const { cardMarket } = context;

      // pre-conditions
      const preTokenOwnerOf = await cardMarket.contract.tokenOwnerOf(tokenId);
      expect(preTokenOwnerOf).to.eq(signer.address, "tokenId exists");

      // effects
      const tx = await cardMarket.contract
        .connect(signer)
        .setMarketFor(tokenId, acceptedToken, minimumAmount);
      expect(tx)
        .to.emit(cardMarket.contract, "MarketSet")
        .withArgs(tokenId, acceptedToken, minimumAmount);

      // post-conditions
      const postTokenOwnerOf = await cardMarket.contract.tokenOwnerOf(tokenId);
      expect(postTokenOwnerOf).to.eq(
        preTokenOwnerOf,
        "tokenId owner stays the same"
      );

      const marketFor = await cardMarket.contract.marketFor(tokenId);
      expect(parseMarketState(marketFor)).to.eql(
        { acceptedToken, minimumAmount },
        "price of tokenId is set in market"
      );
    };

    const setMarketForErrorScenario = async (
      { tokenId, acceptedToken, minimumAmount }: SetMarketForTxParams,
      signer: SignerWithAddress,
      expectedError: string
    ) => {
      const { cardMarket } = context;

      await expect(
        cardMarket.contract
          .connect(signer)
          .setMarketFor(tokenId, acceptedToken, minimumAmount)
      ).to.be.revertedWith(expectedError);
    };

    const buildValidSetMarketForTxParams = () => {
      const { fanzoneToken } = context;

      return {
        tokenId: tokenIdMap.withMarket,
        acceptedToken: fanzoneToken.contract.address,
        minimumAmount: ethers.BigNumber.from("10"),
      };
    };

    describe("when tx params are invalid", () => {
      describe("when tokenId does not exist", async () => {
        it("should fail", async () => {
          const { accounts } = context;

          const signer = accounts.owner;
          const txParams = {
            ...buildValidSetMarketForTxParams(),
            tokenId: tokenIdMap.doesNotExist,
          };
          await setMarketForErrorScenario(
            txParams,
            signer,
            "LSP8: can not query non existent token"
          );
        });
      });

      describe("when minimumAmount is zero", () => {
        it("should fail", async () => {
          const { accounts } = context;

          const signer = accounts.owner;
          const txParams = {
            ...buildValidSetMarketForTxParams(),
            minimumAmount: ethers.constants.Zero,
          };
          await setMarketForErrorScenario(
            txParams,
            signer,
            "CardMarket: minimumAmount must be set"
          );
        });
      });
    });

    describe("when tx params are valid", () => {
      describe("when non-owner of tokenId sends tx", () => {
        it("should fail", async () => {
          const { accounts } = context;

          const signer = accounts.anyone;
          const txParams = buildValidSetMarketForTxParams();
          await setMarketForErrorScenario(
            txParams,
            signer,
            "CardMarket: can not set market, caller is not the owner of token"
          );
        });
      });

      describe("when owner of tokenId sends tx", () => {
        it("should set market for tokenId", async () => {
          const { accounts } = context;

          const signer = accounts.owner;
          const txParams = buildValidSetMarketForTxParams();

          await setMarketForSuccessScenario(txParams, signer);
        });
      });

      describe("when owner set market many times", () => {
        it("should set market for tokenId", async () => {
          const { accounts, fanzoneToken } = context;

          const signer = accounts.owner;

          const txParamsFirstState = {
            ...buildValidSetMarketForTxParams(),
            acceptedToken: fanzoneToken.contract.address,
            minimumAmount: ethers.BigNumber.from("10"),
          };
          await setMarketForSuccessScenario(txParamsFirstState, signer);

          const txParamsSecondState = {
            ...buildValidSetMarketForTxParams(),
            acceptedToken: ethers.constants.AddressZero,
            minimumAmount: ethers.BigNumber.from("22"),
          };
          await setMarketForSuccessScenario(txParamsSecondState, signer);
        });
      });
    });
  });

  describe("removeMarketFor", () => {
    type RemoveMarketForTxParams = {
      tokenId: BytesLike;
    };

    const removeMarketForSuccessScenario = async (
      { tokenId }: RemoveMarketForTxParams,
      signer: SignerWithAddress
    ) => {
      const { cardMarket } = context;

      // pre-conditions
      const preTokenOwnerOf = await cardMarket.contract.tokenOwnerOf(tokenId);
      expect(preTokenOwnerOf).to.eq(signer.address, "tokenId exists");

      const preMarketFor = await cardMarket.contract.marketFor(tokenId);
      expect(preMarketFor.minimumAmount).to.not.eql(
        ethers.constants.Zero,
        "market exists for tokenId"
      );

      // effects
      const tx = await cardMarket.contract
        .connect(signer)
        .removeMarketFor(tokenId);
      expect(tx).to.emit(cardMarket.contract, "MarketRemove").withArgs(tokenId);

      // post-conditions
      const postTokenOwnerOf = await cardMarket.contract.tokenOwnerOf(tokenId);
      expect(postTokenOwnerOf).to.eq(
        preTokenOwnerOf,
        "tokenId owner stays the same"
      );

      await expect(cardMarket.contract.marketFor(tokenId)).to.be.revertedWith(
        "CardMarket: no market for tokenId"
      );
    };

    const removeMarketForErrorScenario = async (
      { tokenId }: RemoveMarketForTxParams,
      signer: SignerWithAddress,
      expectedError: string
    ) => {
      const { cardMarket } = context;

      await expect(
        cardMarket.contract.connect(signer).removeMarketFor(tokenId)
      ).to.be.revertedWith(expectedError);
    };

    describe("when tx params are invalid", () => {
      describe("when there is no market for tokenId", async () => {
        it("should fail", async () => {
          const { accounts } = context;

          const signer = accounts.owner;
          const txParams = {
            tokenId: tokenIdMap.noMarket,
          };
          await removeMarketForErrorScenario(
            txParams,
            signer,
            "CardMarket: no market for tokenId"
          );
        });
      });
    });

    describe("when tx params are valid", () => {
      describe("when non-owner of tokenId sends tx", () => {
        it("should fail", async () => {
          const { accounts, cardMarket } = context;

          const seller = accounts.owner;
          const marketParams = await prepareMarket(
            {
              tokenId: tokenIdMap.withMarket,
              acceptedToken: ethers.constants.AddressZero,
              minimumAmount: ethers.BigNumber.from("10"),
            },
            seller,
            cardMarket.contract
          );

          const signer = accounts.anyone;
          const txParams = { tokenId: marketParams.tokenId };
          await removeMarketForErrorScenario(
            txParams,
            signer,
            "CardMarket: can not remove market, caller is not the owner of token"
          );
        });
      });

      describe("when owner of tokenId sends tx", () => {
        it("should remove market for tokenId", async () => {
          const { accounts, cardMarket } = context;

          const seller = accounts.owner;
          const marketParams = await prepareMarket(
            {
              tokenId: tokenIdMap.withMarket,
              acceptedToken: ethers.constants.AddressZero,
              minimumAmount: ethers.BigNumber.from("10"),
            },
            seller,
            cardMarket.contract
          );

          const signer = seller;
          const txParams = { tokenId: marketParams.tokenId };
          await removeMarketForSuccessScenario(txParams, signer);
        });
      });
    });
  });

  describe("buyFromMarket", () => {
    type BuyFromMarketTxParams = {
      tokenId: BytesLike;
      amount: BigNumber;
    };

    const buyFromMarketSuccessScenario = async (
      { tokenId, amount }: BuyFromMarketTxParams,
      signer: SignerWithAddress
    ) => {
      const { cardMarket } = context;

      // pre-conditions
      const preTokenOwnerOf = await cardMarket.contract.tokenOwnerOf(tokenId);
      expect(preTokenOwnerOf).to.not.eq(
        signer.address,
        "tokenId not owned by buyer"
      );

      const preMarketFor = await cardMarket.contract.marketFor(tokenId);
      expect(preMarketFor.minimumAmount).to.not.eql(
        ethers.constants.Zero,
        "market exists for tokenId"
      );

      const preTokenOwnerAcceptedTokenBalanceOf =
        await getBalanceOfAcceptedToken({
          acceptedToken: preMarketFor.acceptedToken,
          tokenOwner: preTokenOwnerOf,
        });

      // effects
      const tx = await cardMarket.contract
        .connect(signer)
        .buyFromMarket(tokenId, amount, {
          value:
            preMarketFor.acceptedToken === ethers.constants.AddressZero
              ? amount
              : ethers.constants.Zero,
        });
      expect(tx)
        .to.emit(cardMarket.contract, "MarketBuy")
        .withArgs(tokenId, signer.address, amount);

      // post-conditions
      const postTokenOwnerOf = await cardMarket.contract.tokenOwnerOf(tokenId);
      expect(postTokenOwnerOf).to.eq(signer.address, "tokenId owned by buyer");

      await expect(cardMarket.contract.marketFor(tokenId)).to.be.revertedWith(
        "CardMarket: no market for tokenId"
      );

      const postTokenOwnerAcceptedTokenBalanceOf =
        await getBalanceOfAcceptedToken({
          acceptedToken: preMarketFor.acceptedToken,
          tokenOwner: preTokenOwnerOf,
        });
      expect(postTokenOwnerAcceptedTokenBalanceOf).to.eq(
        preTokenOwnerAcceptedTokenBalanceOf.add(amount),
        "previous token owner accepted token balance increased"
      );
    };

    const buyFromMarketErrorScenario = async (
      { tokenId, amount }: BuyFromMarketTxParams,
      signer: SignerWithAddress,
      expectedError: string,
      valueInTx: BigNumber = ethers.constants.Zero
    ) => {
      const { cardMarket } = context;

      await expect(
        cardMarket.contract
          .connect(signer)
          .buyFromMarket(tokenId, amount, { value: valueInTx })
      ).to.be.revertedWith(expectedError);
    };

    const sendingBuyFromMarketTransactions = (
      getAcceptedToken: () => Address
    ) => {
      let acceptedToken: Address;
      beforeEach(() => {
        acceptedToken = getAcceptedToken();
      });

      describe("when tx params are invalid", () => {
        describe("when there is no market for tokenId", async () => {
          it("should fail", async () => {
            const { accounts } = context;

            const signer = accounts.tokenBuyer;
            const txParams = {
              tokenId: tokenIdMap.noMarket,
              amount: ethers.BigNumber.from("10"),
            };

            await buyFromMarketErrorScenario(
              txParams,
              signer,
              "CardMarket: no market for tokenId"
            );
          });
        });

        describe("when amount is less than minimumAmount", async () => {
          it("should fail", async () => {
            const { accounts, cardMarket } = context;

            const seller = accounts.owner;
            const marketParams = await prepareMarket(
              {
                tokenId: tokenIdMap.withMarket,
                acceptedToken,
                minimumAmount: ethers.BigNumber.from("10"),
              },
              seller,
              cardMarket.contract
            );

            const signer = accounts.tokenBuyer;
            const txParams = {
              tokenId: marketParams.tokenId,
              amount: marketParams.minimumAmount.sub("1"),
            };
            await prepareToBuyWithToken({
              acceptedToken: marketParams.acceptedToken,
              amount: txParams.amount,
              cardMarket: cardMarket.contract,
              sendTokensFrom: accounts.owner,
              buyer: signer,
            });

            await buyFromMarketErrorScenario(
              txParams,
              signer,
              "CardMarket: amount is less than minimum amount"
            );
          });
        });
      });

      describe("when tx params are valid", () => {
        describe("when amount is exactly minimumAmount", () => {
          it("should buy token from market", async () => {
            const { accounts, cardMarket } = context;

            const seller = accounts.owner;
            const marketParams = await prepareMarket(
              {
                tokenId: tokenIdMap.withMarket,
                acceptedToken,
                minimumAmount: ethers.BigNumber.from("10"),
              },
              seller,
              cardMarket.contract
            );

            const signer = accounts.tokenBuyer;
            const txParams = {
              tokenId: marketParams.tokenId,
              amount: marketParams.minimumAmount,
            };
            await prepareToBuyWithToken({
              acceptedToken: marketParams.acceptedToken,
              amount: txParams.amount,
              cardMarket: cardMarket.contract,
              sendTokensFrom: accounts.owner,
              buyer: signer,
            });
            await buyFromMarketSuccessScenario(txParams, signer);
          });
        });

        describe("when amount is greater than minimumAmount", () => {
          it("should buy token from market", async () => {
            const { accounts, cardMarket } = context;

            const seller = accounts.owner;
            const marketParams = await prepareMarket(
              {
                tokenId: tokenIdMap.withMarket,
                acceptedToken,
                minimumAmount: ethers.BigNumber.from("10"),
              },
              seller,
              cardMarket.contract
            );

            const signer = accounts.tokenBuyer;
            const txParams = {
              tokenId: marketParams.tokenId,
              amount: marketParams.minimumAmount.add("1"),
            };
            await prepareToBuyWithToken({
              acceptedToken: marketParams.acceptedToken,
              amount: txParams.amount,
              cardMarket: cardMarket.contract,
              sendTokensFrom: accounts.owner,
              buyer: signer,
            });
            await buyFromMarketSuccessScenario(txParams, signer);
          });
        });
      });
    };

    describe("when auction acceptedToken is the native blockchain coin", () => {
      sendingBuyFromMarketTransactions(() => ethers.constants.AddressZero);

      describe('when tx value does not match "amount" param', () => {
        it("should fail", async () => {
          const { accounts, cardMarket } = context;

          const seller = accounts.owner;
          const marketParams = await prepareMarket(
            {
              tokenId: tokenIdMap.withMarket,
              acceptedToken: ethers.constants.AddressZero,
              minimumAmount: ethers.BigNumber.from("10"),
            },
            seller,
            cardMarket.contract
          );

          const signer = accounts.tokenBuyer;
          const txParams = {
            tokenId: marketParams.tokenId,
            amount: marketParams.minimumAmount,
          };
          await prepareToBuyWithToken({
            acceptedToken: marketParams.acceptedToken,
            amount: txParams.amount,
            cardMarket: cardMarket.contract,
            sendTokensFrom: accounts.owner,
            buyer: signer,
          });

          await buyFromMarketErrorScenario(
            txParams,
            signer,
            "CardMarket: buy amount incorrect",
            txParams.amount.add("1")
          );
        });
      });
    });

    describe("when auction acceptedToken is a LSP7 token", () => {
      sendingBuyFromMarketTransactions(
        () => context.fanzoneToken.contract.address
      );

      describe("when sending value in tx", () => {
        it("should fail", async () => {
          const { accounts, cardMarket, fanzoneToken } = context;

          const seller = accounts.owner;
          const marketParams = await prepareMarket(
            {
              tokenId: tokenIdMap.withMarket,
              acceptedToken: fanzoneToken.contract.address,
              minimumAmount: ethers.BigNumber.from("10"),
            },
            seller,
            cardMarket.contract
          );

          const signer = accounts.tokenBuyer;
          const txParams = {
            tokenId: marketParams.tokenId,
            amount: marketParams.minimumAmount,
          };
          await prepareToBuyWithToken({
            acceptedToken: marketParams.acceptedToken,
            amount: txParams.amount,
            cardMarket: cardMarket.contract,
            sendTokensFrom: accounts.owner,
            buyer: signer,
          });

          await buyFromMarketErrorScenario(
            txParams,
            signer,
            "CardMarket: buy with token included native coin",
            txParams.amount
          );
        });
      });
    });
  });

  describe("overrides on LSP8", () => {
    describe("when transfering", () => {
      it("should clear the market for tokenId", async () => {
        const { accounts, cardMarket, fanzoneToken } = context;

        const seller = accounts.owner;
        const marketParams = await prepareMarket(
          {
            tokenId: tokenIdMap.withMarket,
            acceptedToken: fanzoneToken.contract.address,
            minimumAmount: ethers.BigNumber.from("10"),
          },
          seller,
          cardMarket.contract
        );

        // pre-conditions
        const preMarketFor = await cardMarket.contract.marketFor(
          marketParams.tokenId
        );
        expect(preMarketFor.minimumAmount).to.not.eql(
          ethers.constants.Zero,
          "market exists for tokenId"
        );

        // effects
        await cardMarket.contract.transfer(
          seller.address,
          accounts.tokenReceiver.address,
          marketParams.tokenId,
          true,
          ethers.utils.toUtf8Bytes("transfering a token should clear market")
        );

        // post-conditions
        await expect(
          cardMarket.contract.marketFor(marketParams.tokenId)
        ).to.be.revertedWith("CardMarket: no market for tokenId");
      });
    });

    describe("when burning", () => {
      it("should clear the market for tokenId", async () => {
        const { accounts, cardMarket, fanzoneToken } = context;

        const seller = accounts.owner;
        const marketParams = await prepareMarket(
          {
            tokenId: tokenIdMap.withMarket,
            acceptedToken: fanzoneToken.contract.address,
            minimumAmount: ethers.BigNumber.from("10"),
          },
          seller,
          cardMarket.contract
        );

        // pre-conditions
        const preMarketFor = await cardMarket.contract.marketFor(
          marketParams.tokenId
        );
        expect(preMarketFor.minimumAmount).to.not.eql(
          ethers.constants.Zero,
          "market exists for tokenId"
        );

        // effects
        await cardMarket.contract.burn(
          marketParams.tokenId,
          ethers.utils.toUtf8Bytes("burning a token should clear market")
        );

        // post-conditions
        await expect(
          cardMarket.contract.marketFor(marketParams.tokenId)
        ).to.be.revertedWith("CardMarket: no market for tokenId");
      });
    });
  });
});
