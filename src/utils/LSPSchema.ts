import { ethers } from 'ethers';

import { catJsonFile, addJSON, addDirectory } from './ipfs';
import { LSP6_KEY_MANAGER_PERMISSIONS } from './keyManager';
import {
  getSchemaElement,
  encodeKey,
  encodeArrayKey,
  encodeKeyValue,
  decodeKeyValue,
  decodeKey,
} from '@erc725/erc725.js/build/main/lib/utils';
import type { ERC725JSONSchema } from '@erc725/erc725.js';
import type { Address } from './types';
import type { LSP6KeyManagerPermissions } from './keyManager';
import type { ERC725Y } from '../submodules/fanzone-smart-contracts/typechain';
import sizeOf from 'image-size';

const fakeIpfsCid = 'XXaqkhWLvb4xys8VnJSXnfzV6E824STGfiNPnrF7rVXr6C';

//
// --- schema definitions
//

const LSP3UniversalProfileMetadataSchemaList: Array<ERC725JSONSchema> = [
  {
    name: 'SupportedStandards:LSP3UniversalProfile',
    key: '0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6',
    keyType: 'Mapping',
    valueContent: '0xabe425d6',
    valueType: 'bytes',
  },
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    keyType: 'Singleton',
    valueContent: 'JSONURL',
    valueType: 'bytes',
  },
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    keyType: 'Singleton',
    valueContent: 'Address',
    valueType: 'address',
  },
  {
    name: 'LSP3IssuedAssets[]',
    key: '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
    keyType: 'Array',
    valueContent: 'Address',
    valueType: 'address',
  },
];

const LSP4DigitalAssetMetadataSchemaList: Array<ERC725JSONSchema> = [
  {
    name: 'SupportedStandards:LSP4DigitalAsset',
    key: '0xeafec4d89fa9619884b6b89135626455000000000000000000000000a4d96624',
    keyType: 'Mapping',
    valueContent: '0xa4d96624',
    valueType: 'bytes',
  },
  {
    name: 'LSP4Metadata',
    key: '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e',
    keyType: 'Singleton',
    valueContent: 'JSONURL',
    valueType: 'bytes',
  },
  {
    name: 'LSP4Creators[]',
    key: '0x114bd03b3a46d48759680d81ebb2b414fda7d030a7105a851867accf1c2352e7',
    keyType: 'Array',
    valueContent: 'Address',
    valueType: 'address',
  },
  {
    name: 'LSP4TokenName',
    key: '0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1',
    keyType: 'Singleton',
    valueContent: 'String',
    valueType: 'string',
  },
  {
    name: 'LSP4TokenSymbol',
    key: '0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756',
    keyType: 'Singleton',
    valueContent: 'String',
    valueType: 'string',
  },
];

const LSP5ReceivedAssetsSchemaList: Array<ERC725JSONSchema> = [
  {
    name: 'LSP5ReceivedAssets[]',
    key: '0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b',
    keyType: 'Array',
    valueContent: 'Address',
    valueType: 'address',
  },
];

const LSP6KeyManagerSchemaList: Array<ERC725JSONSchema> = [
  {
    name: 'AddressPermissions[]',
    key: '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
    keyType: 'Array',
    valueContent: 'Address',
    valueType: 'address',
  },
];

const LSPSchemas: Array<ERC725JSONSchema> = [
  ...LSP3UniversalProfileMetadataSchemaList,
  ...LSP4DigitalAssetMetadataSchemaList,
  ...LSP5ReceivedAssetsSchemaList,
  ...LSP6KeyManagerSchemaList,
];

//
// --- base schema functions
//

// convenience getting a schema `key` by its `name` (ie. when calling `getData` for ERC725Y)
export const getSchemaKey = (schemaName: string): string => {
  const schema = getSchemaElement(LSPSchemas, schemaName);
  return schema.key;
};

export const decodeWithSchema = (schemaName: string, data: any): any => {
  const schema = getSchemaElement(LSPSchemas, schemaName);
  return decodeKey(schema, data);
};

export const encodeWithSchema = (schemaName: string, data: any): any => {
  const schema = getSchemaElement(LSPSchemas, schemaName);
  return encodeKey(schema, data);
};

//
// --- schema builders
//

export type LSPImage = {
  height: number;
  width: number;
  hashFunction: 'keccak256(bytes)';
  hash: string;
  url: string;
};

export type LSPAsset = {
  hashFunction: 'keccak256(bytes)';
  hash: string;
  url: string;
  fileType: string;
};

