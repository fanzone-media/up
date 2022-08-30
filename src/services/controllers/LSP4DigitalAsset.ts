/* eslint-disable react-hooks/rules-of-hooks */
import KeyChain from '../utilities/KeyChain';
import { NetworkName } from '../../boot/types';
import {
  ICard,
  ILSP8MetaData,
  IMarket,
  IWhiteListedTokens,
  SupportedInterface,
} from '../models';
import { getLSP4Metadata } from '../ipfsClient';
import { BigNumber, BigNumberish, ethers, Signer } from 'ethers';
import {
  CardTokenProxy__factory,
  ContractRegistry__factory,
  UniversalProfileProxy__factory,
} from '../../submodules/fanzone-smart-contracts/typechain';
import { LSP3ProfileApi } from './LSP3Profile';
import { useRpcProvider } from '../../hooks/useRpcProvider';
import { tokenIdAsBytes32 } from '../../utils/cardToken';
import { erc20ABI } from 'wagmi';
import { Provider } from '@ethersproject/providers';
import ABIs from '../utilities/ABIs';

const fetchCard = async (
  address: string,
  network: NetworkName,
  tokenId?: BigNumberish,
): Promise<ICard> => {
  const provider = useRpcProvider(network);
  const contract = CardTokenProxy__factory.connect(address, provider);
  const contractLSP4 = new ethers.Contract(
    address,
    ABIs.LSP4DigitalCertificateABI,
    provider,
  );

  let supportedInterface: SupportedInterface | null = null;

  // tokenId &&
  //   (await contract.ownerOf(tokenId).catch(() => {
  //     throw new Error('Not a valid token id');
  //   }));

  const [
    name,
    symbol,
    totalSupply,
    owner,
    holders,
    lsp8MetaDataUrl,
    lsp4MetaDataUrl,
    erc721MetaDataUrl,
    whiteListedTokens,
  ] = await Promise.allSettled([
    contract.name(),
    contract.symbol(),
    contract.totalSupply(),
    contract.owner(),
    contract.allTokenHolders(),
    contract.getData([KeyChain.LSP4Metadata]),
    contractLSP4.getData(KeyChain.LSP4Metadata),
    contract.tokenURI(0),
    fetchAcceptedTokens(address, network),
  ]);

  let metaDataUrl: string = '';

  if (lsp8MetaDataUrl.status === 'fulfilled') {
    metaDataUrl = lsp8MetaDataUrl.value[0];
    supportedInterface = 'lsp8';
  }
  if (lsp4MetaDataUrl.status === 'fulfilled') {
    metaDataUrl = lsp4MetaDataUrl.value;
    supportedInterface = 'lsp4';
  }
  if (
    lsp4MetaDataUrl.status === 'rejected' &&
    lsp8MetaDataUrl.status === 'rejected' &&
    erc721MetaDataUrl.status === 'fulfilled'
  ) {
    metaDataUrl = erc721MetaDataUrl.value;
    supportedInterface = 'erc721';
  }

  if (!supportedInterface) throw new Error('No Asset Found');

  const result = await getLSP4Metadata(metaDataUrl, supportedInterface);

  let creators: string[] = [];
  supportedInterface !== 'erc721' &&
    (await LSP3ProfileApi.fetchCreatorsAddresses(
      address,
      network,
      supportedInterface,
    )
      .then((result) => {
        creators = result;
      })
      .catch((error) => {
        console.log(error);
      }));
  return {
    address,
    name: name.status === 'fulfilled' ? name.value : 'unknown',
    symbol: symbol.status === 'fulfilled' ? symbol.value : '',
    totalSupply:
      totalSupply.status === 'fulfilled' ? totalSupply.value.toNumber() : 0,
    lsp8MetaData: {
      '0': result,
    },
    owner: owner.status === 'fulfilled' ? owner.value : '0x',
    holders:
      holders.status === 'fulfilled'
        ? holders.value.map((holder: string) => `0x${holder.slice(26)}`)
        : [],
    creators,
    network: network,
    markets: [],
    supportedInterface,
    whiteListedTokens:
      whiteListedTokens.status === 'fulfilled' ? whiteListedTokens.value : [],
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

const fetchOwnerOfTokenId = async (
  assetAddress: string,
  tokenId: BigNumberish,
  network: NetworkName,
): Promise<string> => {
  const provider = useRpcProvider(network);
  const contract = CardTokenProxy__factory.connect(assetAddress, provider);

  const ownerOf = await contract.ownerOf(tokenId);

  return ownerOf;
};

const fetchMetaDataForTokenID = async (
  assetAddress: string,
  tokenId: BigNumberish,
  network: NetworkName,
  supportedInterface: SupportedInterface,
): Promise<ILSP8MetaData> => {
  const provider = useRpcProvider(network);
  const contract = CardTokenProxy__factory.connect(assetAddress, provider);

  if (supportedInterface === 'lsp4') throw new Error('token ids not supported');

  const tokenUri = await contract.tokenURI(tokenId);
  const metaData = await getLSP4Metadata(tokenUri, 'erc721');

  return metaData;
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
  const universalProfileOld = new ethers.Contract(
    profileAddress,
    ABIs.LSP3AccountABI,
    provider,
  );

  let assets: string[] = [];
  // Use the LSP3IssuedAssets_KEY to request the number of elements
  // response ex: 0x0000000000000000000000000000000000000000000000000000000000000002 (2 elements)
  let numAssetsHex = '0x';

  await contract
    .getData([KeyChain.LSP3IssuedAssets])
    .then((res) => {
      numAssetsHex = res[0];
    })
    .catch(async () => {
      await universalProfileOld
        .getData(KeyChain.LSP3IssuedAssets)
        .then((res: string) => {
          numAssetsHex = res as string;
        })
        .catch(() => {});
    });

  // Convert the hex to decimal
  //
  // Example:
  //      0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000007 => 7
  //      0x000000000000000000000000000000000000000000000000000000000000000a => 10
  //      0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000013 => 19
  // const numAssets = EthereumSerive.web3.utils.hexToNumber(numAssetsHex);
  const numAssets = parseInt(numAssetsHex, 16);

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

      let assetAddr: string = '';

      await contract
        .getData([elementKey])
        .then((res) => {
          assetAddr = res[0];
        })
        .catch(async () => {
          await universalProfileOld
            .getData(elementKey)
            .then((res: string) => {
              assetAddr = res as string;
            })
            .catch(() => {});
        });

      // const assetAddr = await contract.getData([elementKey]);

      return assetAddr;
    }),
  ).then((results) =>
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value !== '0x') {
        assets.push(result.value);
      }
    }),
  );

  return assets;
};

