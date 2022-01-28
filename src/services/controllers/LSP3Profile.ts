import ABI from '../utilities/ABIs';
import KeyChain from '../utilities/KeyChain';
import { ILSP3Profile } from '../models';
import { IEthereumService } from '../IEthereumService';
import Utils from '../utilities/util';
import { getLSP3ProfileData } from '../ipfsClient';
import { LSP4DigitalAssetApi } from './LSP4DigitalAsset';

const fetchProfile =
  (EthereumSerive: IEthereumService) =>
  async (address: string, network: string): Promise<ILSP3Profile> => {
    const contract = EthereumSerive.getContract(
      ABI.LSP3AccountABI,
      address,
      network,
    );
    const hashedUrl = await contract.getData(KeyChain.LSP3PROFILE);
    const ownedBalance = await LSP4DigitalAssetApi.fetchOwnedCollectionCount(
      EthereumSerive,
    )(address);

    if (!hashedUrl) {
      return {
        address: address,
        name: address.slice(0, 9),
        description: '',
        links: [],
        balance: ownedBalance,
        profileImage: '',
        backgroundImage: '',
      };
    }

    const result = await getLSP3ProfileData(hashedUrl);

    if (!result || !result.LSP3Profile) {
      throw new Error('Invalid LSP3Profile Format');
    }

    const profile: ILSP3Profile = {
      ...result.LSP3Profile,
      profileImage: result.LSP3Profile.profileImage[0]
        ? Utils.convertImageURL(result.LSP3Profile.profileImage[0].url)
        : null,
      backgroundImage: result.LSP3Profile.backgroundImage[0]
        ? Utils.convertImageURL(result.LSP3Profile.backgroundImage[0].url)
        : null,
    };
    return { ...profile, address: address, balance: ownedBalance };
  };

const fetchAllProfiles =
  (EthereumService: IEthereumService) =>
  async (addressList: string[], network: string): Promise<ILSP3Profile[]> => {
    const profileFetcher = fetchProfile(EthereumService);

    let profiles: ILSP3Profile[] = [];

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
  async (address: string, network: string): Promise<ILSP3Profile[]> => {
    const contract = EthereumService.getContract(
      ABI.LSP4DigitalCertificateABI,
      address,
      network,
    );

    const numCreatorHex = await contract.getData(KeyChain.LSP4Creators);

    console.log('Creators hex: ' + numCreatorHex);

    if (!numCreatorHex) {
      throw new Error('No creator found');
    }

    const numCreators = parseInt(numCreatorHex, 16);

    console.log('No of creators: ' + numCreators);

    const elementPrefix = KeyChain.LSP4Creators.slice(0, 34);

    const profileFetcher = fetchProfile(EthereumService);

    let creators: ILSP3Profile[] = [];

    await Promise.allSettled(
      new Array(numCreators).fill(0).map(async (_, index) => {
        const elementSufix = index.toString(16);
        const elementKey =
          elementPrefix.padEnd(66 - elementSufix.length, '0') + elementSufix;
        const creatorAddr = await contract.getData(elementKey);
        return profileFetcher(creatorAddr, network);
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
  fetchAllProfiles,
  fetchCreators,
};
