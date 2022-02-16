import KeyChain from '../utilities/KeyChain';
import { IProfile } from '../models';
import { IEthereumService } from '../IEthereumService';
import Utils from '../utilities/util';
import { getLSP3ProfileData } from '../ipfsClient';
import {
  CardToken__factory,
  ERC725Y,
  ERC725Y__factory,
  UniversalProfile__factory,
} from '../../submodules/fanzone-smart-contracts/typechain';
import { ethers } from 'ethers';
//import { fetchLSP5Data } from '../../submodules/fanzone-smart-contracts/utils/LSPSchema';
import { LSP4DigitalAssetApi } from './LSP4DigitalAsset';
import { encodeArrayKey } from '@erc725/erc725.js/build/main/lib/utils';
import { ERC725JSONSchema } from '@erc725/erc725.js';

const LSP5ReceivedAssetsSchemaList: Array<ERC725JSONSchema> = [
  {
    name: "LSP5ReceivedAssets[]",
    key: "0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b",
    keyType: "Array",
    valueContent: "Number",
    valueType: "uint256",
  },
];

enum ERC165InterfaceIds {
  LSP7 = "0xe33f65c3",
  LSP8 = "0x49399145",
}

const fetchLSP5Data = async (
  schema: ERC725JSONSchema,
  contract: ERC725Y,
) => {

    let lsp8Assets: string[] = [];
    const schemaValue = await contract.getData([KeyChain.LSP5ReceivedAssets]);
    
    if (schemaValue[0] !== "0x") {
      const arrayLength = ethers.BigNumber.from(schemaValue[0]).toNumber();

      const indexKeys = new Array(arrayLength)
        .fill(null)
        .map((_value, index) => encodeArrayKey(schema.key, index));


      const indexValues = await contract.getData(indexKeys);

      const assets = await Promise.all(indexValues.map(async (item) => {
        const key = `0x812c4334633eb81600000000${item.replace(/^0x/, "")}`
        const lsp5AssetsMapping = await contract.getData([key]);
        const value = lsp5AssetsMapping[0].replace(/^0x/, "");
        const interfaceId = `0x${value.slice(16, 20)}`;

        const tokenType =
          interfaceId === ERC165InterfaceIds.LSP7 ? "LSP7" : "LSP8";
        return {
          item,
          tokenType
        }
      }));
       assets.forEach((item) => {
         if(item.tokenType === "LSP8") lsp8Assets.push(item.item);
       });
   }
   return lsp8Assets;
};

const fetchProfile =
  (EthereumSerive: IEthereumService) =>
  async (address: string, network: string): Promise<IProfile> => {
    const provider = EthereumSerive.getProvider(network);
    const contract = ERC725Y__factory.connect(address, provider);

    await contract
      .supportsInterface('0x63cb749b')
      .then((result) => {
        if (result === false) throw new Error('Not a universal profile');
      })
      .catch(() => {
        throw new Error('Not a universal profile');
      });
    let ownedAssets: string[] = [];

    await fetchLSP5Data(LSP5ReceivedAssetsSchemaList[0], contract)
      .then((result) => {
        ownedAssets = result;
      })
      .catch((error) => {
        console.log(error);
      });
      
    const issuedAssets =
      await LSP4DigitalAssetApi.fetchProfileIssuedAssetsAddresses(
        EthereumSerive,
      )(network, address);

    let hashedUrl: string = '';
    const universalProfile = UniversalProfile__factory.connect(
      address,
      provider,
    );

    const owner = await universalProfile.owner();

    await universalProfile
      .getData([KeyChain.LSP3PROFILE])
      .then((result) => {
        hashedUrl = result[0];
      })
      .catch((error) => {
        throw new Error('No metadata found');
      });

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
    return { ...profile, owner, address: address, network, ownedAssets, issuedAssets };
  };

const fetchOwnedCollectionCount =
  (EthereumService: IEthereumService) =>
  async (address: string, network: string): Promise<number> => {
    const provider = EthereumService.getProvider(network);
    const universalProfile = UniversalProfile__factory.connect(
      address,
      provider,
    );
    const res = await universalProfile.getData([KeyChain.LSP5ReceivedAssets]);
    const ownedAssetsCount = ethers.BigNumber.from(res[0]).toNumber();
    return ownedAssetsCount;
  };

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

const fetchCreatorsAddresses =
  (EthereumService: IEthereumService) =>
  async (address: string, network: string): Promise<string[]> => {
    const provider = EthereumService.getProvider(network);

    const contract = CardToken__factory.connect(address, provider);

    const numCreatorHex = await contract.getData([KeyChain.LSP4Creators]);

    if (!numCreatorHex) {
      throw new Error('No creator found');
    }

    const numCreators = parseInt(numCreatorHex[0], 16);

    const elementPrefix = KeyChain.LSP4Creators.slice(0, 34);

    let creators: string[] = [];

    await Promise.allSettled(
      new Array(numCreators).fill(0).map(async (_, index) => {
        const elementSufix = index.toString(16);
        const elementKey =
          elementPrefix.padEnd(66 - elementSufix.length, '0') + elementSufix;
        const creatorAddr = await contract.getData([elementKey]);
        return creatorAddr;
      }),
    ).then((results) =>
      results.forEach((result) => {
        if (result.status === 'fulfilled') creators.push(result.value[0]);
      }),
    );

    return creators;
  };

export const LSP3ProfileApi = {
  fetchProfile,
  fetchAllProfiles,
  fetchCreatorsAddresses,
  fetchOwnedCollectionCount,
};