const fetchAcceptedTokens = async (
  assetAddress: string,
  network: NetworkName,
): Promise<IWhiteListedTokens[]> => {
  const provider = useRpcProvider(network);
  const contract = CardTokenProxy__factory.connect(assetAddress, provider);
  let whiteListedTokens = [] as IWhiteListedTokens[];
  let contractRegistryAddress: string = ethers.constants.AddressZero;
  await contract
    .contractRegistry()
    .then((res) => {
      contractRegistryAddress = res;
    })
    .catch(() => {
      return whiteListedTokens;
    });
  const contractRegistry = ContractRegistry__factory.connect(
    contractRegistryAddress,
    provider,
  );

  await contractRegistry
    .allWhitelistedTokens()
    .then(async (res) => {
      whiteListedTokens = await Promise.all(
        res.map(async (item) => await fetchErc20TokenInfo(item, provider)),
      );
    })
    .catch(() => {
      return whiteListedTokens;
    });
  return whiteListedTokens;
};

const fetchErc20TokenInfo = async (
  address: string,
  providerOrSigner: Signer | Provider,
) => {
  const erc20Contract = new ethers.Contract(
    address,
    erc20ABI,
    providerOrSigner,
  );
  const symbol: string = await erc20Contract.symbol();
  const decimals: number = await erc20Contract.decimals();
  return {
    tokenAddress: address,
    symbol,
    decimals,
  };
};

