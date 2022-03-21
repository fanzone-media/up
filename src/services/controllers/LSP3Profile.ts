/* eslint-disable react-hooks/rules-of-hooks */
import KeyChain from '../utilities/KeyChain';
import { IOwnedAssets, IPermissionSet, IProfile, ISetProfileData } from '../models';
import Utils from '../utilities/util';
import { addData, addFile, getLSP3ProfileData } from '../ipfsClient';
import {
  CardToken__factory,
  ERC725Y,
  ERC725Y__factory,
  LSP6KeyManager__factory,
  UniversalProfile__factory,
} from '../../submodules/fanzone-smart-contracts/typechain';
import { ethers, Signer } from 'ethers';
import { LSP4DigitalAssetApi } from './LSP4DigitalAsset';
import { encodeArrayKey } from '@erc725/erc725.js/build/main/lib/utils';
import { ERC725JSONSchema } from '@erc725/erc725.js';
import Web3 from 'web3';
import { useRpcProvider } from '../../hooks/useRpcProvider';

const LSP5ReceivedAssetsSchemaList: Array<ERC725JSONSchema> = [
  {
    name: 'LSP5ReceivedAssets[]',
    key: '0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b',
    keyType: 'Array',
    valueContent: 'Number',
    valueType: 'uint256',
  },
];

enum ERC165InterfaceIds {
  LSP7 = '0xe33f65c3',
  LSP8 = '0x49399145',
}

const fetchLSP5Data = async (schema: ERC725JSONSchema, contract: ERC725Y) => {
  let lsp8Assets: string[] = [];
  const schemaValue = await contract.getData([KeyChain.LSP5ReceivedAssets]);

  if (schemaValue[0] !== '0x') {
    const arrayLength = ethers.BigNumber.from(schemaValue[0]).toNumber();

    const indexKeys = new Array(arrayLength)
      .fill(null)
      .map((_value, index) => encodeArrayKey(schema.key, index));

    const indexValues = await contract.getData(indexKeys);

    const assets = await Promise.all(
      indexValues.map(async (item) => {
        const key = `0x812c4334633eb81600000000${item.replace(/^0x/, '')}`;
        const lsp5AssetsMapping = await contract.getData([key]);
        const value = lsp5AssetsMapping[0].replace(/^0x/, '');
        const interfaceId = `0x${value.slice(16, 20)}`;

        const tokenType =
          interfaceId === ERC165InterfaceIds.LSP7 ? 'LSP7' : 'LSP8';
        return {
          item,
          tokenType,
        };
      }),
    );
    assets.forEach((item) => {
      if (item.tokenType === 'LSP8') lsp8Assets.push(item.item);
    });
  }
  return lsp8Assets;
};

const fetchProfile =
  async (address: string, network: string): Promise<IProfile> => {
    const provider = useRpcProvider(network);
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

    const ownedAssetsWithBalance = await Promise.all(
      ownedAssets.map(async (assetAddress) => {
        const res = await fetchBalanceOf(
          network,
          assetAddress,
          address,
        );
        return res;
      }),
    );

    let hashedUrl: string = '';
    const universalProfile = UniversalProfile__factory.connect(
      address,
      provider,
    );

    const [owner, permissionSet, issuedAssets] = await Promise.all([
      universalProfile.owner(),
      getKeyManagerPermissions(address, network),
      LSP4DigitalAssetApi.fetchProfileIssuedAssetsAddresses(network, address)
    ]);

    const isOwnerKeyManager = await checkKeyManager(owner, network);

    await universalProfile
      .getData([KeyChain.LSP3PROFILE])
      .then((result) => {
        hashedUrl = result[0];
      })
      .catch((error) => {
        throw new Error('No metadata found');
      });

    if (hashedUrl === '0x')
      return {
        owner,
        address: address,
        network,
        ownedAssets: ownedAssetsWithBalance,
        issuedAssets,
        profileImage: '',
        backgroundImage: '',
        permissionSet,
        isOwnerKeyManager
      } as IProfile;

    let metaData: any;
    await getLSP3ProfileData(hashedUrl)
      .then((res) => {
        metaData = res;
      })
      .catch((error) => {
        console.log(error);
      });

    if (!metaData || !metaData.LSP3Profile) {
      throw new Error('Invalid LSP3Profile Format');
    }

    const profile: IProfile = {
      ...metaData?.LSP3Profile,
      profileImage: metaData.LSP3Profile.profileImage[0]
        ? metaData.LSP3Profile.profileImage[0].url.startsWith('ipfs://')
          ? Utils.convertImageURL(metaData.LSP3Profile.profileImage[0].url)
          : metaData.LSP3Profile.profileImage[0].url
        : null,
      backgroundImage: metaData.LSP3Profile.backgroundImage[0]
        ? metaData.LSP3Profile.backgroundImage[0].url.startsWith('ipfs://')
          ? Utils.convertImageURL(metaData.LSP3Profile.backgroundImage[0].url)
          : metaData.LSP3Profile.backgroundImage[0].url
        : null,
    };
    return {
      ...profile,
      owner,
      address: address,
      network,
      ownedAssets: ownedAssetsWithBalance,
      issuedAssets,
      permissionSet,
      isOwnerKeyManager
    };
  };

