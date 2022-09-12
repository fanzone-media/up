/* eslint-disable react-hooks/rules-of-hooks */
import { BigNumber, BytesLike, Signer } from 'ethers';
import { NetworkName } from '../../boot/types';
import { useRpcProvider } from '../../hooks/useRpcProvider';
import { CardAuction__factory } from '../../submodules/fanzone-smart-contracts/typechain';
import { Address } from '../../utils/types';

export const auctionContracts = {
  l14: '',
  l16: '',
  ethereum: '',
  polygon: '',
  mumbai: '',
};

const encodeOpenAuctionFor = (
  assetAddress: Address,
  tokenId: BytesLike,
  acceptedToken: Address,
  minimumBid: BigNumber,
  duration: BigNumber,
  signer: Signer,
  network: NetworkName,
) => {
  const contract = CardAuction__factory.connect(
    auctionContracts[network],
    signer,
  );

  const encodedOpenAuctionFor = contract.interface.encodeFunctionData(
    'openAuctionFor',
    [assetAddress, tokenId, acceptedToken, minimumBid, duration],
  );
  return encodedOpenAuctionFor;
};

export const AuctionApi = {
  encodeOpenAuctionFor,
};
