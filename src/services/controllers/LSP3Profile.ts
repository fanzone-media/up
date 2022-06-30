/* eslint-disable react-hooks/rules-of-hooks */
import KeyChain from '../utilities/KeyChain';
import {
  IOwnedAssets,
  IPermissionSet,
  IProfile,
  ISetProfileData,
} from '../models';
import { NetworkName, AsyncReturnType, UnpackedType } from '../../boot/types';
import Utils from '../utilities/util';
import { addData, addFile, getLSP3ProfileData } from '../ipfsClient';
import {
  CardMarket__factory,
  CardTokenProxy__factory,
  ERC20__factory,
  ERC725Y__factory,
  LSP6KeyManagerProxy__factory,
  UniversalProfileProxy__factory,
} from '../../submodules/fanzone-smart-contracts/typechain';
import {
  isFetchDataForSchemaResultList,
  fetchLSP5Data,
} from '../../utils/LSPSchema';
import { BigNumber, BigNumberish, BytesLike, ethers, Signer } from 'ethers';
import { LSP4DigitalAssetApi } from './LSP4DigitalAsset';
import { encodeArrayKey } from '@erc725/erc725.js/build/main/lib/utils';
import Web3 from 'web3';
import { useRpcProvider } from '../../hooks/useRpcProvider';
import { tokenIdAsBytes32 } from '../../utils/cardToken';

const isUniversalProfile = async (
  address: string,
  network: NetworkName,
): Promise<boolean> => {
  const provider = useRpcProvider(network);
  const contract = ERC725Y__factory.connect(address, provider);
  let check = false;
  await contract
    .supportsInterface('0x63cb749b')
    .then((result) => {
      check = result;
    })
    .catch(() => {
      check = false;
    });
  return check;
};

const fetchOwnerOfProfile = async (
  address: string,
  network: NetworkName,
): Promise<string> => {
  const provider = useRpcProvider(network);
  const universalProfile = UniversalProfileProxy__factory.connect(
    address,
    provider,
  );

  const owner = await universalProfile.owner();

  return owner;
};

