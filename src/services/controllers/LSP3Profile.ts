/* eslint-disable react-hooks/rules-of-hooks */
import KeyChain from '../utilities/KeyChain';
import {
  IOwnedAssets,
  IPermissionSet,
  IProfile,
  ISetProfileData,
  SupportedInterface,
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
import { BigNumberish, BytesLike, ethers, Signer } from 'ethers';
import { encodeArrayKey } from '@erc725/erc725.js/build/main/lib/utils';
import { ERC725 } from '@erc725/erc725.js';
import Web3 from 'web3';
import { useRpcProvider } from '../../hooks/useRpcProvider';
import { tokenIdAsBytes32 } from '../../utils/cardToken';
import ABIs from '../utilities/ABIs';
import { Address } from '../../utils/types';

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

  let hashedUrl: string = '0x';

  const universalProfile = UniversalProfileProxy__factory.connect(
    address,
    provider,
  );

  const universalProfileOld = new ethers.Contract(
    address,
    ABIs.LSP3AccountABI,
    provider,
  );

  const [owner, permissionSet] = await Promise.all([
    universalProfile.owner(),
    getKeyManagerPermissions(address, network),
  ]);

  const isOwnerKeyManager = await checkKeyManager(owner, network);

  try {
    hashedUrl = (await universalProfile.getData([KeyChain.LSP3PROFILE]))[0];
  } catch (error) {
    try {
      hashedUrl = await universalProfileOld.getData(KeyChain.LSP3PROFILE);
    } catch (error) {
      throw new Error('Profile not found');
    }
  }

  if (hashedUrl === '0x')
    return {
      owner,
      address: address,
      network,
      ownedAssets: [] as IOwnedAssets[],
      issuedAssets: [] as string[],
      profileImage: '',
      profileImageHash: '',
      backgroundImage: '',
      backgroundImageHash: '',
      permissionSet,
      isOwnerKeyManager,
    } as IProfile;

  let metaData: any;

  try {
    metaData = await getLSP3ProfileData(hashedUrl);
  } catch (error) {}

  if (!metaData || !metaData.LSP3Profile) {
    throw new Error('Invalid LSP3Profile Format');
  }

  const profile: IProfile = {
    ...metaData?.LSP3Profile,
    owner,
    address: address,
    network,
    ownedAssets: [] as IOwnedAssets[],
    issuedAssets: [] as string[],
    permissionSet,
    isOwnerKeyManager,
    profileImage:
      metaData.LSP3Profile?.profileImage && metaData.LSP3Profile.profileImage[0]
        ? typeof metaData.LSP3Profile.profileImage[0].url === 'string'
          ? Utils.convertURL(metaData.LSP3Profile.profileImage[0].url)
          : ''
        : null,
    profileImageHash:
      metaData.LSP3Profile?.profileImage && metaData.LSP3Profile.profileImage[0]
        ? metaData.LSP3Profile.profileImage[0].hash
          ? metaData.LSP3Profile.profileImage[0].hash
          : ''
        : '',
    backgroundImage:
      metaData.LSP3Profile?.backgroundImage &&
      metaData.LSP3Profile.backgroundImage[0]
        ? typeof metaData.LSP3Profile.backgroundImage[0].url === 'string'
          ? Utils.convertURL(metaData.LSP3Profile.backgroundImage[0].url)
          : ''
        : null,
    backgroundImageHash:
      metaData.LSP3Profile?.backgroundImage &&
      metaData.LSP3Profile.backgroundImage[0]
        ? metaData.LSP3Profile.backgroundImage[0].hash
          ? metaData.LSP3Profile.backgroundImage[0].hash
          : ''
        : '',
  };
  return profile;
};

