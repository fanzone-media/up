import KeyChain from '../utilities/KeyChain';
import { IProfile } from '../models';
import { IEthereumService } from '../IEthereumService';
import Utils from '../utilities/util';
import { getLSP3ProfileData } from '../ipfsClient';
import { CardToken__factory, ERC725Y__factory, UniversalProfile__factory } from '../../submodules/fanzone-smart-contracts/typechain';
import { ethers } from 'ethers';
import { fetchLSP5Data } from '../../submodules/fanzone-smart-contracts/utils/LSPSchema';
import { LSP4DigitalAssetApi } from './LSP4DigitalAsset';

const fetchProfile =
  (EthereumSerive: IEthereumService) =>
  async (address: string, network: string): Promise<IProfile> => {
    const provider = EthereumSerive.getProvider(network);
    const contract = ERC725Y__factory.connect(address, provider);
    let ownedAssets: string[] = [];
    await fetchLSP5Data(contract).then((result: any) => {
      ownedAssets = result[0]?.listEntries.map((item: any) => {
        if(item.mapEntries.receivedAsset.parsedValue.tokenType === "LSP8") return item.value;
        return [] as string[];
      });
    }).catch((error) => {
      console.log(error);
    });
    const issuedAssets = await LSP4DigitalAssetApi.fetchProfileIssuedAssetsAddresses(EthereumSerive)(network, address);
    let hashedUrl: string = "";
    const universalProfile = UniversalProfile__factory.connect(address, provider);
    await universalProfile.getData([KeyChain.LSP3PROFILE]).then((result) => {
      hashedUrl = result[0];
    }).catch((error) => {
      throw new Error("No metadata found");
    });
    const ownedBalance = await fetchOwnedCollectionCount(
      EthereumSerive,
    )(address, network);
  
      const result = await getLSP3ProfileData(hashedUrl);
  
      if (!result || !result.LSP3Profile) {
        throw new Error('Invalid LSP3Profile Format');
      }
  
      const profile: IProfile = {
        ...result.LSP3Profile,
        profileImage: result.LSP3Profile.profileImage[0]
          ? Utils.convertImageURL(result.LSP3Profile.profileImage[0].url)
          : null,
        backgroundImage: result.LSP3Profile.backgroundImage[0]
          ? Utils.convertImageURL(result.LSP3Profile.backgroundImage[0].url)
          : null,
      };
      return { ...profile, address: address, network, ownedAssets, issuedAssets };

  };

const fetchOwnedCollectionCount = 
  (EthereumService: IEthereumService) => 
  async (address: string, network: string): Promise<number> => {
    const provider = EthereumService.getProvider(network);
    const universalProfile = UniversalProfile__factory.connect(address, provider);
    const res = await universalProfile.getData([KeyChain.LSP5ReceivedAssets]);
    const ownedAssetsCount = ethers.BigNumber.from(res[0]).toNumber();
    return ownedAssetsCount;
  };

// const fetchOwnedAssets = 
//   (EthereumService: IEthereumService) => 
//   async (address: string, network: string): Promise<string[]> => {
//     const provider = EthereumService.getProvider(network);
//     const contract = ERC725Y__factory.connect(address, provider);
//     const res = await fetchLSP5Data(contract);
//     res.map((item) => (item));
//   } 

const fetchAllProfiles =
  (EthereumService: IEthereumService) =>
  async (addressList: string[], network: string): Promise<IProfile[]> => {
    const profileFetcher = fetchProfile(EthereumService);

    let profiles: IProfile[] = [];

    await Promise.allSettled(
      addressList.map((address) => {
        return profileFetcher(address, network);
      }),
    ).then((results) =>
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          profiles.push(result.value);
        }
      }),
    );

    return profiles;
  };

const fetchCreators =
  (EthereumService: IEthereumService) =>
  async (address: string, network: string): Promise<IProfile[]> => {
    // const contract = EthereumService.getContract(
    //   ABI.LSP4DigitalCertificateABI,
    //   address,
    //   network,
    // );

    const provider = EthereumService.getProvider(network);

    const contract = CardToken__factory.connect(address, provider);

    const numCreatorHex = await contract.getData([KeyChain.LSP4Creators]);

    console.log('Creators hex: ' + numCreatorHex);

    if (!numCreatorHex) {
      throw new Error('No creator found');
    }

    const numCreators = parseInt(numCreatorHex[0], 16);

    console.log('No of creators: ' + numCreators);

    const elementPrefix = KeyChain.LSP4Creators.slice(0, 34);

    const profileFetcher = fetchProfile(EthereumService);

    let creators: IProfile[] = [];

    await Promise.allSettled(
      new Array(numCreators).fill(0).map(async (_, index) => {
        const elementSufix = index.toString(16);
        const elementKey =
          elementPrefix.padEnd(66 - elementSufix.length, '0') + elementSufix;
        const creatorAddr = await contract.getData([elementKey]);
        console.log(creatorAddr);
        return profileFetcher(creatorAddr[0], network);
      }),
    ).then((results) =>
      results.forEach((result) => {
        if (result.status === 'fulfilled') creators.push(result.value);
      }),
    );

    return creators;
  };

export const LSP3ProfileApi = {
  fetchProfile,
  //fetchProfilesNew,
  fetchAllProfiles,
  fetchCreators,
  fetchOwnedCollectionCount
};
