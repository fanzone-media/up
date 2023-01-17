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
  CardMarket__factory,
  CardTokenProxy__factory,
  ContractRegistry__factory,
  UniversalProfileProxy__factory,
} from '../../submodules/fanzone-smart-contracts/typechain';
import { LSP3ProfileApi } from './LSP3Profile';
import { useRpcProvider } from '../../hooks/useRpcProvider';
import { tokenIdAsBytes32 } from '../../utils/cardToken';
import ABIs from '../utilities/ABIs';
import { Address } from '../../utils/types';
import { ERC20Api } from './ERC20';

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
    tokenSupplyCap,
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
    contract.tokenSupplyCap(),
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
  try {
    if (supportedInterface !== 'erc721') {
      creators = await LSP3ProfileApi.fetchCreatorsAddresses(
        address,
        network,
        supportedInterface,
      );
    }
  } catch (error) {
    creators = [];
  }

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
    market: [],
    auctionMarket: null,
    supportedInterface,
    whiteListedTokens:
      whiteListedTokens.status === 'fulfilled' ? whiteListedTokens.value : [],
    tokenSupplyCap:
      tokenSupplyCap.status === 'fulfilled'
        ? tokenSupplyCap.value.toNumber()
        : 0,
  };
};

const fetchAllCards = async (
  network: NetworkName,
  addresses: string[],
): Promise<ICard[]> => {
  let assets: ICard[] = [];
  const cardFetcher = fetchCard;
  const results = await Promise.allSettled(
    addresses.map(async (address) => await cardFetcher(address, network)),
  );
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      assets.push(result.value);
    }
  });

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
  const markets = await contract.getAllMarkets();
  return markets.map((market) => ({
    tokenId: market.tokenId,
    acceptedToken: market.acceptedToken,
    minimumAmount: Number(market.minimumAmount.toString()),
  }));
};

const fetchAcceptedTokens = async (
  assetAddress: string,
  network: NetworkName,
): Promise<IWhiteListedTokens[]> => {
  const provider = useRpcProvider(network);
  const contract = CardTokenProxy__factory.connect(assetAddress, provider);

  const contractRegistryAddress: string = await contract.contractRegistry();

  const contractRegistry = ContractRegistry__factory.connect(
    contractRegistryAddress,
    provider,
  );

  const whitelistedTokenAddresses =
    await contractRegistry.allWhitelistedTokens();

  const whiteListedTokens = await Promise.all(
    whitelistedTokenAddresses.map((item) =>
      ERC20Api.fetchErc20TokenInfo(item, network),
    ),
  );

  return whiteListedTokens;
};