const getProfile = async (
  address: string,
  network: NetworkName,
): Promise<IProfile | void> => {
  if (address.length < 42) {
    const missingCaractersCount = 42 - address.length;

    throw new Error(
      `Invalid address, missing ${missingCaractersCount} character${
        missingCaractersCount === 1 ? '' : 's'
      }`,
    );
  }

  if (!ethers.utils.isAddress(address)) {
    throw new Error('Address is invalid or does not exist');
  }

  const isValidProfile = await LSP3ProfileApi.isUniversalProfile(
    address,
    network,
  );

  if (!isValidProfile) {
    throw new Error('Address is invalid or does not exist');
  }

  return LSP3ProfileApi.fetchProfile(address, network);
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

  try {
    numAssetsHex = (await contract.getData([KeyChain.LSP3IssuedAssets]))[0];
  } catch (error) {
    numAssetsHex = (await universalProfileOld.getData(
      KeyChain.LSP3IssuedAssets,
    )) as string;
  }

  // Convert the hex to decimal
  //
  // Example:
  //      0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000007 => 7
  //      0x000000000000000000000000000000000000000000000000000000000000000a => 10
  //      0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000013 => 19
  // const numAssets = EthereumSerive.web3.utils.hexToNumber(numAssetsHex);
  const numAssets = parseInt(numAssetsHex, 16);

  if (isNaN(numAssets) || numAssets === 0) {
    return assets;
  }

  // The first 16 bytes are the first 16 bytes of the key hash     => [elementPrefix]
  // The second 16 bytes is a uint128 of the number of the element => [elementSufix]
  //
  // Get the first 16 bytes + '0x' => 34
  const elementPrefix = KeyChain.LSP3IssuedAssets.slice(0, 34);

  const results = await Promise.allSettled(
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

      try {
        assetAddr = (await contract.getData([elementKey]))[0];
      } catch (error) {
        assetAddr = (await universalProfileOld.getData(elementKey)) as string;
      }

      return assetAddr;
    }),
  );

  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value !== '0x') {
      assets.push(result.value);
    }
  });

  return assets;
};

const fetchOwnedAssetsAddressesWithBalance = async (
  address: string,
  network: NetworkName,
) => {
  const provider = useRpcProvider(network);
  const contract = ERC725Y__factory.connect(address, provider);
  let ownedAssetsWithBalance = [] as IOwnedAssets[];

  try {
    const result = await fetchLSP5Data(contract);

    const ownedAssets = result.find(
      (x) => x.schemaName === 'LSP5ReceivedAssets[]',
    );
    if (isFetchDataForSchemaResultList(ownedAssets)) {
      ownedAssetsWithBalance = await Promise.all(
        ownedAssets.listEntries.map(async (ownedAsset) => {
          const res = await fetchBalanceOf(
            network,
            ownedAsset.value,
            false,
            address,
          );
          return res;
        }),
      );
    }
  } catch (error) {
    try {
      const ownedAssets = await fetchOwnedAssetsAddressesWithBalanceOld(
        network,
        address,
      );
      const result = await Promise.allSettled(
        ownedAssets.map(
          async (ownedAsset) =>
            await fetchBalanceOf(network, ownedAsset, true, address),
        ),
      );
      result.forEach((item) => {
        if (item.status === 'fulfilled') {
          ownedAssetsWithBalance.push(item.value);
        }
      });
    } catch (error) {
      ownedAssetsWithBalance = [];
    }
  }

  return ownedAssetsWithBalance;
};

const fetchOwnedAssetsAddressesWithBalanceOld = async (
  network: string,
  profileAddress: string,
): Promise<string[]> => {
  const provider = useRpcProvider(network);
  const profileContract = new ethers.Contract(
    profileAddress,
    ABIs.LSP3AccountABI,
    provider,
  );
  const lsp1Address = await profileContract.getData(KeyChain.LSP1DELEGATE);

  const universalRecieverContract = new ethers.Contract(
    lsp1Address,
    ABIs.UniversalReceiverABI,
    provider,
  );

  const assetsAddresses = await universalRecieverContract.getAllRawValues();

  const ownedAssets = new Array(assetsAddresses.length)
    .fill(0)
    .map((_, index) => `0x${assetsAddresses[index].slice(26)}`);

  return ownedAssets;
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

  const results = await Promise.allSettled(
    addressList.map(async (address) => await profileFetcher(address, network)),
  );

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      profiles.push(result.value);
    }
  });

  return profiles;
};

