import hre from "hardhat";
import { ethers } from "ethers";

import { CardMarket, LSP7DigitalAsset__factory } from "../../typechain";

import type { BigNumber, BytesLike } from "ethers";
import type { Address, SignerWithAddress } from "../../utils/types";

export type PrepareMarketParams = {
  tokenId: BytesLike;
  acceptedToken: Address;
  minimumAmount: BigNumber;
};
export const prepareMarket = async (
  marketParams: PrepareMarketParams,
  seller: SignerWithAddress,
  cardMarket: CardMarket
): Promise<PrepareMarketParams> => {
  await cardMarket
    .connect(seller)
    .setMarketFor(
      marketParams.tokenId,
      marketParams.acceptedToken,
      marketParams.minimumAmount
    );

  return marketParams;
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

type PrepareToBuyWithTokenParams = {
  acceptedToken: Address;
  amount: BigNumber;
  cardMarket: CardMarket;
  sendTokensFrom: SignerWithAddress;
  buyer: SignerWithAddress;
};
export const prepareToBuyWithToken = ({
  acceptedToken,
  amount,
  cardMarket,
  sendTokensFrom,
  buyer,
}: PrepareToBuyWithTokenParams) => {
  if (acceptedToken === ethers.constants.AddressZero) return;

  const token = LSP7DigitalAsset__factory.connect(
    acceptedToken,
    hre.ethers.provider
  );

  return Promise.all([
    // buyer needs tokens
    token
      .connect(sendTokensFrom)
      .transfer(
        sendTokensFrom.address,
        buyer.address,
        amount,
        true,
        ethers.utils.toUtf8Bytes("tokens for market buyer")
      ),
    // buyer must authorize cardAuction contract before submitting a token bid
    token.connect(buyer).authorizeOperator(cardMarket.address, amount),
  ]);
};

export type CardMarketState = {
  acceptedToken: Address;
  minimumAmount: BigNumber;
};
export const parseMarketState = (data: any): CardMarketState => {
  return {
    acceptedToken: data.acceptedToken,
    minimumAmount: data.minimumAmount,
  };
};
