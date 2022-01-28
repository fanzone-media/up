import ABI from '../utilities/ABIs';
import KeyChain from '../utilities/KeyChain';
import { IEthereumService } from '../IEthereumService';
import { ILSP4Card } from '../models';
import { getLSP4Metadata } from '../ipfsClient';
import Utils from '../utilities/util';
import { ethers } from 'ethers';

const fetchCard =
  (EthereumService: IEthereumService) =>
  async (address: string, network: string): Promise<ILSP4Card> => {
    let assetContract = EthereumService.getContract(
      ABI.LSP4DigitalCertificateABI,
      address,
      network,
    );

    const islsp8 = await assetContract.supportsInterface('0x49399145');
    if (islsp8) {
      assetContract = EthereumService.getContract(ABI.LnsABI, address, network);

      if (!assetContract) throw new Error('Unknown Network');
    }
    const [name, symbol, totalSupply, owner, holders, hashedUrl] =
      await Promise.all([
        assetContract.name(),
        assetContract.symbol(),
        assetContract.totalSupply(),
        assetContract.owner(),
        assetContract.allTokenHolders(),
        assetContract.getData(
          islsp8 ? [KeyChain.LSP4Metadata] : KeyChain.LSP4Metadata,
        ),
      ]);

    if (!hashedUrl) {
      throw new Error('No card data');
    }
    const result = await getLSP4Metadata(islsp8 ? hashedUrl[0] : hashedUrl);

    return {
      address,
      name,
      symbol,
      totalSupply: ethers.BigNumber.from(totalSupply).toNumber(),
      card: result.LSP4Metadata,
      owner,
      holders: holders.map((holder: string) => `0x${holder.slice(26)}`),
      image: Utils.convertImageURL(result.LSP4Metadata.images[0][0].url),
    };
  };

const fetchProfileIssuedAssets =
  (EthereumService: IEthereumService) =>
  async (network: string, profileAddress?: string): Promise<ILSP4Card[]> => {
    if (!profileAddress) {
      return [] as ILSP4Card[];
    }

    const contract = EthereumService.getContract(
      ABI.LSP3AccountABI,
      profileAddress,
      network,
    );

    let assets: ILSP4Card[] = [];

    // Use the LSP3IssuedAssets_KEY to request the number of elements
    // response ex: 0x0000000000000000000000000000000000000000000000000000000000000002 (2 elements)
    const numAssetsHex = await contract.getData(KeyChain.LSP3IssuedAssets);

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

    const cardFetcher = fetchCard(EthereumService);

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

        const assetAddr = await contract.getData(elementKey);

        const asset = await cardFetcher(assetAddr, network);

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

const fetchProfileOwnedAssets =
  (EthereumService: IEthereumService) =>
  async (network: string, profileAddress?: string): Promise<ILSP4Card[]> => {
    let ownedAssets: ILSP4Card[] = [];
    if (!profileAddress) {
      console.error('no profile');
      return ownedAssets;
    }

    try {
      const profileContract = EthereumService.getContract(
        ABI.LSP3AccountABI,
        profileAddress,
        network,
      );
      const lsp1Address = await profileContract.getData(KeyChain.LSP1DELEGATE);
      console.log('lsp1Address: ' + lsp1Address);

      const universalRecieverContract = EthereumService.getContract(
        ABI.UniversalReceiverABI,
        lsp1Address,
        network,
      );

      const assetsAddresses = await universalRecieverContract.getAllRawValues();

      const cardFetcher = fetchCard(EthereumService);

      await Promise.allSettled(
        new Array(assetsAddresses.length).fill(0).map(async (_, index) => {
          const assetAdr = `0x${assetsAddresses[index].slice(26)}`;
          const asset = await cardFetcher(assetAdr, network);
          return asset;
        }),
      ).then((results) =>
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            ownedAssets.push(result.value);
          }
        }),
      );
    } catch (error: any) {
      console.error(error.message);
    }
    return ownedAssets;
  };

const fetchOwnedCollectionCount =
  (EthereumService: IEthereumService) =>
  async (network: string, profileAddress?: string): Promise<number> => {
    if (!profileAddress) {
      return 0;
    }

    try {
      const profileContract = EthereumService.getContract(
        ABI.LSP3AccountABI,
        profileAddress,
        network,
      );

      const lsp1Address = await profileContract.getData(KeyChain.LSP1DELEGATE);

      const universalRecieverContract = EthereumService.getContract(
        ABI.UniversalReceiverABI,
        lsp1Address,
        network,
      );

      const assetsAddresses = await universalRecieverContract.getAllRawValues();

      return assetsAddresses.length;
    } catch (error: any) {
      console.error(error.message);
      return 0;
    }
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
  fetchProfileIssuedAssets,
  fetchOwnedCollectionCount,
  fetchBalanceOf,
  fetchProfileOwnedAssets,
};