const fetchCreatorsAddresses = async (
  address: string,
  network: NetworkName,
  supportedInterface: SupportedInterface,
): Promise<string[]> => {
  const provider = useRpcProvider(network);

  const contract = CardTokenProxy__factory.connect(address, provider);

  const contractLSP3 = new ethers.Contract(
    address,
    ABIs.LSP3AccountABI,
    provider,
  );

  const numCreatorHex =
    supportedInterface === 'lsp8'
      ? await contract.getData([KeyChain.LSP4Creators])
      : await contractLSP3.getData(KeyChain.LSP4Creators);

  if (!numCreatorHex) {
    throw new Error('No creator found');
  }

  const numCreators = parseInt(
    supportedInterface === 'lsp8' ? numCreatorHex[0] : numCreatorHex,
    16,
  );

  const elementPrefix = KeyChain.LSP4Creators.slice(0, 34);

  let creators: string[] = [];

  await Promise.allSettled(
    new Array(numCreators).fill(0).map(async (_, index) => {
      const elementSufix = index.toString(16);
      const elementKey =
        elementPrefix.padEnd(66 - elementSufix.length, '0') + elementSufix;
      const creatorAddr =
        supportedInterface === 'lsp8'
          ? await contract.getData([elementKey])
          : await contractLSP3.getData(elementKey);
      return creatorAddr;
    }),
  ).then((results) =>
    results.forEach((result) => {
      if (result.status === 'fulfilled')
        creators.push(
          supportedInterface === 'lsp8' ? result.value[0] : result.value,
        );
    }),
  );

  return creators;
};

const fetchBalanceOf = async (
  network: NetworkName,
  assetAddress: string,
  oldStandard: boolean,
  profileAddress?: string,
): Promise<IOwnedAssets> => {
  if (!profileAddress) {
    return {} as IOwnedAssets;
  }
  const provider = useRpcProvider(network);
  const contract = CardTokenProxy__factory.connect(assetAddress, provider);
  const balance = await contract.balanceOf(profileAddress);

  if (!oldStandard) {
    const tokenIds = await (
      await contract.tokenIdsOf(profileAddress)
    ).map((tokenId) => ethers.BigNumber.from(tokenId).toNumber());
    return {
      assetAddress,
      balance: ethers.BigNumber.from(balance).toNumber(),
      tokenIds,
    };
  }

  return {
    assetAddress,
    balance: balance.toNumber(),
    tokenIds: [],
  };
};

const setUniversalProfileData = async (
  profileAddress: string,
  profileData: ISetProfileData,
  signer: Signer,
): Promise<ethers.ContractTransaction> => {
  const contract = UniversalProfileProxy__factory.connect(
    profileAddress,
    signer,
  );

  let transaction: ethers.ContractTransaction;

  try {
    const JSONURL = await uploadProfileData(profileData);

    transaction = await contract.setData([KeyChain.LSP3PROFILE], [JSONURL]);
  } catch (error: any) {
    throw new Error(error.message);
  }

  return transaction;
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

  let transaction: ethers.ContractTransaction;

  const JSONURL = await uploadProfileData(profileData);
  const enodedData = universalProfileContract.interface.encodeFunctionData(
    'setData',
    [[KeyChain.LSP3PROFILE], [JSONURL]],
  );

  transaction = await keyManagerContract.execute(enodedData);

  return transaction;
};

