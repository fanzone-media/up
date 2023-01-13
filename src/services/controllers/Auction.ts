/* eslint-disable react-hooks/rules-of-hooks */
import { BigNumberish, Signer } from 'ethers';
import { NetworkName } from '../../boot/types';
import { useRpcProvider } from '../../hooks/useRpcProvider';
import { CardAuction__factory } from '../../submodules/fanzone-smart-contracts/typechain';
import { tokenIdAsBytes32 } from '../../utils/cardToken';
import { Address } from '../../utils/types';
import { IAuctionMarket, IAuctionOptions, IAuctionState } from '../models';

export const auctionContracts = {
  l14: '',
  l16: '0xEA1062CC65A0601C2adAA5e27B40e886726F3FE2',
  ethereum: '',
  polygon: '0x1B29547c6bD8F9312331B5f059F6572526D0Da59',
  mumbai: '',
};

const encodeOpenAuctionFor = (
  assetAddress: Address,
  tokenId: number,
  acceptedToken: Address,
  minimumBid: BigNumberish,
  duration: number,
  signer: Signer,
  network: NetworkName,
): string => {
  const contract = CardAuction__factory.connect(
    auctionContracts[network],
    signer,
  );

  const encodedOpenAuctionFor = contract.interface.encodeFunctionData(
    'openAuctionFor',
    [
      assetAddress,
      tokenIdAsBytes32(tokenId),
      acceptedToken,
      minimumBid.toString(),
      duration,
    ],
  );
  return encodedOpenAuctionFor;
};

const encodeCancelAuctionFor = (
  assetAddress: Address,
  tokenId: number,
  signer: Signer,
  network: NetworkName,
): string => {
  const contract = CardAuction__factory.connect(
    auctionContracts[network],
    signer,
  );

  const encodedCancelAuctionFor = contract.interface.encodeFunctionData(
    'cancelAuctionFor',
    [assetAddress, tokenIdAsBytes32(tokenId)],
  );
  return encodedCancelAuctionFor;
};

const encodeSubmitBid = (
  assetAddress: Address,
  tokenId: number,
  bidAmount: BigNumberish,
  signer: Signer,
  network: NetworkName,
): string => {
  const contract = CardAuction__factory.connect(
    auctionContracts[network],
    signer,
  );

  const encodedSubmitBid = contract.interface.encodeFunctionData('submitBid', [
    assetAddress,
    tokenIdAsBytes32(tokenId),
    bidAmount.toString(),
  ]);

  return encodedSubmitBid;
};

const fetchAuctionSettings = async (
  network: NetworkName,
): Promise<IAuctionOptions | null> => {
  try {
    const provider = useRpcProvider(network);
    const contract = CardAuction__factory.connect(
      auctionContracts[network],
      provider,
    );

    const { minAuctionDuration, maxAuctionDuration, bidExtensionDuration } =
      await contract.auctionSettings();

    return {
      minAuctionDuration,
      maxAuctionDuration,
      bidExtensionDuration,
    };
  } catch (error) {
    return null;
  }
};

const fetchAuctionFor = async (
  network: NetworkName,
  tokenAddress: Address,
  tokenId: number,
): Promise<IAuctionState | null> => {
  try {
    const provider = useRpcProvider(network);
    const contract = CardAuction__factory.connect(
      auctionContracts[network],
      provider,
    );

    const {
      acceptedToken,
      seller,
      minimumBid,
      activeBidder,
      activeBidAmount,
      endTime,
    } = await contract.auctionFor(tokenAddress, tokenIdAsBytes32(tokenId));

    return {
      acceptedToken,
      seller,
      minimumBid: Number(minimumBid.toString()),
      activeBidder,
      activeBidAmount: Number(activeBidAmount.toString()),
      endTime: Number(endTime.toString()),
    };
  } catch (error) {
    return null;
  }
};

const fetchAllAuctionFor = async (
  assetAddress: Address,
  network: NetworkName,
): Promise<IAuctionMarket[] | null> => {
  try {
    const provider = useRpcProvider(network);
    const contract = CardAuction__factory.connect(
      auctionContracts[network],
      provider,
    );

    const { auctions } = await contract.getAuctionsForLSP8Contract(
      assetAddress,
    );

    const auctionsMap = auctions.map((item) => {
      const { tokenId, auction } = item;
      return {
        tokenId,
        auction: {
          acceptedToken: auction.acceptedToken,
          seller: auction.seller,
          minimumBid: Number(auction.minimumBid.toString()),
          activeBidder: auction.activeBidder,
          activeBidAmount: Number(auction.activeBidAmount.toString()),
          endTime: Number(auction.endTime.toString()),
        },
      };
    });

    return auctionsMap.length > 0 ? auctionsMap : null;
  } catch (error) {
    return null;
  }
};

export const AuctionApi = {
  encodeOpenAuctionFor,
  encodeCancelAuctionFor,
  encodeSubmitBid,
  fetchAuctionSettings,
  fetchAuctionFor,
  fetchAllAuctionFor,
};
