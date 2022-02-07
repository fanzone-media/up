import hre from "hardhat";
import { expect } from "chai";
import { ethers } from "ethers";

import {
  getTimeoutForNetwork,
  setupTestCardAuctionContext,
  TestCardAuctionContext,
} from "./utils/setup";
import { tokenIdAsBytes32 } from "../utils/cardToken";
import {
  auctionDuration,
  getBalanceOfAcceptedToken,
  prepareAuction,
  prepareToBidWithToken,
  PrepareAuctionParams,
  parseAuctionState,
} from "./utils/cardAuction";
import { waitForTxOnNetwork } from "../utils/network";

import type { BigNumber, BytesLike } from "ethers";
import type { Address, SignerWithAddress } from "../utils/types";

describe("CardAuction", function () {
  this.timeout(getTimeoutForNetwork(hre.network.name));

  type TokenIdMap = {
    withAuction: BytesLike;
    noAuction: BytesLike;
    doesNotExist: BytesLike;
  };
  const tokenIdMap: TokenIdMap = {
    withAuction: tokenIdAsBytes32("1"),
    noAuction: tokenIdAsBytes32("2"),
    doesNotExist: tokenIdAsBytes32("3"),
  };

  let context: TestCardAuctionContext;
  before(async () => {
    context = await setupTestCardAuctionContext({
      cardAuctionParams: {
        tokenIdsToMint: [tokenIdMap.withAuction, tokenIdMap.noAuction],
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

  describe("auctionDurationRange", () => {
    it("should return min and max auction durations", async () => {
      const { cardAuction } = context;

      const durations = await cardAuction.contract.auctionDurationRange();
      expect(durations[0]).to.eq(
        auctionDuration.min,
        "auction min duration matches"
      );
      expect(durations[1]).to.eq(
        auctionDuration.max,
        "auction max duration matches"
      );
    });
  });

  describe("auctionFor", () => {
    describe("when tx params are invalid", () => {
      describe("when there is no auction for the tokenId", () => {
        it("should fail", async () => {
          const { cardAuction, cardToken } = context;

          await expect(
            cardAuction.contract.auctionFor(
              cardToken.contract.address,
              tokenIdMap.noAuction
            )
          ).to.be.revertedWith("CardAuction: no auction for tokenId");
        });
      });
    });

    describe("when tx params are valid", () => {
      it("should return auction", async () => {
        const { accounts, cardAuction, cardToken } = context;

        const seller = accounts.owner;
        const { expectedAuctionEndTime, auctionParams } = await prepareAuction(
          hre.network.name,
          cardAuction.contract,
          seller,
          {
            lsp8Contract: cardToken.contract.address,
            tokenId: tokenIdMap.withAuction,
            acceptedToken: ethers.constants.AddressZero,
            minimumBid: ethers.BigNumber.from("10"),
            duration: auctionDuration.min,
          }
        );

        const auctionFor = await cardAuction.contract.auctionFor(
          auctionParams.lsp8Contract,
          auctionParams.tokenId
        );
        expect(parseAuctionState(auctionFor)).to.eql(
          {
            seller: seller.address,
            lsp8Contract: auctionParams.lsp8Contract,
            minimumBid: auctionParams.minimumBid,
            acceptedToken: auctionParams.acceptedToken,
            endTime: expectedAuctionEndTime,
            activeBidder: ethers.constants.AddressZero,
            activeBidAmount: ethers.constants.Zero,
          },
          "auction state for tokenId is set"
        );
      });
    });
  });

  describe("openAuctionFor", () => {
    type OpenAuctionForTxParams = {
      lsp8Contract: Address;
      tokenId: BytesLike;
      acceptedToken: Address;
      minimumBid: BigNumber;
      duration: BigNumber;
    };

    const openAuctionForSuccessScenario = async (
      {
        lsp8Contract,
        tokenId,
        acceptedToken,
        minimumBid,
        duration,
      }: OpenAuctionForTxParams,
      signer: SignerWithAddress
    ) => {
      const { cardAuction, cardToken } = context;

      // pre-conditions
      const preTokenOwnerOf = await cardToken.contract.tokenOwnerOf(tokenId);
      expect(preTokenOwnerOf).to.not.eq(
        cardAuction.contract.address,
        "tokenId is not owned by CardAuction"
      );

      const preIsOperatorFor = await cardToken.contract.isOperatorFor(
        cardAuction.contract.address,
        tokenId
      );
      expect(preIsOperatorFor).to.eq(
        true,
        "CardAuction is authorized operator for tokenId"
      );

      // effects
      const tx = await waitForTxOnNetwork(
        hre.network.name,
        cardAuction.contract
          .connect(signer)
          .openAuctionFor(
            lsp8Contract,
            tokenId,
            acceptedToken,
            minimumBid,
            duration
          )
      );
      const blockWithTx = await hre.ethers.provider.getBlock(
        tx.txReceipt.blockNumber
      );
      await expect(tx.sentTx)
        .to.emit(cardAuction.contract, "AuctionOpen")
        .withArgs(
          lsp8Contract,
          tokenId,
          acceptedToken,
          minimumBid,
          duration.add(blockWithTx.timestamp)
        );

      // post-conditions
      const postTokenOwnerOf = await cardToken.contract.tokenOwnerOf(tokenId);
      expect(postTokenOwnerOf).to.eq(
        cardAuction.contract.address,
        "tokenId is owned by CardAuction"
      );

      const postAuctionFor = await cardAuction.contract.auctionFor(
        lsp8Contract,
        tokenId
      );
      expect(parseAuctionState(postAuctionFor)).to.eql(
        {
          seller: signer.address,
          lsp8Contract,
          minimumBid,
          acceptedToken,
          endTime: duration.add(blockWithTx.timestamp),
          activeBidder: ethers.constants.AddressZero,
          activeBidAmount: ethers.constants.Zero,
        },
        "auction state for tokenId is set"
      );
    };

    const openAuctionForErrorScenario = async (
      {
        lsp8Contract,
        tokenId,
        acceptedToken,
        minimumBid,
        duration,
      }: OpenAuctionForTxParams,
      signer: SignerWithAddress,
      expectedError: string
    ) => {
      const { cardAuction } = context;

      await expect(
        cardAuction.contract
          .connect(signer)
          .openAuctionFor(
            lsp8Contract,
            tokenId,
            acceptedToken,
            minimumBid,
            duration
          )
      ).to.be.revertedWith(expectedError);
    };

    const buildValidOpenAuctionForTxParams = (): PrepareAuctionParams => {
      const { cardToken, fanzoneToken } = context;

      return {
        lsp8Contract: cardToken.contract.address,
        tokenId: tokenIdMap.withAuction,
        acceptedToken: fanzoneToken.contract.address,
        minimumBid: ethers.BigNumber.from("10"),
        duration: auctionDuration.min,
      };
    };

    describe("when tx params are invalid", () => {
      describe("when tokenId does not exist", async () => {
        it("should fail", async () => {
          const { accounts } = context;

          await openAuctionForErrorScenario(
            {
              ...buildValidOpenAuctionForTxParams(),
              tokenId: tokenIdMap.doesNotExist,
            },
            accounts.owner,
            "LSP8: can not query non existent token"
          );
        });
      });

      describe("when minimumBid is zero", () => {
        it("should fail", async () => {
          const { accounts } = context;

          await openAuctionForErrorScenario(
            {
              ...buildValidOpenAuctionForTxParams(),
              minimumBid: ethers.constants.Zero,
            },
            accounts.owner,
            "CardAuction: minimumBid must be set"
          );
        });
      });

      describe("when duration is less than min duration", () => {
        it("should fail", async () => {
          const { accounts } = context;

          await openAuctionForErrorScenario(
            {
              ...buildValidOpenAuctionForTxParams(),
              duration: auctionDuration.min.sub("1"),
            },
            accounts.owner,
            "CardAuction: invalid duration"
          );
        });
      });

      describe("when duration is greater than max duration", () => {
        it("should fail", async () => {
          const { accounts } = context;

          await openAuctionForErrorScenario(
            {
              ...buildValidOpenAuctionForTxParams(),
              duration: auctionDuration.max.add("1"),
            },
            accounts.owner,
            "CardAuction: invalid duration"
          );
        });
      });
    });

    describe("when tx params are valid", () => {
      describe("when CardAuction contract is not an authorized operator for tokenId", () => {
        it("should fail", async () => {
          const { accounts } = context;

          await openAuctionForErrorScenario(
            buildValidOpenAuctionForTxParams(),
            accounts.owner,
            "LSP8: can not transfer, caller is not the owner or operator of token"
          );
        });
      });

      describe("when CardAuction contract is an authorized operator for tokenId", () => {
        describe("when there is an auction for the tokenId", () => {
          it("should fail", async () => {
            const { accounts, cardToken, cardAuction } = context;

            const txParams = buildValidOpenAuctionForTxParams();

            await cardToken.contract.authorizeOperator(
              cardAuction.contract.address,
              txParams.tokenId
            );

            await cardAuction.contract.openAuctionFor(
              txParams.lsp8Contract,
              txParams.tokenId,
              txParams.acceptedToken,
              txParams.minimumBid,
              txParams.duration
            );

            await openAuctionForErrorScenario(
              txParams,
              accounts.owner,
              "CardAuction: auction exists for tokenId"
            );
          });
        });

        describe("when duration is min duration", () => {
          it("should setup the auction for the tokenId", async () => {
            const { accounts, cardAuction, cardToken } = context;

            const txParams = {
              ...buildValidOpenAuctionForTxParams(),
              duration: auctionDuration.min,
            };

            await cardToken.contract.authorizeOperator(
              cardAuction.contract.address,
              txParams.tokenId
            );

            await openAuctionForSuccessScenario(txParams, accounts.owner);
          });
        });

        describe("when duration is max duration", () => {
          it("should setup the auction for the tokenId", async () => {
            const { accounts, cardAuction, cardToken } = context;

            const txParams = {
              ...buildValidOpenAuctionForTxParams(),
              duration: auctionDuration.max,
            };

            await cardToken.contract.authorizeOperator(
              cardAuction.contract.address,
              txParams.tokenId
            );

            await openAuctionForSuccessScenario(txParams, accounts.owner);
          });
        });
      });
    });
  });

  describe("submitBid", () => {
    type SubmitBidTxParams = {
      lsp8Contract: Address;
      tokenId: BytesLike;
      bidAmount: BigNumber;
    };

    const submitBidSuccessScenario = async (
      { lsp8Contract, tokenId, bidAmount }: SubmitBidTxParams,
      signer: SignerWithAddress
    ) => {
      const { cardAuction, cardToken } = context;

      // pre-conditions
      const preTokenOwnerOf = await cardToken.contract.tokenOwnerOf(tokenId);
      expect(preTokenOwnerOf).to.eq(
        cardAuction.contract.address,
        "tokenId is owned by CardAuction"
      );

      const preAuctionFor = await cardAuction.contract.auctionFor(
        lsp8Contract,
        tokenId
      );
      expect(preAuctionFor.minimumBid.gt("0")).to.eq(
        true,
        "tokenId has an auction"
      );
      expect(ethers.utils.getAddress(preAuctionFor.activeBidder)).to.not.eq(
        ethers.utils.getAddress(signer.address),
        "previous active bidder is different than expected bidder"
      );

      const preCardAuctionAcceptedTokenBalanceOf =
        await getBalanceOfAcceptedToken({
          tokenOwner: cardAuction.contract.address,
          acceptedToken: preAuctionFor.acceptedToken,
        });

      const prePreviousBidderClaimableAmountsFor =
        await cardAuction.contract.claimableAmountsFor(
          preAuctionFor.activeBidder,
          preAuctionFor.acceptedToken
        );

      const preNextBidderAcceptedTokenBalance = await getBalanceOfAcceptedToken(
        {
          tokenOwner: signer.address,
          acceptedToken: preAuctionFor.acceptedToken,
        }
      );

      // effects
      const tx = await waitForTxOnNetwork(
        hre.network.name,
        cardAuction.contract
          .connect(signer)
          .submitBid(lsp8Contract, tokenId, bidAmount, {
            value:
              preAuctionFor.acceptedToken === ethers.constants.AddressZero
                ? bidAmount
                : ethers.constants.Zero,
          })
      );
      await expect(tx.sentTx)
        .to.emit(cardAuction.contract, "AuctionBidSubmit")
        .withArgs(lsp8Contract, tokenId, signer.address, bidAmount);

      // post-conditions
      const postTokenOwnerOf = await cardToken.contract.tokenOwnerOf(tokenId);
      expect(postTokenOwnerOf).to.eq(
        cardAuction.contract.address,
        "tokenId is owned by CardAuction"
      );

      const postAuctionFor = await cardAuction.contract.auctionFor(
        lsp8Contract,
        tokenId
      );
      expect(parseAuctionState(postAuctionFor)).to.eql(
        {
          seller: preAuctionFor.seller,
          lsp8Contract: preAuctionFor.lsp8Contract,
          minimumBid: preAuctionFor.minimumBid,
          acceptedToken: preAuctionFor.acceptedToken,
          endTime: preAuctionFor.endTime,
          activeBidder: signer.address,
          activeBidAmount: bidAmount,
        },
        "auction state for tokenId is updated"
      );

      const postCardAuctionAcceptedTokenBalanceOf =
        await getBalanceOfAcceptedToken({
          tokenOwner: cardAuction.contract.address,
          acceptedToken: preAuctionFor.acceptedToken,
        });
      expect(postCardAuctionAcceptedTokenBalanceOf).to.eq(
        preCardAuctionAcceptedTokenBalanceOf.add(bidAmount),
        "auction contract accepted token balance increased"
      );

      const postPreviousBidderClaimableAmountsFor =
        await cardAuction.contract.claimableAmountsFor(
          preAuctionFor.activeBidder,
          preAuctionFor.acceptedToken
        );
      expect(postPreviousBidderClaimableAmountsFor).to.eq(
        prePreviousBidderClaimableAmountsFor.add(preAuctionFor.activeBidAmount),
        "previous active bidder claimable amount increased"
      );

      const postNextBidderAcceptedTokenBalance =
        await getBalanceOfAcceptedToken({
          tokenOwner: signer.address,
          acceptedToken: preAuctionFor.acceptedToken,
        });
      expect(postNextBidderAcceptedTokenBalance).to.eq(
        preNextBidderAcceptedTokenBalance
          .sub(bidAmount)
          .sub(
            preAuctionFor.acceptedToken === ethers.constants.AddressZero
              ? tx.txReceipt.gasUsed.mul(tx.txReceipt.effectiveGasPrice)
              : ethers.constants.Zero
          ),
        "next active bidder accepted token balance decreased"
      );
    };

    const submitBidErrorScenario = async (
      { lsp8Contract, tokenId, bidAmount }: SubmitBidTxParams,
      signer: SignerWithAddress,
      expectedError: string,
      valueInTx: BigNumber = ethers.constants.Zero
    ) => {
      const { cardAuction } = context;

      // effects
      await expect(
        cardAuction.contract
          .connect(signer)
          .submitBid(lsp8Contract, tokenId, bidAmount, {
            value: valueInTx,
          })
      ).to.be.revertedWith(expectedError);
    };

    const prepareToSubmitBid = async (
      auctionParams: PrepareAuctionParams
    ): Promise<PrepareAuctionParams> => {
      const { accounts, cardAuction } = context;

      await prepareAuction(
        hre.network.name,
        cardAuction.contract,
        accounts.owner,
        auctionParams
      );

      return auctionParams;
    };

    const sendingSubmitBidTransactions = (getAcceptedToken: () => Address) => {
      let acceptedToken: Address;
      beforeEach(() => {
        acceptedToken = getAcceptedToken();
      });

      describe("when tx params are invalid", () => {
        describe("when there is no auction for the tokenId", () => {
          it("should fail", async () => {
            const { accounts } = context;

            const signer = accounts.tokenBuyer;
            const txParams = {
              lsp8Contract: acceptedToken,
              tokenId: tokenIdMap.noAuction,
              bidAmount: ethers.BigNumber.from("10"),
            };

            await submitBidErrorScenario(
              txParams,
              signer,
              "CardAuction: no auction for tokenId"
            );
          });
        });

        describe("when the bidAmount is smaller than the minimumBid", () => {
          it("should fail", async () => {
            const { accounts, cardToken } = context;

            const auctionParams = await prepareToSubmitBid({
              acceptedToken,
              lsp8Contract: cardToken.contract.address,
              tokenId: tokenIdMap.withAuction,
              minimumBid: ethers.BigNumber.from("10"),
              duration: auctionDuration.min,
            });

            const signer = accounts.tokenBuyer;
            const txParams = {
              lsp8Contract: auctionParams.lsp8Contract,
              tokenId: auctionParams.tokenId,
              bidAmount: auctionParams.minimumBid.sub(1),
            };

            await submitBidErrorScenario(
              txParams,
              signer,
              "CardAuction: bid amount less than minimum bid"
            );
          });
        });
      });

      describe("when the params are valid", () => {
        describe("when there is no previous bidder", () => {
          it("should update the auctions activeBid", async () => {
            const { accounts, cardAuction, cardToken } = context;

            const auctionParams = await prepareToSubmitBid({
              acceptedToken,
              lsp8Contract: cardToken.contract.address,
              tokenId: tokenIdMap.withAuction,
              minimumBid: ethers.BigNumber.from("10"),
              duration: auctionDuration.min,
            });

            const bidder = accounts.tokenBuyer;
            const txParams = {
              lsp8Contract: auctionParams.lsp8Contract,
              tokenId: auctionParams.tokenId,
              bidAmount: auctionParams.minimumBid,
            };

            await prepareToBidWithToken({
              acceptedToken,
              bidAmount: txParams.bidAmount,
              cardAuction: cardAuction.contract,
              sendTokensFrom: accounts.owner,
              bidder,
            });

            await submitBidSuccessScenario(txParams, bidder);
          });
        });

        describe("when there are multiple bids", () => {
          it("should update the auctions activeBid", async () => {
            const { accounts, cardToken, cardAuction } = context;

            const auctionParams = await prepareToSubmitBid({
              acceptedToken,
              lsp8Contract: cardToken.contract.address,
              tokenId: tokenIdMap.withAuction,
              minimumBid: ethers.BigNumber.from("10"),
              duration: auctionDuration.min,
            });

            const firstBidder = accounts.tokenBuyer;
            const txParamsFirstBid = {
              lsp8Contract: auctionParams.lsp8Contract,
              tokenId: auctionParams.tokenId,
              bidAmount: auctionParams.minimumBid,
            };
            await prepareToBidWithToken({
              acceptedToken: auctionParams.acceptedToken,
              bidAmount: auctionParams.minimumBid,
              cardAuction: cardAuction.contract,
              sendTokensFrom: accounts.owner,
              bidder: firstBidder,
            });
            await submitBidSuccessScenario(txParamsFirstBid, firstBidder);

            const secondBidder = accounts.anyone;
            const txParamsSecondBid = {
              lsp8Contract: auctionParams.lsp8Contract,
              tokenId: auctionParams.tokenId,
              bidAmount: auctionParams.minimumBid.add(
                txParamsFirstBid.bidAmount
              ),
            };
            await prepareToBidWithToken({
              acceptedToken: auctionParams.acceptedToken,
              bidAmount: auctionParams.minimumBid.add(
                txParamsFirstBid.bidAmount
              ),
              cardAuction: cardAuction.contract,
              sendTokensFrom: accounts.owner,
              bidder: secondBidder,
            });
            await submitBidSuccessScenario(txParamsSecondBid, secondBidder);
          });
        });
      });
    };

    describe("when auction acceptedToken is the native blockchain coin", () => {
      sendingSubmitBidTransactions(() => ethers.constants.AddressZero);

      describe('when tx value does not match "amount" param', () => {
        it("should fail", async () => {
          const { accounts, cardToken } = context;

          const auctionParams = await prepareToSubmitBid({
            lsp8Contract: cardToken.contract.address,
            tokenId: tokenIdMap.withAuction,
            acceptedToken: ethers.constants.AddressZero,
            minimumBid: ethers.BigNumber.from("10"),
            duration: auctionDuration.min,
          });

          const signer = accounts.tokenBuyer;
          const txParams = {
            lsp8Contract: auctionParams.lsp8Contract,
            tokenId: auctionParams.tokenId,
            bidAmount: auctionParams.minimumBid,
          };

          await submitBidErrorScenario(
            txParams,
            signer,
            "CardAuction: bid amount incorrect",
            txParams.bidAmount.add("1")
          );
        });
      });
    });

    describe("when auction acceptedToken is a LSP7 token", () => {
      sendingSubmitBidTransactions(() => context.fanzoneToken.contract.address);

      describe("when sending value in tx", () => {
        it("should fail", async () => {
          const { accounts, cardToken, fanzoneToken } = context;

          const auctionParams = await prepareToSubmitBid({
            lsp8Contract: cardToken.contract.address,
            tokenId: tokenIdMap.withAuction,
            acceptedToken: fanzoneToken.contract.address,
            minimumBid: ethers.BigNumber.from("10"),
            duration: auctionDuration.min,
          });

          const signer = accounts.tokenBuyer;
          const txParams = {
            lsp8Contract: auctionParams.lsp8Contract,
            tokenId: auctionParams.tokenId,
            bidAmount: auctionParams.minimumBid,
          };

          await submitBidErrorScenario(
            txParams,
            signer,
            "CardAuction: bid with token included native coin",
            txParams.bidAmount
          );
        });
      });
    });
  });

  describe("cancelAuctionFor", () => {
    type CancelAuctionForTxParams = {
      lsp8Contract: Address;
      tokenId: BytesLike;
    };

    const cancelAuctionForSuccessScenario = async (
      { lsp8Contract, tokenId }: CancelAuctionForTxParams,
      signer: SignerWithAddress
    ) => {
      const { cardAuction, cardToken } = context;

      // pre-conditions
      const preTokenOwnerOf = await cardToken.contract.tokenOwnerOf(tokenId);
      expect(preTokenOwnerOf).to.eq(
        cardAuction.contract.address,
        "tokenId is owned by CardAuction"
      );
      const preAuctionFor = await cardAuction.contract.auctionFor(
        lsp8Contract,
        tokenId
      );
      expect(preAuctionFor.minimumBid.gt("0")).to.eq(
        true,
        "tokenId has an auction"
      );
      expect(preAuctionFor.activeBidder).to.eq(
        ethers.constants.AddressZero,
        "no active bidder"
      );

      const preCardAuctionAcceptedTokenBalanceOf =
        await getBalanceOfAcceptedToken({
          tokenOwner: cardAuction.contract.address,
          acceptedToken: preAuctionFor.acceptedToken,
        });

      const preSellerClaimableAmountsFor =
        await cardAuction.contract.claimableAmountsFor(
          preAuctionFor.seller,
          preAuctionFor.acceptedToken
        );

      // effects
      const tx = await waitForTxOnNetwork(
        hre.network.name,
        cardAuction.contract
          .connect(signer)
          .cancelAuctionFor(lsp8Contract, tokenId)
      );
      await expect(tx.sentTx)
        .to.emit(cardAuction.contract, "AuctionCancel")
        .withArgs(lsp8Contract, tokenId);

      // post-conditions
      const postTokenOwnerOf = await cardToken.contract.tokenOwnerOf(tokenId);
      expect(postTokenOwnerOf).to.eq(
        preAuctionFor.seller,
        "tokenId is transfered to token owner"
      );
      await expect(
        cardAuction.contract.auctionFor(lsp8Contract, tokenId)
      ).to.be.revertedWith("CardAuction: no auction for tokenId");

      const postCardAuctionAcceptedTokenBalanceOf =
        await getBalanceOfAcceptedToken({
          tokenOwner: cardAuction.contract.address,
          acceptedToken: preAuctionFor.acceptedToken,
        });
      expect(postCardAuctionAcceptedTokenBalanceOf).to.eq(
        preCardAuctionAcceptedTokenBalanceOf,
        "auction contract accepted token balance has no change"
      );

      const postSellerClaimableAmountsFor =
        await cardAuction.contract.claimableAmountsFor(
          preAuctionFor.seller,
          preAuctionFor.acceptedToken
        );
      expect(postSellerClaimableAmountsFor).to.eq(
        preSellerClaimableAmountsFor,
        "seller claimable balance has no change"
      );
    };

    const cancelAuctionForErrorScenario = async (
      { lsp8Contract, tokenId }: CancelAuctionForTxParams,
      signer: SignerWithAddress,
      expectedError: string
    ) => {
      const { cardAuction } = context;

      await expect(
        cardAuction.contract
          .connect(signer)
          .cancelAuctionFor(lsp8Contract, tokenId)
      ).to.be.revertedWith(expectedError);
    };

    const prepareToCancelAuction = async (
      auctionParams: PrepareAuctionParams
    ): Promise<PrepareAuctionParams> => {
      const { accounts, cardAuction } = context;

      await prepareAuction(
        hre.network.name,
        cardAuction.contract,
        accounts.owner,
        auctionParams
      );

      return auctionParams;
    };

    describe("when tx params are invalid", () => {
      describe("when there is no auction for the tokenId", () => {
        it("should fail", async () => {
          const { accounts, cardToken } = context;

          const signer = accounts.owner;
          const txParams = {
            lsp8Contract: cardToken.contract.address,
            tokenId: tokenIdMap.noAuction,
          };

          await cancelAuctionForErrorScenario(
            txParams,
            signer,
            "CardAuction: no auction for tokenId"
          );
        });
      });
    });

    describe("when tx params are valid", () => {
      describe("when the non-tokenId owner sends tx", () => {
        it("should fail", async () => {
          const { accounts, cardToken, fanzoneToken } = context;

          const auctionParams = await prepareToCancelAuction({
            acceptedToken: fanzoneToken.contract.address,
            lsp8Contract: cardToken.contract.address,
            minimumBid: ethers.BigNumber.from("10"),
            tokenId: tokenIdMap.withAuction,
            duration: auctionDuration.min,
          });

          const signer = accounts.anyone;
          const txParams = {
            lsp8Contract: auctionParams.lsp8Contract,
            tokenId: auctionParams.tokenId,
          };

          await cancelAuctionForErrorScenario(
            txParams,
            signer,
            "CardAuction: can not cancel auction for someone else"
          );
        });
      });

      describe("when the tokenId owner sends tx", () => {
        describe("when there is an active bidder", () => {
          it("should fail", async () => {
            const { accounts, cardAuction, cardToken, fanzoneToken } = context;

            const auctionParams = await prepareToCancelAuction({
              acceptedToken: fanzoneToken.contract.address,
              lsp8Contract: cardToken.contract.address,
              minimumBid: ethers.BigNumber.from("10"),
              tokenId: tokenIdMap.withAuction,
              duration: auctionDuration.min,
            });

            const seller = accounts.owner;
            const txParams = {
              lsp8Contract: auctionParams.lsp8Contract,
              tokenId: auctionParams.tokenId,
            };

            const bidder = accounts.tokenBuyer;
            await prepareToBidWithToken({
              acceptedToken: auctionParams.acceptedToken,
              bidAmount: auctionParams.minimumBid,
              cardAuction: cardAuction.contract,
              sendTokensFrom: accounts.owner,
              bidder,
            });
            await cardAuction.contract
              .connect(bidder)
              .submitBid(
                auctionParams.lsp8Contract,
                auctionParams.tokenId,
                auctionParams.minimumBid,
                {
                  value:
                    auctionParams.acceptedToken === ethers.constants.AddressZero
                      ? auctionParams.minimumBid
                      : ethers.constants.Zero,
                }
              );

            await cancelAuctionForErrorScenario(
              txParams,
              seller,
              "CardAuction: can not cancel auction with bidder"
            );
          });
        });

        describe("when there is no active bidder", () => {
          it("should cancel auction", async () => {
            const { accounts, cardToken } = context;

            const auctionParams = await prepareToCancelAuction({
              acceptedToken: ethers.constants.AddressZero,
              lsp8Contract: cardToken.contract.address,
              minimumBid: ethers.BigNumber.from("10"),
              tokenId: tokenIdMap.withAuction,
              duration: auctionDuration.min,
            });

            const signer = accounts.owner;
            const txParams = {
              lsp8Contract: auctionParams.lsp8Contract,
              tokenId: auctionParams.tokenId,
            };

            await cancelAuctionForSuccessScenario(txParams, signer);
          });
        });
      });
    });
  });

  describe("closeAuctionFor", () => {
    type CloseAuctionForTxParams = {
      lsp8Contract: Address;
      tokenId: BytesLike;
    };

    const closeAuctionForSuccessScenario = async (
      { lsp8Contract, tokenId }: CloseAuctionForTxParams,
      signer: SignerWithAddress
    ) => {
      const { cardAuction, cardToken } = context;

      // pre-conditions
      const preTokenOwnerOf = await cardToken.contract.tokenOwnerOf(tokenId);
      expect(preTokenOwnerOf).to.eq(
        cardAuction.contract.address,
        "tokenId is owned by CardAuction"
      );

      const preAuctionFor = await cardAuction.contract.auctionFor(
        lsp8Contract,
        tokenId
      );
      expect(preAuctionFor.minimumBid.gt("0")).to.eq(
        true,
        "tokenId has an auction"
      );

      const preCardAuctionAcceptedTokenBalanceOf =
        await getBalanceOfAcceptedToken({
          tokenOwner: cardAuction.contract.address,
          acceptedToken: preAuctionFor.acceptedToken,
        });

      const preSellerClaimableAmountsFor =
        await cardAuction.contract.claimableAmountsFor(
          preAuctionFor.seller,
          preAuctionFor.acceptedToken
        );

      const preBidderClaimableAmountsFor =
        await cardAuction.contract.claimableAmountsFor(
          preAuctionFor.activeBidder,
          preAuctionFor.acceptedToken
        );

      // effects
      const tx = await waitForTxOnNetwork(
        hre.network.name,
        cardAuction.contract
          .connect(signer)
          .closeAuctionFor(lsp8Contract, tokenId)
      );
      await expect(tx.sentTx)
        .to.emit(cardAuction.contract, "AuctionClose")
        .withArgs(
          lsp8Contract,
          tokenId,
          preAuctionFor.activeBidder,
          preAuctionFor.activeBidAmount
        );

      // post-conditions
      const postTokenOwnerOf = await cardToken.contract.tokenOwnerOf(tokenId);
      expect(postTokenOwnerOf).to.eq(
        preAuctionFor.activeBidder,
        "tokenId is transfered to winning bid"
      );

      await expect(
        cardAuction.contract.auctionFor(lsp8Contract, tokenId)
      ).to.be.revertedWith("CardAuction: no auction for tokenId");

      const postCardAuctionAcceptedTokenBalanceOf =
        await getBalanceOfAcceptedToken({
          tokenOwner: cardAuction.contract.address,
          acceptedToken: preAuctionFor.acceptedToken,
        });
      expect(postCardAuctionAcceptedTokenBalanceOf).to.eq(
        preCardAuctionAcceptedTokenBalanceOf,
        "auction contract accepted token balance has no change"
      );

      const postSellerClaimableAmountsFor =
        await cardAuction.contract.claimableAmountsFor(
          preAuctionFor.seller,
          preAuctionFor.acceptedToken
        );
      expect(postSellerClaimableAmountsFor).to.eq(
        preSellerClaimableAmountsFor.add(preAuctionFor.activeBidAmount),
        "seller claimable balance increased"
      );

      const postBidderClaimableAmountsFor =
        await cardAuction.contract.claimableAmountsFor(
          preAuctionFor.activeBidder,
          preAuctionFor.acceptedToken
        );
      expect(postBidderClaimableAmountsFor).to.eq(
        preBidderClaimableAmountsFor,
        "active bidder claimable bid has no change"
      );
    };

    const closeAuctionForErrorScenario = async (
      { lsp8Contract, tokenId }: CloseAuctionForTxParams,
      signer: SignerWithAddress,
      expectedError: string
    ) => {
      const { cardAuction } = context;

      await expect(
        cardAuction.contract
          .connect(signer)
          .closeAuctionFor(lsp8Contract, tokenId)
      ).to.be.revertedWith(expectedError);
    };

    const prepareToCloseAuction = async (
      auctionParams: PrepareAuctionParams,
      activeBidder: SignerWithAddress
    ): Promise<PrepareAuctionParams> => {
      const { accounts, cardAuction, fanzoneToken } = context;

      await prepareAuction(
        hre.network.name,
        cardAuction.contract,
        accounts.owner,
        auctionParams
      );

      const firstBidder = accounts.anyone;
      if (auctionParams.acceptedToken === fanzoneToken.contract.address) {
        await Promise.all([
          // setup another account to make first bid
          prepareToBidWithToken({
            acceptedToken: auctionParams.acceptedToken,
            bidAmount: auctionParams.minimumBid,
            cardAuction: cardAuction.contract,
            sendTokensFrom: accounts.owner,
            bidder: firstBidder,
          }),
          // setup active bidder to make second bid
          prepareToBidWithToken({
            acceptedToken: auctionParams.acceptedToken,
            bidAmount: auctionParams.minimumBid.mul(2),
            cardAuction: cardAuction.contract,
            sendTokensFrom: accounts.owner,
            bidder: activeBidder,
          }),
        ]);
      } else if (auctionParams.acceptedToken !== ethers.constants.AddressZero) {
        throw Error("unknown acceptedToken address");
      }

      // first bid
      await cardAuction.contract
        .connect(firstBidder)
        .submitBid(
          auctionParams.lsp8Contract,
          auctionParams.tokenId,
          auctionParams.minimumBid,
          {
            value:
              auctionParams.acceptedToken === ethers.constants.AddressZero
                ? auctionParams.minimumBid
                : ethers.constants.Zero,
          }
        );

      // second bid
      await cardAuction.contract
        .connect(activeBidder)
        .submitBid(
          auctionParams.lsp8Contract,
          auctionParams.tokenId,
          auctionParams.minimumBid.mul(2),
          {
            value:
              auctionParams.acceptedToken === ethers.constants.AddressZero
                ? auctionParams.minimumBid.mul(2)
                : ethers.constants.Zero,
          }
        );

      return auctionParams;
    };

    describe("when tx params are invalid", () => {
      describe("when there is no auction for the tokenId", () => {
        it("should fail", async () => {
          const { accounts, cardToken } = context;

          const signer = accounts.owner;
          const txParams = {
            lsp8Contract: cardToken.contract.address,
            tokenId: tokenIdMap.noAuction,
          };

          await closeAuctionForErrorScenario(
            txParams,
            signer,
            "CardAuction: no auction for tokenId"
          );
        });
      });
    });

    describe("when tx params are valid", () => {
      describe("when the auction end time is in the future", () => {
        it("should fail", async () => {
          const { accounts, cardAuction, cardToken, fanzoneToken } = context;

          const auctionParams = await prepareToCloseAuction(
            {
              acceptedToken: fanzoneToken.contract.address,
              lsp8Contract: cardToken.contract.address,
              minimumBid: ethers.BigNumber.from("10"),
              tokenId: tokenIdMap.withAuction,
              duration: auctionDuration.min,
            },
            accounts.tokenBuyer
          );

          const signer = accounts.anyone;
          const txParams = {
            lsp8Contract: auctionParams.lsp8Contract,
            tokenId: auctionParams.tokenId,
          };

          const auctionFor = await cardAuction.contract.auctionFor(
            auctionParams.lsp8Contract,
            auctionParams.tokenId
          );
          await hre.ethers.provider.send("evm_setNextBlockTimestamp", [
            auctionFor.endTime.sub(1).toNumber(),
          ]);

          await closeAuctionForErrorScenario(
            txParams,
            signer,
            "CardAuction: auction is active"
          );
        });
      });

      describe("when the auction end time is in the past", () => {
        describe("when auction acceptedToken is the native blockchain coin", () => {
          it("should close auction", async () => {
            const { accounts, cardAuction, cardToken } = context;

            const auctionParams = await prepareToCloseAuction(
              {
                acceptedToken: ethers.constants.AddressZero,
                lsp8Contract: cardToken.contract.address,
                minimumBid: ethers.BigNumber.from("10"),
                tokenId: tokenIdMap.withAuction,
                duration: auctionDuration.min,
              },
              accounts.tokenBuyer
            );

            const signer = accounts.owner;
            const txParams = {
              lsp8Contract: auctionParams.lsp8Contract,
              tokenId: auctionParams.tokenId,
            };

            const auctionFor = await cardAuction.contract.auctionFor(
              auctionParams.lsp8Contract,
              auctionParams.tokenId
            );
            await hre.ethers.provider.send("evm_setNextBlockTimestamp", [
              auctionFor.endTime.toNumber(),
            ]);

            await closeAuctionForSuccessScenario(txParams, signer);
          });
        });

        describe("when auction acceptedToken is a LSP7 token", () => {
          it("should close auction", async () => {
            const { accounts, cardAuction, cardToken, fanzoneToken } = context;

            const auctionParams = await prepareToCloseAuction(
              {
                acceptedToken: fanzoneToken.contract.address,
                lsp8Contract: cardToken.contract.address,
                minimumBid: ethers.BigNumber.from("10"),
                tokenId: tokenIdMap.withAuction,
                duration: auctionDuration.min,
              },
              accounts.tokenBuyer
            );

            const signer = accounts.owner;
            const txParams = {
              lsp8Contract: auctionParams.lsp8Contract,
              tokenId: auctionParams.tokenId,
            };

            const auctionFor = await cardAuction.contract.auctionFor(
              auctionParams.lsp8Contract,
              auctionParams.tokenId
            );
            await hre.ethers.provider.send("evm_setNextBlockTimestamp", [
              auctionFor.endTime.toNumber(),
            ]);

            await closeAuctionForSuccessScenario(txParams, signer);
          });
        });
      });
    });
  });

  describe("claimableAmountsFor", () => {
    describe("when there is no claimable amount", () => {
      it("should return zero", async () => {
        const { accounts, cardAuction, fanzoneToken } = context;

        const claimableAmount = await cardAuction.contract.claimableAmountsFor(
          accounts.anyone.address,
          fanzoneToken.contract.address
        );
        expect(claimableAmount).to.eq(ethers.constants.Zero);
      });
    });

    describe("when there is a claimable amount", () => {
      it("should return the amount", async () => {
        const { accounts, cardAuction, cardToken, fanzoneToken } = context;

        const seller = accounts.owner;
        const { auctionParams } = await prepareAuction(
          hre.network.name,
          cardAuction.contract,
          seller,
          {
            acceptedToken: fanzoneToken.contract.address,
            duration: auctionDuration.min,
            lsp8Contract: cardToken.contract.address,
            minimumBid: ethers.BigNumber.from("10"),
            tokenId: tokenIdMap.withAuction,
          }
        );

        const bidder = accounts.tokenBuyer;
        await prepareToBidWithToken({
          acceptedToken: auctionParams.acceptedToken,
          bidAmount: auctionParams.minimumBid,
          cardAuction: cardAuction.contract,
          sendTokensFrom: accounts.owner,
          bidder,
        });
        await cardAuction.contract
          .connect(bidder)
          .submitBid(
            auctionParams.lsp8Contract,
            auctionParams.tokenId,
            auctionParams.minimumBid
          );

        const auctionFor = await cardAuction.contract.auctionFor(
          auctionParams.lsp8Contract,
          auctionParams.tokenId
        );
        await hre.ethers.provider.send("evm_setNextBlockTimestamp", [
          auctionFor.endTime.toNumber(),
        ]);
        await cardAuction.contract
          .connect(seller)
          .closeAuctionFor(auctionParams.lsp8Contract, auctionParams.tokenId);

        const claimableAmount = await cardAuction.contract.claimableAmountsFor(
          seller.address,
          auctionParams.acceptedToken
        );
        expect(claimableAmount).to.eq(auctionParams.minimumBid);
      });
    });
  });

  describe("claimToken", () => {
    type ClaimTokenTxParams = {
      account: Address;
      token: Address;
    };

    const claimTokenSuccessScenario = async (
      { account, token }: ClaimTokenTxParams,
      signer: SignerWithAddress
    ) => {
      const { cardAuction, fanzoneToken } = context;

      // pre-conditions
      const preSellerAcceptedTokenBalanceOf =
        await fanzoneToken.contract.balanceOf(account);

      const preClaimableAmountsFor =
        await cardAuction.contract.claimableAmountsFor(account, token);
      expect(preClaimableAmountsFor.gt(0)).to.eq(
        true,
        "account has a claimable balance"
      );

      // effects
      await cardAuction.contract.connect(signer).claimToken(account, token);

      // post-conditions
      const postSellerAcceptedTokenBalanceOf =
        await fanzoneToken.contract.balanceOf(account);
      expect(postSellerAcceptedTokenBalanceOf).to.eq(
        preSellerAcceptedTokenBalanceOf.add(preClaimableAmountsFor),
        "account accepted token balance increased"
      );

      const postClaimableAmount =
        await cardAuction.contract.claimableAmountsFor(
          account,
          ethers.constants.AddressZero
        );
      expect(postClaimableAmount).to.eq(
        ethers.constants.Zero,
        "account claimable balance zeroed"
      );
    };

    describe("when there is no claimable amount", () => {
      it("should fail", async () => {
        const { accounts, cardAuction, fanzoneToken } = context;

        await expect(
          cardAuction.contract.claimToken(
            accounts.anyone.address,
            fanzoneToken.contract.address
          )
        ).to.revertedWith("CardAuction: no claimable amount");
      });
    });

    describe("when there is a claimable amount", () => {
      const prepareToClaimToken = async (
        auctionParams: PrepareAuctionParams,
        seller: SignerWithAddress
      ): Promise<PrepareAuctionParams> => {
        const { accounts, cardAuction } = context;

        await prepareAuction(
          hre.network.name,
          cardAuction.contract,
          seller,
          auctionParams
        );

        const bidder = accounts.tokenBuyer;
        await prepareToBidWithToken({
          acceptedToken: auctionParams.acceptedToken,
          bidAmount: auctionParams.minimumBid,
          cardAuction: cardAuction.contract,
          sendTokensFrom: accounts.owner,
          bidder,
        });
        await cardAuction.contract
          .connect(bidder)
          .submitBid(
            auctionParams.lsp8Contract,
            auctionParams.tokenId,
            auctionParams.minimumBid
          );

        const auctionFor = await cardAuction.contract.auctionFor(
          auctionParams.lsp8Contract,
          auctionParams.tokenId
        );
        await hre.ethers.provider.send("evm_setNextBlockTimestamp", [
          auctionFor.endTime.toNumber(),
        ]);
        await cardAuction.contract
          .connect(seller)
          .closeAuctionFor(auctionParams.lsp8Contract, auctionParams.tokenId);

        return auctionParams;
      };

      describe("when claim address sends the tx", () => {
        it("should transfer the claimable token amount", async () => {
          const { accounts, cardToken, fanzoneToken } = context;

          const seller = accounts.owner;
          const auctionParams = await prepareToClaimToken(
            {
              acceptedToken: fanzoneToken.contract.address,
              duration: auctionDuration.min,
              lsp8Contract: cardToken.contract.address,
              minimumBid: ethers.BigNumber.from("10"),
              tokenId: tokenIdMap.withAuction,
            },
            seller
          );

          const txParams = {
            account: seller.address,
            token: auctionParams.acceptedToken,
          };
          await claimTokenSuccessScenario(txParams, seller);
        });
      });

      describe("when non-claim address sends the tx", () => {
        it("should transfer the claimable token amount", async () => {
          const { accounts, cardToken, fanzoneToken } = context;

          const seller = accounts.owner;
          const auctionParams = await prepareToClaimToken(
            {
              acceptedToken: fanzoneToken.contract.address,
              duration: auctionDuration.min,
              lsp8Contract: cardToken.contract.address,
              minimumBid: ethers.BigNumber.from("10"),
              tokenId: tokenIdMap.withAuction,
            },
            seller
          );

          const signer = accounts.anyone;
          const txParams = {
            account: seller.address,
            token: auctionParams.acceptedToken,
          };
          await claimTokenSuccessScenario(txParams, signer);
        });
      });
    });
  });
});