const fetchProfile = async (
  address: string,
  network: NetworkName,
): Promise<IProfile> => {
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
  let ownedAssets:
    | UnpackedType<AsyncReturnType<typeof fetchLSP5Data>>
    | undefined;

  await fetchLSP5Data(contract)
    .then((result) => {
      ownedAssets = result.find((x) => x.schemaName === 'LSP5ReceivedAssets[]');
    })
    .catch((error) => {
      console.log(error);
    });

  let ownedAssetsWithBalance;
  if (isFetchDataForSchemaResultList(ownedAssets)) {
    ownedAssetsWithBalance = await Promise.all(
      ownedAssets.listEntries.map(async (ownedAsset) => {
        const res = await fetchBalanceOf(network, ownedAsset.value, address);
        return res;
      }),
    );
  }

  let hashedUrl: string = '';

  const universalProfile = UniversalProfileProxy__factory.connect(
    address,
    provider,
  );

  const [owner, permissionSet, issuedAssets] = await Promise.all([
    universalProfile.owner(),
    getKeyManagerPermissions(address, network),
    LSP4DigitalAssetApi.fetchProfileIssuedAssetsAddresses(network, address),
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
      isOwnerKeyManager,
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
    ...(ownedAssetsWithBalance && { ownedAssets: ownedAssetsWithBalance }),
    issuedAssets,
    permissionSet,
    isOwnerKeyManager,
  };
};

const fetchOwnedCollectionCount = async (
  address: string,
  network: NetworkName,
): Promise<number> => {
  const provider = useRpcProvider(network);
  const universalProfile = UniversalProfileProxy__factory.connect(
    address,
    provider,
  );
  const res = await universalProfile.getData([KeyChain.LSP5ReceivedAssets]);
  const ownedAssetsCount = ethers.BigNumber.from(res[0]).toNumber();
  return ownedAssetsCount;
};

const fetchAllProfiles = async (
  addressList: string[],
  network: NetworkName,
): Promise<IProfile[]> => {
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

const fetchCreatorsAddresses = async (
  address: string,
  network: NetworkName,
): Promise<string[]> => {
  const provider = useRpcProvider(network);

  const contract = CardTokenProxy__factory.connect(address, provider);

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

const fetchBalanceOf = async (
  network: NetworkName,
  assetAddress: string,
  profileAddress?: string,
): Promise<IOwnedAssets> => {
  if (!profileAddress) {
    return {} as IOwnedAssets;
  }
  const provider = useRpcProvider(network);
  const contract = CardTokenProxy__factory.connect(assetAddress, provider);
  const balance = await contract.balanceOf(profileAddress);
  const tokenIds = await (
    await contract.tokenIdsOf(profileAddress)
  ).map((tokenId) => ethers.BigNumber.from(tokenId).toNumber());
  return {
    assetAddress,
    balance: ethers.BigNumber.from(balance).toNumber(),
    tokenIds,
  };
};

const setUniversalProfileData = async (
  profileAddress: string,
  profileData: ISetProfileData,
  signer: Signer,
): Promise<boolean> => {
  const contract = UniversalProfileProxy__factory.connect(
    profileAddress,
    signer,
  );
  await uploadProfileData(profileData)
    .then(async (JSONURL) => {
      await contract.setData([KeyChain.LSP3PROFILE], [JSONURL]);
    })
    .catch((error) => {
      throw new Error(error.message);
    });

  return true;
};

const setUniversalProfileDataViaKeyManager = async (
  keyManagerAddress: string,
  profileAddress: string,
  profileData: ISetProfileData,
  signer: Signer,
) => {
  const universalProfileContract = UniversalProfileProxy__factory.connect(
    profileAddress,
    signer,
  );
  const keyManagerContract = LSP6KeyManagerProxy__factory.connect(
    keyManagerAddress,
    signer,
  );

  await uploadProfileData(profileData).then(async (JSONURL) => {
    const enodedData = universalProfileContract.interface.encodeFunctionData(
      'setData',
      [[KeyChain.LSP3PROFILE], [JSONURL]],
    );
    await keyManagerContract.execute(enodedData);
  });
};

export const getKeyManagerPermissions = async (
  address: string,
  network: NetworkName,
): Promise<IPermissionSet[]> => {
  const provider = useRpcProvider(network);
  const contract = UniversalProfileProxy__factory.connect(address, provider);
  const addressPermissions = await contract.getData([
    KeyChain.LSP6AddressPermissions,
  ]);
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
      'changeOwner',
    ];
    const arrayLength = ethers.BigNumber.from(addressPermissions[0]).toNumber();

    const indexKeys = new Array(arrayLength)
      .fill(null)
      .map((_value, index) =>
        encodeArrayKey(KeyChain.LSP6AddressPermissions, index),
      );

    const indexValues = await contract.getData(indexKeys);
    const permissionsSet = await Promise.all(
      indexValues.map(async (address) => {
        if (address !== '0x') {
          const key =
            KeyChain.LSP6AddressPermissions_Permissions +
            address.replace(/^0x/, '');
          const res = await contract.getData([key]);
          let permissionsBinary = parseInt(res[0].slice(58), 16)
            .toString(2)
            .padStart(10, '0');
          if (permissionsBinary.length > 10) {
            permissionsBinary = permissionsBinary.slice(
              permissionsBinary.length - 10,
            );
          }
          const permissionsBinaryArray = permissionsBinary.split('');
          const permissions = Object.fromEntries(
            permissionNames.map((item, i) => [item, permissionsBinaryArray[i]]),
          );
          return { address, permissions };
        }
        return { address: '', permissions: {} };
      }),
    );
    return permissionsSet as IPermissionSet[];
  }
  return [] as IPermissionSet[];
};

export const checkKeyManager = async (
  address: string,
  network: NetworkName,
) => {
  const provider = useRpcProvider(network);
  const contract = LSP6KeyManagerProxy__factory.connect(address, provider);
  let isKeyManager = false;
  await contract
    .supportsInterface('0x6f4df48b')
    .then((result) => {
      isKeyManager = result;
    })
    .catch(() => {
      isKeyManager = false;
    });

  return isKeyManager;
};

const uploadProfileData = async (
  profileData: ISetProfileData,
): Promise<string> => {
  if (typeof profileData.profileImage[0].url !== 'string') {
    await addFile(profileData.profileImage[0].url).then((path) => {
      if (path) {
        profileData = {
          ...profileData,
          profileImage: [
            {
              ...profileData.profileImage[0],
              url: path,
              hash: path.replace('ipfs://', ''),
              width: '1',
              height: '1',
            },
          ],
        };
      }
    });
  }
  if (typeof profileData.backgroundImage[0].url !== 'string') {
    await addFile(profileData.backgroundImage[0].url).then((path) => {
      if (path) {
        profileData = {
          ...profileData,
          backgroundImage: [
            {
              ...profileData.backgroundImage[0],
              url: path,
              hash: path.replace('ipfs://', ''),
              width: '1',
              height: '1',
            },
          ],
        };
      }
    });
  }
  const json = JSON.stringify({
    LSP3Profile: profileData,
  });

  const jsonIpfsPath = await addData(profileData);

  if (!jsonIpfsPath) throw new Error('Something went wrong');

  const hashFunction = ethers.utils
    .keccak256(ethers.utils.toUtf8Bytes('keccak256(utf8)'))
    .substring(0, 10);
  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(json));
  const url = Web3.utils.utf8ToHex(jsonIpfsPath);

  const JSONURL = hashFunction + hash.substring(2) + url.substring(2);

  return JSONURL;
};