export type LSPLink = {
  title: string;
  url: string;
};

export const buildLSPImage = async (
  image: Buffer,
  cid: string,
): Promise<LSPImage> => {
  const { width = 0, height = 0 } = sizeOf(image);
  const hash = ethers.utils.keccak256(image);

  return {
    height,
    width,
    hashFunction: 'keccak256(bytes)',
    hash,
    url: `ipfs://${cid}`,
  };
};

export type LSP3ProfileData = {
  name: string;
  description: string;
  links?: Array<LSPLink>;
  tags?: Array<string>;
  profileImage?: Array<LSPImage>;
  backgroundImage?: Array<LSPImage>;
};

const defaultLSP3Profile: LSP3ProfileData = {
  name: 'LSP3Profile name',
  description: 'LSP3Profile description',
  links: [],
  tags: [],
  profileImage: [
    {
      height: 300,
      width: 300,
      hashFunction: 'keccak256(bytes)',
      hash: '0x3357a1e8fa627f80a107418529c59678a3b431257a7fb06237e5a3d9e05aadd7',
      url: 'ipfs://QmdYPbSr4DPpi7kLnYPpSqbYg9xDbABWw71QcWLMC7ZZ7o',
    },
  ],
  backgroundImage: [
    {
      height: 300,
      width: 300,
      hashFunction: 'keccak256(bytes)',
      hash: '0x25b0c021dcb3779a029d4633863c8933311343c823e6e35a592493ab1344dfc1',
      url: 'ipfs://QmTRpjADREyRinr4H9MYx6PbykLVrwKutEetznejFYLUD6',
    },
  ],
};

export const buildLSP3Profile = async (
  isLocalTestnet: boolean,
  {
    name,
    description,
    profileImage = defaultLSP3Profile.profileImage,
    backgroundImage = defaultLSP3Profile.backgroundImage,
    links = defaultLSP3Profile.links,
    tags = defaultLSP3Profile.tags,
  }: LSP3ProfileData,
): Promise<string> => {
  const schemaJson = JSON.stringify({
    LSP3Profile: {
      name,
      description,
      links,
      tags,
      profileImage,
      backgroundImage,
    },
  });

  let cid;
  if (isLocalTestnet) {
    cid = fakeIpfsCid;
  } else {
    cid = await addJSON(schemaJson);
  }
  const jsonHash = ethers.utils.keccak256(Buffer.from(schemaJson));

  return encodeWithSchema('LSP3Profile', {
    hashFunction: 'keccak256(utf8)',
    hash: jsonHash,
    url: `ipfs://${cid}`,
  });
};

export type LSP4MetadataData = {
  description: string;
  links?: Array<LSPLink>;
  images?: Array<Array<LSPImage>>;
  assets?: Array<LSPAsset>;
};

const defaultLSP4Metadata: LSP4MetadataData = {
  description: 'LSP4Metadata description',
  links: [],
  images: [
    [
      {
        width: 300,
        height: 300,
        hashFunction: 'keccak256(bytes)',
        hash: '0x3357a1e8fa627f80a107418529c59678a3b431257a7fb06237e5a3d9e05aadd7',
        url: 'ipfs://QmdYPbSr4DPpi7kLnYPpSqbYg9xDbABWw71QcWLMC7ZZ7o',
      },
    ],
  ],
  assets: [],
};

export const buildLSP4Metadata = async (
  isLocalTestnet: boolean,
  {
    description,
    links = defaultLSP4Metadata.links,
    images = defaultLSP4Metadata.images,
    assets = defaultLSP4Metadata.assets,
  }: LSP4MetadataData,
  extraData: { [key: string]: any } = {},
): Promise<string> => {
  const schemaJson = JSON.stringify({
    ...extraData,
    LSP4Metadata: {
      description,
      links,
      images,
      assets,
    },
  });

  let cid;
  if (isLocalTestnet) {
    cid = fakeIpfsCid;
  } else {
    cid = await addJSON(schemaJson);
  }
  const jsonHash = ethers.utils.keccak256(Buffer.from(schemaJson));

  return encodeWithSchema('LSP4Metadata', {
    hashFunction: 'keccak256(utf8)',
    hash: jsonHash,
    url: `ipfs://${cid}`,
  });
};

