/* eslint-disable react-hooks/rules-of-hooks */
import KeyChain from '../utilities/KeyChain';
import { NetworkName } from '../../boot/types';
import { ICard, ILSP8MetaData, IMarket } from '../models';
import { getLSP4Metadata } from '../ipfsClient';
import { BigNumberish, ethers } from 'ethers';
import {
  CardTokenProxy__factory,
  UniversalProfileProxy__factory,
} from '../../submodules/fanzone-smart-contracts/typechain';
import Utils from '../utilities/util';
import { LSP3ProfileApi } from './LSP3Profile';
import { useRpcProvider } from '../../hooks/useRpcProvider';
import { tokenIdAsBytes32 } from '../../utils/cardToken';

const fetchCard = async (
  address: string,
  network: NetworkName,
): Promise<ICard> => {
  const provider = useRpcProvider(network);
  const contract = CardTokenProxy__factory.connect(address, provider);
  await contract
    .supportsInterface('0x49399145')
    .then((result) => {
      if (result === false) throw new Error('Not an lsp8 asset');
    })
    .catch(() => {
      throw new Error('Not an lsp8 asset');
    });

  const [name, symbol, totalSupply, owner, holders, hashedUrl] =
    await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.totalSupply(),
      contract.owner(),
      contract.allTokenHolders(),
      contract.tokenURI(0),
    ]);

  if (!hashedUrl) {
    throw new Error('No card data');
  }
  const result = await getLSP4Metadata(hashedUrl);
  let creators: string[] = [];
  await LSP3ProfileApi.fetchCreatorsAddresses(address, network)
    .then((result) => {
      creators = result;
    })
    .catch((error) => {
      console.log(error);
    });
  return {
    address,
    name,
    symbol,
    totalSupply: ethers.BigNumber.from(totalSupply).toNumber(),
    ls8MetaData: {
      '0': {
        ...result,
        image: result.image.startsWith('ipfs://')
          ? Utils.convertImageURL(result.image)
          : result.image,
      },
    },
    owner,
    holders: holders.map((holder: string) => `0x${holder.slice(26)}`),
    creators,
    network: network,
    markets: [],
  };
};

const fetchAllCards = async (
  network: NetworkName,
  addresses: string[],
): Promise<ICard[]> => {
  let assets: ICard[] = [];
  const cardFetcher = fetchCard;
  await Promise.allSettled(
    new Array(addresses.length).fill(0).map(async (_, index) => {
      const asset = await cardFetcher(addresses[index], network);
      return asset;
    }),
  ).then((results) =>
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        assets.push(result.value);
      }
    }),
  );
  return assets;
};

const fetchMetaDataForTokenID = async (
  assetAddress: string,
  tokenId: BigNumberish,
  network: NetworkName,
): Promise<ILSP8MetaData> => {
  const provider = useRpcProvider(network);
  const contract = CardTokenProxy__factory.connect(assetAddress, provider);
  await contract
    .supportsInterface('0x49399145')
    .then((result) => {
      if (result === false) throw new Error('Not an lsp8 asset');
    })
    .catch(() => {
      throw new Error('Not an lsp8 asset');
    });
  const tokenUri = await contract.tokenURI(tokenId);
  const metaData = await getLSP4Metadata(tokenUri);

  return {
    ...metaData,
    image: metaData.image.startsWith('ipfs://')
      ? Utils.convertImageURL(metaData.image)
      : metaData.image,
  };
};

const fetchAllMarkets = async (
  assetAddress: string,
  network: NetworkName,
): Promise<IMarket[]> => {
  const provider = useRpcProvider(network);
  const contract = CardTokenProxy__factory.connect(assetAddress, provider);
  try {
    const markets = await contract.getAllMarkets();
    return markets;
  } catch (error) {
    throw new Error('No Markets available');
  }
};

const fetchProfileIssuedAssetsAddresses = async (
  network: NetworkName,
  profileAddress: string,
): Promise<string[]> => {
  const provider = useRpcProvider(network);
  const contract = UniversalProfileProxy__factory.connect(
    profileAddress,
    provider,
  );

  let assets: string[] = [];
  // Use the LSP3IssuedAssets_KEY to request the number of elements
  // response ex: 0x0000000000000000000000000000000000000000000000000000000000000002 (2 elements)
  const numAssetsHex = await contract.getData([KeyChain.LSP3IssuedAssets]);

  // Convert the hex to decimal
  //
  // Example:
  //      0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000007 => 7
  //      0x000000000000000000000000000000000000000000000000000000000000000a => 10
  //      0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000013 => 19
  // const numAssets = EthereumSerive.web3.utils.hexToNumber(numAssetsHex);
  const numAssets = parseInt(numAssetsHex[0], 16);

  if (isNaN(numAssets) || numAssets === 0) {
    //return assets;
    return assets;
    //throw new Error('No Assets');
  }

  // The first 16 bytes are the first 16 bytes of the key hash     => [elementPrefix]
  // The second 16 bytes is a uint128 of the number of the element => [elementSufix]
  //
  // Get the first 16 bytes + '0x' => 34
  const elementPrefix = KeyChain.LSP3IssuedAssets.slice(0, 34);

  await Promise.allSettled(
    new Array(numAssets).fill(0).map(async (_, index) => {
      // Conver the number to hex and remove the perfix ('0x')
      //
      // Example:
      //      19   => 0x13
      //      0x13 => 13
      const elementSufix = index.toString(16);

      // Create the element key by appending the prefix with the sufix and filling the
      // prefix with enough '0's to reach the 32 byte key
      //
      // Example:
      //      elementPrefix = 0x3a47ab5bd3a594c3a8995f8fa58d0876
      //      elementSufix  = 5
      //      elementKey    = 0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000005
      const elementKey =
        elementPrefix.padEnd(66 - elementSufix.length, '0') + elementSufix;

      const assetAddr = await contract.getData([elementKey]);

      return assetAddr[0];
    }),
  ).then((results) =>
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        assets.push(result.value);
      }
    }),
  );

  return assets;
};

const sellCard = async (
  assetAddress: string,
  tokenId: number,
  acceptedToken: string,
  minimumAmount: number,
  network: NetworkName,
) => {
  const provider = useRpcProvider(network);
  const contract = CardTokenProxy__factory.connect(assetAddress, provider);
  const tokenIdAsBytes = tokenIdAsBytes32(tokenId);
  await contract.setMarketFor(tokenIdAsBytes, acceptedToken, minimumAmount);
};

const getTokenSale = async (
  assetAddress: string,
  tokenId: number,
  network: NetworkName,
): Promise<{ minimumAmount: number; acceptedToken: string }> => {
  const provider = useRpcProvider(network);
  const contract = CardTokenProxy__factory.connect(assetAddress, provider);
  const tokenIdAsBytes = tokenIdAsBytes32(tokenId);
  let market: { minimumAmount: number; acceptedToken: string } = {
    minimumAmount: 0,
    acceptedToken: '',
  };
  await contract
    .marketFor(tokenIdAsBytes)
    .then((result) => {
      market = {
        ...result,
        minimumAmount: ethers.BigNumber.from(result.minimumAmount).toNumber(),
      };
    })
    .catch((error) => {
      console.error(error.message);
    });
  return market;
};

export const LSP4DigitalAssetApi = {
  fetchCard,
  fetchProfileIssuedAssetsAddresses,
  fetchAllCards,
  getTokenSale,
  sellCard,
  fetchMetaDataForTokenID,
  fetchAllMarkets,
};