const getKeyManagerPermissions = async (
  address: string,
  network: NetworkName,
): Promise<IPermissionSet[]> => {
  const provider = useRpcProvider(network);
  const contract = UniversalProfileProxy__factory.connect(address, provider);
  const universalProfileOld = new ethers.Contract(
    address,
    ABIs.LSP3AccountABI,
    provider,
  );

  let addressPermissions: string = '0x';

  try {
    addressPermissions = (
      await contract.getData([KeyChain.LSP6AddressPermissions])
    )[0];
  } catch (error) {
    try {
      addressPermissions = await universalProfileOld.getData(
        KeyChain.LSP6AddressPermissions,
      );
    } catch (error) {}
  }

  if (addressPermissions !== '0x') {
    const arrayLength = ethers.BigNumber.from(addressPermissions).toNumber();

    const indexKeys = new Array(arrayLength)
      .fill(null)
      .map((_value, index) =>
        encodeArrayKey(KeyChain.LSP6AddressPermissions, index),
      );

    let indexValues: string[] = ['0x'];
    await contract
      .getData(indexKeys)
      .then((result) => {
        indexValues = result;
      })
      .catch(async () => {
        indexValues = await Promise.all(
          indexKeys.map(async (key) => await universalProfileOld.getData(key)),
        );
      });

    const permissionsSet = await Promise.all(
      indexValues.map(async (address) => {
        if (address !== '0x') {
          const key =
            KeyChain.LSP6AddressPermissions_Permissions +
            address.replace(/^0x/, '');

          let res: string = '';
          await contract
            .getData([key])
            .then((result) => {
              res = result[0];
            })
            .catch(async () => {
              await universalProfileOld
                .getData(key)
                .then((result: string) => {
                  res = result;
                })
                .catch(() => {});
            });

          const permissionsBinary = ERC725.decodePermissions(res);

          const keys = Object.keys(permissionsBinary) as Array<
            keyof typeof permissionsBinary
          >;

          const permissions = Object.fromEntries(
            keys.map((item, i) => [
              item.toLowerCase(),
              permissionsBinary[item] ? '1' : '0',
            ]),
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

const checkKeyManager = async (
  address: string,
  network: NetworkName,
): Promise<boolean> => {
  try {
    const provider = useRpcProvider(network);
    const contract = LSP6KeyManagerProxy__factory.connect(address, provider);
    const isKeyManager = await contract.supportsInterface('0x6f4df48b');

    return isKeyManager;
  } catch (error) {
    return false;
  }
};

const uploadProfileData = async (
  profileData: ISetProfileData,
): Promise<string> => {
  profileData = {
    ...profileData,
    profileImage: [
      {
        ...profileData.profileImage[0],
        width: '1',
        height: '1',
      },
    ],
    backgroundImage: [
      {
        ...profileData.backgroundImage[0],
        width: '1',
        height: '1',
      },
    ],
  };
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
  amount: number,
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

const encodeSetData = (
  profileAddress: Address,
  jsonUrl: string,
  signer: Signer,
): string => {
  const universalProfileContract = UniversalProfileProxy__factory.connect(
    profileAddress,
    signer,
  );

  const encodedSetData = universalProfileContract.interface.encodeFunctionData(
    'setData',
    [[KeyChain.LSP3PROFILE], [jsonUrl]],
  );

  return encodedSetData;
};

const encodeExecute = (
  universalProfileAddress: Address,
  callToAddress: Address,
  encodedData: string,
  signer: Signer,
): string => {
  const contract = UniversalProfileProxy__factory.connect(
    universalProfileAddress,
    signer,
  );
  const encodedExecute = contract.interface.encodeFunctionData('execute', [
    '0x0',
    callToAddress,
    0,
    encodedData,
  ]);
  return encodedExecute;
};

const executeTransactionViaUniversalProfile = async (
  universalProfileAddress: Address,
  callToAddress: Address,
  encodedData: string,
  signer: Signer,
): Promise<void> => {
  const contract = UniversalProfileProxy__factory.connect(
    universalProfileAddress,
    signer,
  );
  const transaction = await contract.execute(
    '0x0',
    callToAddress,
    0,
    encodedData,
  );

  await transaction.wait(1).then((result) => {
    if (result.status === 0) {
      throw new Error('Transaction reverted');
    }
  });
};

export const LSP3ProfileApi = {
  fetchProfile,
  getProfile,
  fetchAllProfiles,
  fetchCreatorsAddresses,
  fetchProfileIssuedAssetsAddresses,
  fetchOwnedAssetsAddressesWithBalance,
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
  encodeExecute,
  executeTransactionViaUniversalProfile,
};