export const buildLSP4MetadataDirectory = async (
  isLocalTestnet: boolean,
  schemaJson: LSP4MetadataData,
  extraDatas: Array<{ [key: string]: any }>,
): Promise<string> => {
  if (extraDatas.length === 0) {
    throw new Error(
      'buildLSP4MetadataDirectory::ERROR need at least one element in extraDatas param',
    );
  }

  const schemaJsonsArray = extraDatas.map((extraData) => {
    const { description, links, images, assets } = schemaJson;

    return JSON.stringify({
      ...extraData,
      LSP4Metadata: {
        description,
        links,
        images,
        assets,
      },
    });
  });

  let cid;
  if (isLocalTestnet) {
    cid = fakeIpfsCid;
  } else {
    cid = await addDirectory(schemaJsonsArray);
  }
  const jsonHash = ethers.utils.keccak256(Buffer.from(schemaJsonsArray[0]));

  return encodeWithSchema('LSP4Metadata', {
    hashFunction: 'keccak256(utf8)',
    hash: jsonHash,
    // NOTE: we want to have compatibility with in the future with other LSP tooling, so we return a
    // json file that will be stored on-chain as LSP4Metadata
    url: `ipfs://${cid}/0.json`,
  });
};

//
// --- schema updaters
//

// this function ensures we will not add the same entry twice to an array
export const updateAddToArrayMetadata = async (
  schemaName: string,
  contract: ERC725Y,
  listEntries: Array<string>,
) => {
  const schema = getSchemaElement(LSPSchemas, schemaName);
  if (schema.keyType.toLowerCase() !== 'array') {
    throw new Error(`schema ${schema.name} is not encoding an array`);
  }

  const [currentLength] = await contract.callStatic.getData([
    getSchemaKey(schemaName),
  ]);
  const startIndex =
    currentLength === '0x'
      ? 0
      : ethers.BigNumber.from(currentLength).toNumber();

  const encodedData = {
    keys: [],
    values: [],
  } as { keys: Array<string>; values: Array<string> };

  let nextIndex = 0;
  const fetchedData = await fetchDataForSchema(schema, contract, currentLength);
  if (isFetchDataForSchemaResultList(fetchedData)) {
    listEntries.forEach((listEntry) => {
      const index = startIndex + nextIndex;
      const existingIndex = fetchedData.listEntries.findIndex(
        (existingEntry) =>
          decodeKey(schema, existingEntry.value) ===
          decodeKey(schema, listEntry),
      );

      // when the entry already exists, no update to make
      if (existingIndex !== -1) {
        return;
      }

      // this is the encoding for the array element at the derived index
      encodedData.keys.push(encodeArrayKey(schema.key, index));
      encodedData.values.push(
        encodeKeyValue(
          schema.valueContent,
          schema.valueType,
          listEntry,
          schema.name,
        ),
      );

      nextIndex += 1;
    });

    // when we made no new entries, no update to make
    if (nextIndex !== 0) {
      // this is the encoding for the array, value is new array length
      encodedData.keys.push(schema.key);
      encodedData.values.push(
        encodeKeyValue(
          'Number',
          'uint256',
          String(startIndex + nextIndex),
          schema.name,
        ),
      );
    }
  }

  return encodedData;
};

//
// --- schema fetchers
//

type FetchDataForSchemaEntry = {
  key: string;
  value: string;
};

type FetchDataForSchemaDecodedEntry = {
  decodedValue: any;
} & FetchDataForSchemaEntry;

type FetchDataForSchemaResult = {
  schemaName: string;
  ipfsData: any;
} & FetchDataForSchemaDecodedEntry;

type FetchDataForSchemaResultList = {
  schemaName: string;
  listEntries: Array<FetchDataForSchemaDecodedEntry>;
} & FetchDataForSchemaEntry;

export const isFetchDataForSchemaResultList = (
  x: any,
): x is FetchDataForSchemaResultList => {
  if (x && x.listEntries) {
    return true;
  } else {
    return false;
  }
};

