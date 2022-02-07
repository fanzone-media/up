import hre from "hardhat";
import { ethers } from "ethers";

import {
  LSP7DigitalAsset__factory,
  CardAuction,
  LSP8IdentifiableDigitalAsset__factory,
} from "../../typechain";
import {
  waitForTxOnNetwork,
  WaitForTxOnNetworkResult,
} from "../../utils/network";

import type { BigNumber, BytesLike } from "ethers";
import type { Address, SignerWithAddress } from "../../utils/types";

export const auctionDuration = {
  min: ethers.BigNumber.from(24 * 60 * 60), // 1 day
  max: ethers.BigNumber.from(30 * 24 * 60 * 60), // 30 days
};

export type PrepareAuctionParams = {
  lsp8Contract: Address;
  tokenId: BytesLike;
  acceptedToken: Address;
  minimumBid: BigNumber;
  duration: BigNumber;
};
export type PrepareAuctionResult = {
  expectedAuctionEndTime: BigNumber;
  auctionParams: PrepareAuctionParams;
  tx: WaitForTxOnNetworkResult;
};
export const prepareAuction = async (
  networkName: string,
  cardAuction: CardAuction,
  seller: SignerWithAddress,
  auctionParams: PrepareAuctionParams
): Promise<PrepareAuctionResult> => {
  const lsp8 = LSP8IdentifiableDigitalAsset__factory.connect(
    auctionParams.lsp8Contract,
    seller
  );

  await lsp8.authorizeOperator(cardAuction.address, auctionParams.tokenId);

  const tx = await waitForTxOnNetwork(
    networkName,
    cardAuction
      .connect(seller)
      .openAuctionFor(
        auctionParams.lsp8Contract,
        auctionParams.tokenId,
        auctionParams.acceptedToken,
        auctionParams.minimumBid,
        auctionParams.duration
      )
  );

  const blockWithTx = await hre.ethers.provider.getBlock(
    tx.txReceipt.blockNumber
  );
  const expectedAuctionEndTime = ethers.BigNumber.from(
    auctionParams.duration
  ).add(blockWithTx.timestamp);

  return { expectedAuctionEndTime, auctionParams, tx };
};

type PrepareToBidWithTokenParams = {
  acceptedToken: Address;
  bidAmount: BigNumber;
  cardAuction: CardAuction;
  sendTokensFrom: SignerWithAddress;
  bidder: SignerWithAddress;
};
export const prepareToBidWithToken = ({
  acceptedToken,
  bidAmount,
  cardAuction,
  sendTokensFrom,
  bidder,
}: PrepareToBidWithTokenParams) => {
  if (acceptedToken === ethers.constants.AddressZero) return;

  const token = LSP7DigitalAsset__factory.connect(
    acceptedToken,
    hre.ethers.provider
  );

  return Promise.all([
    // bidder needs tokens
    token
      .connect(sendTokensFrom)
      .transfer(
        sendTokensFrom.address,
        bidder.address,
        bidAmount,
        true,
        ethers.utils.toUtf8Bytes("tokens for auction bidder")
      ),
    // bidder must authorize cardAuction contract before submitting a token bid
    token.connect(bidder).authorizeOperator(cardAuction.address, bidAmount),
  ]);
};

type GetBalanceOfAcceptedTokenParams = {
  acceptedToken: Address;
  tokenOwner: Address;
};
export const getBalanceOfAcceptedToken = async ({
  acceptedToken,
  tokenOwner,
}: GetBalanceOfAcceptedTokenParams) => {
  let tokenBalanceOf;
  if (acceptedToken === ethers.constants.AddressZero) {
    tokenBalanceOf = await hre.ethers.provider.getBalance(tokenOwner);
  } else {
    tokenBalanceOf = await LSP7DigitalAsset__factory.connect(
      acceptedToken,
      hre.ethers.provider
    ).balanceOf(tokenOwner);
  }

  return tokenBalanceOf;
};

export type CardAuctionState = {
  seller: Address;
  lsp8Contract: Address;
  minimumBid: BigNumber;
  acceptedToken: Address;
  endTime: BigNumber;
  activeBidder: Address;
  activeBidAmount: BigNumber;
};
export const parseAuctionState = (data: any): CardAuctionState => {
  return {
    seller: data.seller,
    lsp8Contract: data.lsp8Contract,
    minimumBid: data.minimumBid,
    acceptedToken: data.acceptedToken,
    endTime: data.endTime,
    activeBidder: data.activeBidder,
    activeBidAmount: data.activeBidAmount,
  };
};