const buyFromCardMarketViaUniversalProfile = async (
  assetAddress: string,
  universalProfileAddress: string,
  tokenId: number,
  minimumAmount: BigNumber,
  signer: Signer,
) => {
  const assetContract = CardTokenProxy__factory.connect(assetAddress, signer);
  const tokenIdBytes = tokenIdAsBytes32(tokenId);
  const universalProfileContract = UniversalProfileProxy__factory.connect(
    universalProfileAddress,
    signer,
  );

  const encodedBuyFromMarket = assetContract.interface.encodeFunctionData(
    'buyFromMarket',
    [tokenIdBytes, minimumAmount, '0x87847d301E8Da1D7E95263c3478d7F6e229E3F4b'],
  );

  const transaction = await universalProfileContract.execute(
    '0x0',
    assetAddress,
    0,
    encodedBuyFromMarket,
  );

  await transaction.wait(1).then((result) => {
    if (result.status === 0) {
      throw new Error('Transaction reverted');
    }
  });
};

const buyFromMarketViaEOA = async (
  assetAddress: string,
  tokenId: number,
  minimumAmount: BigNumber,
  signer: Signer,
) => {
  const assetContract = CardTokenProxy__factory.connect(assetAddress, signer);
  const tokenIdAsBytes = tokenIdAsBytes32(tokenId);
  const transaction = await assetContract.buyFromMarket(
    tokenIdAsBytes,
    minimumAmount,
    ethers.constants.AddressZero,
  );
  await transaction.wait(1).then((result) => {
    if (result.status === 0) {
      throw new Error('Transaction reverted');
    }
  });
};

const setMarketViaUniversalProfile = async (
  assetAddress: string,
  universalProfileAddress: string,
  tokenId: number,
  acceptedToken: string,
  minimumAmount: BigNumberish,
  signer: Signer,
) => {
  const assetContract = CardTokenProxy__factory.connect(assetAddress, signer);
  const universalProfileContract = UniversalProfileProxy__factory.connect(
    universalProfileAddress,
    signer,
  );
  const tokenIdAsBytes = tokenIdAsBytes32(tokenId);
  const encodedSetMarketFor = assetContract.interface.encodeFunctionData(
    'setMarketFor',
    [tokenIdAsBytes, acceptedToken, minimumAmount.toString()],
  );
  const transaction = await universalProfileContract.execute(
    '0x0',
    assetAddress,
    0,
    encodedSetMarketFor,
  );
  await transaction.wait(1).then((result) => {
    if (result.status === 0) {
      throw new Error('Transaction reverted');
    }
  });
};

const getTokenSale = async (
  assetAddress: string,
  tokenId: number,
  network: NetworkName,
): Promise<{ minimumAmount: BigNumber; acceptedToken: string }> => {
  const provider = useRpcProvider(network);
  const contract = CardTokenProxy__factory.connect(assetAddress, provider);
  const tokenIdAsBytes = tokenIdAsBytes32(tokenId);
  let market: { minimumAmount: BigNumber; acceptedToken: string } = {
    minimumAmount: BigNumber.from(0),
    acceptedToken: '',
  };
  await contract
    .marketFor(tokenIdAsBytes)
    .then((result) => {
      market = {
        ...result,
        minimumAmount: result.minimumAmount,
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
  setMarketViaUniversalProfile,
  fetchMetaDataForTokenID,
  fetchAllMarkets,
  fetchOwnerOfTokenId,
  fetchAcceptedTokens,
  fetchErc20TokenInfo,
  buyFromMarketViaEOA,
  buyFromCardMarketViaUniversalProfile,
};