export const fetchDataForSchema = async (
  schema: ERC725JSONSchema,
  contract: ERC725Y,
  fetchedSchemaValue: string,
): Promise<FetchDataForSchemaResult | FetchDataForSchemaResultList> => {
  if (schema.keyType.toLowerCase() === 'array') {
    let listEntries: Array<FetchDataForSchemaDecodedEntry> = [];

    if (fetchedSchemaValue !== '0x') {
      const arrayLength = ethers.BigNumber.from(fetchedSchemaValue).toNumber();

      const indexKeys = new Array(arrayLength)
        .fill(null)
        .map((_value, index) => encodeArrayKey(schema.key, index));

      const indexValues = await contract.callStatic.getData(indexKeys);

      listEntries = indexKeys.map((indexKey, index) => {
        const indexValue = indexValues[index];
        const decodedValue = decodeKeyValue(
          schema.valueContent,
          schema.valueType,
          indexValue,
          schema.name,
        );

        return {
          key: indexKey,
          value: indexValue,
          decodedValue,
        };
      });
    }

    // TODO: verify hash of array key value & all listEntries

    return {
      schemaName: schema.name,
      key: schema.key,
      value: fetchedSchemaValue,
      listEntries,
    };
  } else {
    const decodedValue = decodeKey(schema, fetchedSchemaValue);

    let ipfsData = null;
    if (decodedValue?.url?.indexOf('ipfs://') === 0) {
      const cid = (decodedValue.url as string).replace('ipfs://', '');
      if (!cid.startsWith(fakeIpfsCid)) {
        ipfsData = await catJsonFile(cid);
      }
    }

    // TODO: verify hash

    return {
      schemaName: schema.name,
      key: schema.key,
      value: fetchedSchemaValue,
      decodedValue,
      ipfsData,
    };
  }
};

export const fetchDataForSchemaList = async (
  contract: ERC725Y,
  schemaList: ERC725JSONSchema[],
) => {
  const schemaKeys = schemaList.map((schema) => schema.key);
  const schemaValues = await contract.callStatic.getData(schemaKeys);

  return Promise.all(
    schemaList.map((schema, index) =>
      fetchDataForSchema(schema, contract, schemaValues[index]),
    ),
  );
};

export const fetchLSP3Data = async (contract: ERC725Y) => {
  return fetchDataForSchemaList(
    contract,
    LSP3UniversalProfileMetadataSchemaList,
  );
};

export const fetchLSP4Data = async (contract: ERC725Y) => {
  return fetchDataForSchemaList(contract, LSP4DigitalAssetMetadataSchemaList);
};

export const fetchLSP5Data = async (contract: ERC725Y) => {
  const metadata = await fetchDataForSchemaList(
    contract,
    LSP5ReceivedAssetsSchemaList,
  );
  const receivedAssets = metadata.find(
    (x) => x.schemaName === 'LSP5ReceivedAssets[]',
  );

  if (isFetchDataForSchemaResultList(receivedAssets)) {
    await Promise.all(
      receivedAssets.listEntries.map(async (receivedAsset) => {
        const [receivedAssetMapEntry] = await contract.callStatic.getData([
          LSPMappings.LSP5ReceivedAssetsMap.buildKey(
            receivedAsset.decodedValue,
          ),
        ]);

        // mutating the result to include parsed map entries
        (receivedAsset as any).mapEntries = {
          receivedAsset: LSPMappings.LSP5ReceivedAssetsMap.parseValue(
            receivedAssetMapEntry,
          ),
        };
      }),
    );
  }

  return metadata;
};

export const fetchLSP6Data = async (contract: ERC725Y) => {
  const metadata = await fetchDataForSchemaList(
    contract,
    LSP6KeyManagerSchemaList,
  );
  const addressPermissions = metadata.find(
    (x) => x.schemaName === 'AddressPermissions[]',
  );

  if (isFetchDataForSchemaResultList(addressPermissions)) {
    await Promise.all(
      addressPermissions.listEntries.map(async (addressWithPermission) => {
        const [
          permissions,
          allowedAddresses,
          allowedFunctions,
          allowedStandards,
        ] = await contract.callStatic.getData([
          LSPMappings.LSP6KeyManagerAddressPermissions.buildKey(
            addressWithPermission.decodedValue,
          ),
          LSPMappings.LSP6KeyManagerAddressPermissionsAllowedAddresses.buildKey(
            addressWithPermission.decodedValue,
          ),
          LSPMappings.LSP6KeyManagerAddressPermissionsAllowedFunctions.buildKey(
            addressWithPermission.decodedValue,
          ),
          LSPMappings.LSP6KeyManagerAddressPermissionsAllowedStandards.buildKey(
            addressWithPermission.decodedValue,
          ),
        ]);

        // mutating the result to include parsed map entries
        //
        // TODO: should update this type to be able to include the mapEntries, or split it out as
        // something separate.. original use case was being able to log to terminal but if we want
        // to work with this in code we need a better type or every downstream use is cast to `any`
        (addressWithPermission as any).mapEntries = {
          permissions:
            LSPMappings.LSP6KeyManagerAddressPermissions.parseValue(
              permissions,
            ),
          allowedAddresses:
            LSPMappings.LSP6KeyManagerAddressPermissionsAllowedAddresses.parseValue(
              allowedAddresses,
            ),
          allowedFunctions:
            LSPMappings.LSP6KeyManagerAddressPermissionsAllowedFunctions.parseValue(
              allowedFunctions,
            ),
          allowedStandards:
            LSPMappings.LSP6KeyManagerAddressPermissionsAllowedStandards.parseValue(
              allowedStandards,
            ),
        };
      }),
    );
  }

  return metadata;
};

