import ABI from '../utilities/ABIs';
import KeyChain from '../utilities/KeyChain';
import { IEthereumService } from '../IEthereumService';
import { ICard } from '../models';
import { getLSP4Metadata } from '../ipfsClient';
import { ethers } from 'ethers';
import {
  CardToken__factory,
  UniversalProfile__factory,
} from '../../submodules/fanzone-smart-contracts/typechain';
import Utils from '../utilities/util';
import { LSP3ProfileApi } from './LSP3Profile';

const fetchCard =
  (EthereumService: IEthereumService) =>
  async (address: string, network: string): Promise<ICard> => {
    const provider = EthereumService.getProvider(network);
    const contract = CardToken__factory.connect(address, provider);
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
        contract.getData([KeyChain.LSP4Metadata]),
      ]);

    if (!hashedUrl) {
      throw new Error('No card data');
    }
    const result = await getLSP4Metadata(hashedUrl[0]);
    let creators: string[] = [];
    await LSP3ProfileApi.fetchCreatorsAddresses(EthereumService)(
      address,
      network,
    )
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
      ls8MetaData: { ...result, image: Utils.convertImageURL(result.image) },
      owner,
      holders: holders.map((holder: string) => `0x${holder.slice(26)}`),
      creators,
      network: network,
    };
  };

const fetchAllCards =
  (EthereumService: IEthereumService) =>
  async (network: string, addresses: string[]): Promise<ICard[]> => {
    let assets: ICard[] = [];
    const cardFetcher = fetchCard(EthereumService);
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

const fetchProfileIssuedAssetsAddresses =
  (EthereumService: IEthereumService) =>
  async (network: string, profileAddress: string): Promise<string[]> => {
    const provider = EthereumService.getProvider(network);
    const contract = UniversalProfile__factory.connect(
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

const fetchBalanceOf =
  (EthereumService: IEthereumService) =>
  async (
    network: string,
    assetAddress: string,
    profileAddress?: string,
  ): Promise<number> => {
    if (!profileAddress) {
      return 0;
    }
    const assetContract = EthereumService.getContract(
      ABI.LSP4DigitalCertificateABI,
      assetAddress,
      network,
    );
    const balance = await assetContract.balanceOf(profileAddress);
    return ethers.BigNumber.from(balance).toNumber();
  };

export const LSP4DigitalAssetApi = {
  fetchCard,
  fetchBalanceOf,
  fetchProfileIssuedAssetsAddresses,
  fetchAllCards,
};