const buyFromCardMarketViaUniversalProfile = async (
  assetAddress: string,
  universalProfileAddress: string,
  tokenId: number,
  minimumAmount: number,
  signer: Signer,
  referrerAddress: Address,
) => {
  const assetContract = CardTokenProxy__factory.connect(assetAddress, signer);
  const tokenIdBytes = tokenIdAsBytes32(tokenId);
  const universalProfileContract = UniversalProfileProxy__factory.connect(
    universalProfileAddress,
    signer,
  );

  const encodedBuyFromMarket = assetContract.interface.encodeFunctionData(
    'buyFromMarket',
    [tokenIdBytes, minimumAmount, referrerAddress],
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
  minimumAmount: number,
  signer: Signer,
  referrerAddress: Address,
) => {
  const assetContract = CardTokenProxy__factory.connect(assetAddress, signer);
  const tokenIdAsBytes = tokenIdAsBytes32(tokenId);
  const transaction = await assetContract.buyFromMarket(
    tokenIdAsBytes,
    minimumAmount,
    referrerAddress,
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

const encodeTransferFrom = (
  assetAddress: Address,
  universalProfileAddress: Address,
  toAddress: Address,
  tokenId: number,
  signer: Signer,
): string => {
  const assetContract = CardTokenProxy__factory.connect(assetAddress, signer);

  const encodedTransfer = assetContract.interface.encodeFunctionData(
    'transferFrom',
    [universalProfileAddress, toAddress, tokenId],
  );

  return encodedTransfer;
};

const encodeBuyFromCardMarket = (
  assetAddress: Address,
  referrerAddress: Address,
  tokenId: number,
  minimumAmount: BigNumberish,
  signer: Signer,
): string => {
  const assetContract = CardTokenProxy__factory.connect(assetAddress, signer);
  const tokenIdBytes = tokenIdAsBytes32(tokenId);
  const encodedBuyFromMarket = assetContract.interface.encodeFunctionData(
    'buyFromMarket',
    [tokenIdBytes, minimumAmount.toString(), referrerAddress],
  );

  return encodedBuyFromMarket;
};

const encodeSetMarketFor = (
  assetAddress: Address,
  tokenId: number,
  acceptedToken: string,
  minimumAmount: BigNumberish,
  signer: Signer,
): string => {
  const assetContract = CardTokenProxy__factory.connect(assetAddress, signer);
  const tokenIdAsBytes = tokenIdAsBytes32(tokenId);
  const encodedSetMarketFor = assetContract.interface.encodeFunctionData(
    'setMarketFor',
    [tokenIdAsBytes, acceptedToken, minimumAmount.toString()],
  );
  return encodedSetMarketFor;
};

const encodeRemoveMarketFor = (
  assetAddress: Address,
  tokenId: number,
  signer: Signer,
): string => {
  const assetContract = CardMarket__factory.connect(assetAddress, signer);
  const tokenIdAsBytes = tokenIdAsBytes32(tokenId);
  const encodedRemoveMarketFor = assetContract.interface.encodeFunctionData(
    'removeMarketFor',
    [tokenIdAsBytes],
  );

  return encodedRemoveMarketFor;
};

const fetchIsApprovedErc721 = async (
  assetAddress: Address,
  operatorAddress: Address,
  tokenId: number,
  network: NetworkName,
): Promise<boolean> => {
  const provider = useRpcProvider(network);
  const contract = CardTokenProxy__factory.connect(assetAddress, provider);
  const address = await contract.getApproved(tokenId);
  return address.toLowerCase() === operatorAddress.toLowerCase() ? true : false;
};

const fetchIsOperatorFor = async (
  assetAddress: Address,
  operatorAddress: Address,
  tokenId: number,
  network: NetworkName,
): Promise<boolean> => {
  const provider = useRpcProvider(network);
  const contract = CardTokenProxy__factory.connect(assetAddress, provider);
  const tokenIdAsBytes = tokenIdAsBytes32(tokenId);
  const isOperator = await contract.isOperatorFor(
    operatorAddress,
    tokenIdAsBytes,
  );
  return isOperator;
};

const encodeAuthorizeOperator = (
  assetAddress: Address,
  operatorAddress: Address,
  signer: Signer,
  tokenId: number,
): string => {
  const contract = CardTokenProxy__factory.connect(assetAddress, signer);
  const tokenIdAsBytes = tokenIdAsBytes32(tokenId);
  const encodedAuthorizeOperator = contract.interface.encodeFunctionData(
    'authorizeOperator',
    [operatorAddress, tokenIdAsBytes],
  );
  return encodedAuthorizeOperator;
};

const encodeApproveErc721 = (
  assetAddress: Address,
  operatorAddress: Address,
  signer: Signer,
  tokenId: number,
): string => {
  const contract = CardTokenProxy__factory.connect(assetAddress, signer);
  const encodedApprove = contract.interface.encodeFunctionData('approve', [
    operatorAddress,
    tokenId,
  ]);
  return encodedApprove;
};

export const LSP4DigitalAssetApi = {
  fetchCard,
  fetchAllCards,
  getTokenSale,
  fetchMetaDataForTokenID,
  fetchAllMarkets,
  fetchOwnerOfTokenId,
  fetchAcceptedTokens,
  buyFromMarketViaEOA,
  buyFromCardMarketViaUniversalProfile,
  encodeSetMarketFor,
  encodeAuthorizeOperator,
  encodeApproveErc721,
  fetchIsApprovedErc721,
  fetchIsOperatorFor,
};