const fetchOwnedCollectionCount =
  async (address: string, network: string): Promise<number> => {
    const provider = useRpcProvider(network);
    const universalProfile = UniversalProfile__factory.connect(
      address,
      provider,
    );
    const res = await universalProfile.getData([KeyChain.LSP5ReceivedAssets]);
    const ownedAssetsCount = ethers.BigNumber.from(res[0]).toNumber();
    return ownedAssetsCount;
  };

const fetchAllProfiles =
  async (addressList: string[], network: string): Promise<IProfile[]> => {
    const profileFetcher = fetchProfile;

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
  async (address: string, network: string): Promise<string[]> => {
    const provider = useRpcProvider(network);

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

const fetchBalanceOf =
  async (
    network: string,
    assetAddress: string,
    profileAddress?: string,
  ): Promise<IOwnedAssets> => {
    if (!profileAddress) {
      return {} as IOwnedAssets;
    }
    const provider = useRpcProvider(network);
    const contract = CardToken__factory.connect(assetAddress, provider);
    const balance = await contract.balanceOf(profileAddress);
    const tokenIds = await (await contract.tokenIdsOf(profileAddress)).map((tokenId) => ethers.BigNumber.from(tokenId).toNumber());
    return {assetAddress, balance: ethers.BigNumber.from(balance).toNumber(), tokenIds};
  };

const setUniversalProfileData =
  async (
    profileAddress: string,
    profileData: ISetProfileData,
    signer: Signer,
  ): Promise<boolean> => {

    const contract = UniversalProfile__factory.connect(profileAddress, signer);
    await uploadProfileData(profileData).then(async (JSONURL) => {
      await contract.setData([KeyChain.LSP3PROFILE], [JSONURL]);
    }).catch((error) => {
      throw new Error(error.message);
    });

    return true;
  };

const setUniversalProfileDataViaKeyManager = 
  async (
    keyManagerAddress: string,
    profileAddress: string,
    profileData: ISetProfileData,
    signer: Signer,
    ) => {
    const universalProfileContract = UniversalProfile__factory.connect(profileAddress, signer);
    const keyManagerContract = LSP6KeyManager__factory.connect(keyManagerAddress, signer);

    await uploadProfileData(profileData).then(async (JSONURL) => {
      const enodedData = universalProfileContract.interface.encodeFunctionData("setData", [
        [KeyChain.LSP3PROFILE],
        [JSONURL]
      ]);
      await keyManagerContract.execute(enodedData);  
    });
  }; 

export const getKeyManagerPermissions = 
  async (address: string, network: string): Promise<IPermissionSet[]> => {
    const provider = useRpcProvider(network);
    const contract = UniversalProfile__factory.connect(address, provider);
    const addressPermissions = await contract.getData([KeyChain.LSP6AddressPermissions]);
    if (addressPermissions[0] !== '0x') {
      const permissionNames = [
        'sign',
        'transferValue',
        'deploy',
        'delegateCall',
        'staticCall',
        'call',
        'setData',
        'addPermissions',
        'changePermissions',
        'changeOwner'
      ];
      const arrayLength = ethers.BigNumber.from(addressPermissions[0]).toNumber();

      const indexKeys = new Array(arrayLength)
        .fill(null)
        .map((_value, index) => encodeArrayKey(KeyChain.LSP6AddressPermissions, index));
  
      const indexValues = await contract.getData(indexKeys);
      const permissionsSet = await Promise.all(
        indexValues.map(async (address) => {
          if(address !== "0x") {
            const key = KeyChain.LSP6AddressPermissions_Permissions + address.replace(/^0x/, '');
            const res = await contract.getData([key]);
            let permissionsBinary = (parseInt(res[0].slice(58), 16).toString(2)).padStart(10, '0');
            if(permissionsBinary.length > 10) {
              permissionsBinary = permissionsBinary.slice(permissionsBinary.length - 10);
            }
            const permissionsBinaryArray = permissionsBinary.split('');
            const permissions = Object.fromEntries(permissionNames.map((item, i) => [item, permissionsBinaryArray[i]]));
            return {address, permissions};
          }
          return {address: "", permissions: {}};
        })
      )
      return permissionsSet as IPermissionSet[];
    }
    return [] as IPermissionSet[];
  };

export const checkKeyManager = 
  async (address: string, network: string) => {
    const provider = useRpcProvider(network);
    const contract = LSP6KeyManager__factory.connect(address, provider);
    let isKeyManager = false;
    await contract.supportsInterface('0x6f4df48b').then((result) => {
      isKeyManager = result;
    }).catch(() => {
      isKeyManager = false;
    });

    return isKeyManager;
  };

const uploadProfileData = async (profileData: ISetProfileData): Promise<string> => {
  if (typeof profileData.profileImage[0].url !== 'string') {
    await addFile(profileData.profileImage[0].url).then((path) => {
      if (path) {
        profileData = {
          ...profileData,
          profileImage: [{ ...profileData.profileImage[0], url: path }],
        };
      }
    });
  }
  if (typeof profileData.backgroundImage[0].url !== 'string') {
    await addFile(profileData.backgroundImage[0].url).then((path) => {
      if (path) {
        profileData = {
          ...profileData,
          backgroundImage: [{ ...profileData.backgroundImage[0], url: path }],
        };
      }
    });
  }
  const json = JSON.stringify({
    LSP3Profile: profileData,
  });

  const jsonIpfsPath = await addData(json);

  if (!jsonIpfsPath) throw new Error('Something went wrong');

  const hashFunction = ethers.utils
    .keccak256(ethers.utils.toUtf8Bytes('keccak256(utf8)'))
    .substring(0, 10);
  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(json));
  const url = Web3.utils.utf8ToHex(jsonIpfsPath);

  const JSONURL = hashFunction + hash.substring(2) + url.substring(2);

  return JSONURL;
}

const transferCardViaKeyManager = 
  async (
    assetAddress: string, 
    universalProfileAddress: string, 
    keyManagerAddress: string, 
    tokenId: number,
    toAddress: string,
    signer: Signer
  ) => {
    const assetContract = CardToken__factory.connect(assetAddress, signer);
    const universalProfileContract = UniversalProfile__factory.connect(universalProfileAddress, signer);
    const keyManagerContract = LSP6KeyManager__factory.connect(keyManagerAddress, signer);

    const encodedTransferFunction = assetContract.interface.encodeFunctionData("transferFrom", [
      universalProfileAddress,
      toAddress,
      tokenId
    ]);

    const encodedExecuteFunction = universalProfileContract.interface.encodeFunctionData("execute", [
      "0x0",
      assetAddress,
      0,
      encodedTransferFunction
    ]);

    const transaction = await keyManagerContract.execute(encodedExecuteFunction);
    await transaction.wait(1).then((result) => {
      if(result.status === 0) {
        throw new Error("Transaction reverted");
      }
    });
};

const transferCardViaUniversalProfile = 
  async (
    assetAddress: string, 
    universalProfileAddress: string, 
    tokenId: number,
    toAddress: string,
    signer: Signer
  ) => {
    const assetContract = CardToken__factory.connect(assetAddress, signer);
    const universalProfileContract = UniversalProfile__factory.connect(universalProfileAddress, signer);

    const encodedTransferFunction = assetContract.interface.encodeFunctionData("transferFrom", [
      universalProfileAddress,
      toAddress,
      tokenId
    ]);

    const transaction = await universalProfileContract.execute(
      "0x0",
      assetAddress,
      0,
      encodedTransferFunction
    );
    await transaction.wait(1).then((result) => {
      if(result.status === 0) {
        throw new Error("Transaction reverted");
      }
    });
  };

export const LSP3ProfileApi = {
  fetchProfile,
  fetchAllProfiles,
  fetchCreatorsAddresses,
  fetchOwnedCollectionCount,
  setUniversalProfileData,
  setUniversalProfileDataViaKeyManager,
  transferCardViaKeyManager,
  transferCardViaUniversalProfile
};