const transferCardViaUniversalProfile = async (
  assetAddress: string,
  universalProfileAddress: string,
  tokenId: number,
  toAddress: string,
  signer: Signer,
) => {
  const assetContract = CardTokenProxy__factory.connect(assetAddress, signer);
  const universalProfileContract = UniversalProfileProxy__factory.connect(
    universalProfileAddress,
    signer,
  );

  const encodedTransferFunction = assetContract.interface.encodeFunctionData(
    'transferFrom',
    [universalProfileAddress, toAddress, tokenId],
  );

  const transaction = await universalProfileContract.execute(
    '0x0',
    assetAddress,
    0,
    encodedTransferFunction,
  );
  await transaction.wait(1).then((result) => {
    if (result.status === 0) {
      throw new Error('Transaction reverted');
    }
  });
};

const setCardMarketViaUniversalProfile = async (
  assetAddress: string,
  universalProfileAddress: string,
  tokenId: number,
  acceptedToken: string,
  minimumAmount: number,
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
    [tokenIdAsBytes, acceptedToken, minimumAmount],
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

const approveTokenViaUniversalProfile = async (
  universalProfileAddress: string,
  spenderAddress: string,
  tokenAddress: string,
  amount: BigNumber,
  signer: Signer,
) => {
  const universalProfileContract = UniversalProfileProxy__factory.connect(
    universalProfileAddress,
    signer,
  );
  const erc20Contract = ERC20__factory.connect(tokenAddress, signer);
  const encodedApprove = erc20Contract.interface.encodeFunctionData('approve', [
    spenderAddress,
    amount.toString(),
  ]);

  const transaction = await universalProfileContract.execute(
    '0x0',
    spenderAddress,
    0,
    encodedApprove,
  );

  await transaction.wait(1).then((result) => {
    if (result.status === 0) {
      throw new Error('Transaction reverted');
    }
  });
};

const buyFromCardMarketViaUniversalProfile = async (
  assetAddress: string,
  universalProfileAddress: string,
  tokenId: number,
  minimumAmount: number,
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
    [tokenIdBytes, minimumAmount, ''],
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

const transferBalanceViaUniversalProfile = async (
  tokenAddress: string,
  universalProfileAddress: string,
  amountToTransfer: BigNumberish,
  toAddress: string,
  signer: Signer,
) => {
  const tokenContract = ERC20__factory.connect(tokenAddress, signer);
  const universalProfileContract = UniversalProfileProxy__factory.connect(
    universalProfileAddress,
    signer,
  );
  const encodedTransfer = tokenContract.interface.encodeFunctionData(
    'transfer',
    [toAddress, amountToTransfer],
  );

  const transaction = await universalProfileContract.execute(
    '0x0',
    tokenAddress,
    0,
    encodedTransfer,
  );
  await transaction.wait(1).then((result) => {
    if (result.status === 0) {
      throw new Error('Transaction reverted');
    }
  });
};
const removeMarket = async (
  assetAddress: string,
  universalProfileAddress: string,
  tokenId: BytesLike,
  signer: Signer,
) => {
  const assetContract = CardMarket__factory.connect(assetAddress, signer);
  const universalProfileContract = UniversalProfileProxy__factory.connect(
    universalProfileAddress,
    signer,
  );

  const encodedRemoveMarketForFunction =
    assetContract.interface.encodeFunctionData('removeMarketFor', [tokenId]);

  const transaction = await universalProfileContract.execute(
    '0x0',
    assetAddress,
    0,
    encodedRemoveMarketForFunction,
  );
  await transaction.wait(1).then((result) => {
    if (result.status === 0) {
      throw new Error('Transaction reverted');
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
  transferCardViaUniversalProfile,
  setCardMarketViaUniversalProfile,
  approveTokenViaUniversalProfile,
  buyFromCardMarketViaUniversalProfile,
  checkKeyManager,
  isUniversalProfile,
  fetchOwnerOfProfile,
  transferBalanceViaUniversalProfile,
  removeMarket,
};