//
// --- LSP Mapping
//

export enum ERC165InterfaceIds {
  LSP7 = '0xe33f65c3',
  LSP8 = '0x49399145',
}

export const LSPMappings = {
  LSP5ReceivedAssetsMap: {
    buildKey: (address: Address) =>
      // LSP5ReceivedAssetsMap:<address>
      `0x812c4334633eb81600000000${address.replace(/^0x/, '')}`,

    parseValue: (
      hexValue: string, // bytes8(index) + bytes4(ERC165 interface id)
    ) => {
      const value = hexValue.replace(/^0x/, '');

      const index = parseInt(value.slice(0, 16), 10);
      const interfaceId = `0x${value.slice(16, 20)}`;

      const tokenType =
        interfaceId === ERC165InterfaceIds.LSP7 ? 'LSP7' : 'LSP8';

      return {
        schemaName: 'LSP5ReceivedAssetsMap:<address>',
        value,
        parsedValue: {
          index,
          tokenType,
        },
      };
    },
  },

  LSP6KeyManagerAddressPermissions: {
    buildKey: (address: Address) =>
      // AddressPermissions:Permissions:<address>
      `0x4b80742d0000000082ac0000${address.replace(/^0x/, '')}`,

    parseValue: (
      hexValue: string, // bytes32
    ) => {
      const value = ethers.BigNumber.from(hexValue);

      const decodedValue = Object.keys(LSP6_KEY_MANAGER_PERMISSIONS).reduce(
        (acc, permissionKey) => {
          const permissionValue =
            LSP6_KEY_MANAGER_PERMISSIONS[
              permissionKey as keyof typeof LSP6_KEY_MANAGER_PERMISSIONS
            ];

          // check if permissionValue is set in bitmask
          acc[permissionKey as keyof typeof LSP6_KEY_MANAGER_PERMISSIONS] =
            value.and(permissionValue).eq(permissionValue);

          return acc;
        },
        {} as LSP6KeyManagerPermissions<boolean>,
      );

      return {
        value: hexValue.toString(),
        decodedValue,
      };
    },
  },

  LSP6KeyManagerAddressPermissionsAllowedAddresses: {
    buildKey: (address: Address) =>
      // AddressPermissions:AllowedAddresses:<address>
      `0x4b80742d00000000c6dd0000${address.replace(/^0x/, '')}`,

    parseValue: (
      hexValue: string, // bytes20(address)[]
    ) => {
      if (hexValue.toLowerCase() === '0x') return null;

      const decodedValue = ethers.utils.defaultAbiCoder.decode(
        ['address[]'],
        hexValue,
      );

      return {
        value: hexValue.toString(),
        decodedValue,
      };
    },
  },

  LSP6KeyManagerAddressPermissionsAllowedFunctions: {
    buildKey: (address: Address) =>
      // AddressPermissions:AllowedFunctions:<address>
      `0x4b80742d000000008efe0000${address.replace(/^0x/, '')}`,

    parseValue: (
      hexValue: string, // bytes4(function signature)[]
    ) => {
      if (hexValue.toLowerCase() === '0x') return null;

      const decodedValue = ethers.utils.defaultAbiCoder.decode(
        ['bytes4[]'],
        hexValue,
      );

      return {
        value: hexValue.toString(),
        decodedValue,
      };
    },
  },

  LSP6KeyManagerAddressPermissionsAllowedStandards: {
    buildKey: (address: Address) =>
      // AddressPermissions:AllowedStandards:<address>
      `0x4b80742d000000003efa0000${address.replace(/^0x/, '')}`,

    parseValue: (
      hexValue: string, // bytes4(ERC165 interface id)[]
    ) => {
      if (hexValue.toLowerCase() === '0x') return null;

      const decodedValue = ethers.utils.defaultAbiCoder.decode(
        ['bytes4[]'],
        hexValue,
      );

      return {
        value: hexValue.toString(),
        decodedValue,
      };
    },
  },
};
