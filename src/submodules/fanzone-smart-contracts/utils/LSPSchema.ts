import sizeOf from "image-size";
import { ethers } from "ethers";
import { utils as erc725Utils } from "erc725.js/lib/lib/utils";

import { catJsonFile, addJSON } from "./ipfs";
import { isLocalTestnet } from "./network";
import { LSP6_KEY_MANAGER_PERMISSIONS } from "./keyManager";

import type { Erc725Schema } from "erc725.js";
import type { Address } from "./types";
import type { LSP6KeyManagerPermissions } from "./keyManager";
import type { ERC725Y } from "../typechain";

const fakeIpfsCid = "fake";

//
// --- schema definitions
//

const LSP3UniversalProfileMetadataSchemaList: Array<Erc725Schema> = [
  {
    name: "SupportedStandards:LSP3UniversalProfile",
    key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6",
    keyType: "Mapping",
    valueContent: "0xabe425d6",
    valueType: "bytes",
  },
  {
    name: "LSP3Profile",
    key: "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
    keyType: "Singleton",
    valueContent: "JSONURL",
    valueType: "bytes",
  },
  {
    name: "LSP1UniversalReceiverDelegate",
    key: "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47",
    keyType: "Singleton",
    valueContent: "Address",
    valueType: "address",
  },
  {
    name: "LSP3IssuedAssets[]",
    key: "0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0",
    keyType: "Array",
    valueContent: "Number",
    valueType: "uint256",
    elementValueContent: "Address",
    elementValueType: "address",
  },
];

const LSP4DigitalAssetMetadataSchemaList: Array<Erc725Schema> = [
  {
    name: "SupportedStandards:LSP4DigitalAsset",
    key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000a4d96624",
    keyType: "Mapping",
    valueContent: "0xa4d96624",
    valueType: "bytes",
  },
  {
    name: "LSP4Metadata",
    key: "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e",
    keyType: "Singleton",
    valueContent: "JSONURL",
    valueType: "bytes",
  },
  {
    name: "LSP4Creators[]",
    key: "0x114bd03b3a46d48759680d81ebb2b414fda7d030a7105a851867accf1c2352e7",
    keyType: "Array",
    valueContent: "Number",
    valueType: "uint256",
    elementValueContent: "Address",
    elementValueType: "address",
  },
  {
    name: "LSP4TokenName",
    key: "0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1",
    keyType: "Singleton",
    valueContent: "String",
    valueType: "string",
  },
  {
    name: "LSP4TokenSymbol",
    key: "0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756",
    keyType: "Singleton",
    valueContent: "String",
    valueType: "string",
  },
];

const LSP5ReceivedAssetsSchemaList: Array<Erc725Schema> = [
  {
    name: "LSP5ReceivedAssets[]",
    key: "0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b",
    keyType: "Array",
    valueContent: "Number",
    valueType: "uint256",
    elementValueContent: "Address",
    elementValueType: "address",
  },
];

const LSP6KeyManagerSchemaList: Array<Erc725Schema> = [
  {
    name: "AddressPermissions[]",
    key: "0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3",
    keyType: "Array",
    valueContent: "Number",
    valueType: "uint256",
    elementValueContent: "Address",
    elementValueType: "address",
  },
];

const LSPSchemas: Array<Erc725Schema> = [
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
  const schema = erc725Utils.getSchemaElement(LSPSchemas, schemaName);
  return schema.key;
};

export const decodeWithSchema = (schemaName: string, data: any): any => {
  const schema = erc725Utils.getSchemaElement(LSPSchemas, schemaName);
  return erc725Utils.decodeKey(schema, data);
};

export const encodeWithSchema = (schemaName: string, data: any): any => {
  const schema = erc725Utils.getSchemaElement(LSPSchemas, schemaName);
  return erc725Utils.encodeKey(schema, data);
};

//
// --- schema builders
//

export type LSPImage = {
  height: number;
  width: number;
  hashFunction: "keccak256(bytes)";
  hash: string;
  url: string;
};

export type LSPAsset = {
  hashFunction: "keccak256(bytes)";
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
  cid: string
): Promise<LSPImage> => {
  const { width = 0, height = 0 } = sizeOf(image);
  const hash = ethers.utils.keccak256(image);

  return {
    height,
    width,
    hashFunction: "keccak256(bytes)",
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
  name: "LSP3Profile name",
  description: "LSP3Profile description",
  links: [],
  tags: [],
  profileImage: [
    {
      height: 300,
      width: 300,
      hashFunction: "keccak256(bytes)",
      hash: "0x3357a1e8fa627f80a107418529c59678a3b431257a7fb06237e5a3d9e05aadd7",
      url: "ipfs://QmdYPbSr4DPpi7kLnYPpSqbYg9xDbABWw71QcWLMC7ZZ7o",
    },
  ],
  backgroundImage: [
    {
      height: 300,
      width: 300,
      hashFunction: "keccak256(bytes)",
      hash: "0x25b0c021dcb3779a029d4633863c8933311343c823e6e35a592493ab1344dfc1",
      url: "ipfs://QmTRpjADREyRinr4H9MYx6PbykLVrwKutEetznejFYLUD6",
    },
  ],
};

export const buildLSP3Profile = async (
  networkName: string,
  {
    name,
    description,
    profileImage = defaultLSP3Profile.profileImage,
    backgroundImage = defaultLSP3Profile.backgroundImage,
    links = defaultLSP3Profile.links,
    tags = defaultLSP3Profile.tags,
  }: LSP3ProfileData
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
  if (isLocalTestnet(networkName)) {
    cid = fakeIpfsCid;
  } else {
    cid = await addJSON(schemaJson);
  }
  const jsonHash = ethers.utils.keccak256(Buffer.from(schemaJson));

  return encodeWithSchema("LSP3Profile", {
    hashFunction: "keccak256(utf8)",
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
  description: "LSP4Metadata description",
  links: [],
  images: [
    [
      {
        width: 300,
        height: 300,
        hashFunction: "keccak256(bytes)",
        hash: "0x3357a1e8fa627f80a107418529c59678a3b431257a7fb06237e5a3d9e05aadd7",
        url: "ipfs://QmdYPbSr4DPpi7kLnYPpSqbYg9xDbABWw71QcWLMC7ZZ7o",
      },
    ],
  ],
  assets: [],
};

export const buildLSP4Metadata = async (
  networkName: string,
  {
    description,
    links = defaultLSP4Metadata.links,
    images = defaultLSP4Metadata.images,
    assets = defaultLSP4Metadata.assets,
  }: LSP4MetadataData,
  extraData: { [key: string]: string } = {}
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
  if (isLocalTestnet(networkName)) {
    cid = fakeIpfsCid;
  } else {
    cid = await addJSON(schemaJson);
  }
  const jsonHash = ethers.utils.keccak256(Buffer.from(schemaJson));

  return encodeWithSchema("LSP4Metadata", {
    hashFunction: "keccak256(utf8)",
    hash: jsonHash,
    url: `ipfs://${cid}`,
  });
};

//
// --- schema updaters
//

export const updateAddToArrayMetadata = async (
  schemaName: string,
  contract: ERC725Y,
  listEntries: Array<string>
) => {
  const schema = erc725Utils.getSchemaElement(LSPSchemas, schemaName);
  if (schema.keyType.toLowerCase() !== "array") {
    throw new Error(`schema ${schema.name} is not encoding an array`);
  }

  const [currentIssuedAssetsLength] = await contract.getData([
    getSchemaKey(schemaName),
  ]);
  const nextIndex =
    currentIssuedAssetsLength === "0x"
      ? 0
      : ethers.BigNumber.from(currentIssuedAssetsLength).toNumber();

  const encodedData = {
    keys: [],
    values: [],
  } as { keys: Array<string>; values: Array<string> };

  // this is the encoding for the array, value is new array length
  encodedData.keys.push(schema.key);
  encodedData.values.push(
    erc725Utils.encodeKeyValue(schema, String(nextIndex + listEntries.length))
  );

  listEntries.forEach((listEntry, listEntryIndex) => {
    // this is the encoding for the array element at the derived index
    const indexSchema = erc725Utils.transposeArraySchema(
      schema,
      nextIndex + listEntryIndex
    );
    encodedData.keys.push(indexSchema.key);
    encodedData.values.push(erc725Utils.encodeKeyValue(indexSchema, listEntry));
  });

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
  x: any
): x is FetchDataForSchemaResultList => {
  if (x && x.listEntries) {
    return true;
  } else {
    return false;
  }
};

export const fetchDataForSchema = async (
  schema: Erc725Schema,
  contract: ERC725Y,
  fetchedSchemaValue: string
): Promise<FetchDataForSchemaResult | FetchDataForSchemaResultList> => {
  if (schema.keyType.toLowerCase() === "array") {
    let listEntries: Array<FetchDataForSchemaDecodedEntry> = [];

    if (fetchedSchemaValue !== "0x") {
      const arrayLength = ethers.BigNumber.from(fetchedSchemaValue).toNumber();

      const indexKeys = new Array(arrayLength)
        .fill(null)
        .map((_value, index) => erc725Utils.encodeArrayKey(schema.key, index));

      const indexValues = await contract.getData(indexKeys);

      listEntries = indexKeys.map((indexKey, index) => {
        const indexValue = indexValues[index];
        const indexSchema = erc725Utils.transposeArraySchema(schema, index);
        const decodedValue = erc725Utils.decodeKey(indexSchema, indexValue);

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
    const decodedValue = erc725Utils.decodeKey(schema, fetchedSchemaValue);

    let ipfsData: null | object = null;
    if (decodedValue?.url?.indexOf("ipfs://") === 0) {
      const cid = decodedValue.url.replace("ipfs://", "");
      if (cid !== fakeIpfsCid) {
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
  schemaList: Erc725Schema[]
) => {
  const schemaKeys = schemaList.map((schema) => schema.key);
  const schemaValues = await contract.getData(schemaKeys);

  return Promise.all(
    schemaList.map((schema, index) =>
      fetchDataForSchema(schema, contract, schemaValues[index])
    )
  );
};

export const fetchLSP3Data = async (contract: ERC725Y) => {
  return fetchDataForSchemaList(
    contract,
    LSP3UniversalProfileMetadataSchemaList
  );
};

export const fetchLSP4Data = async (contract: ERC725Y) => {
  return fetchDataForSchemaList(contract, LSP4DigitalAssetMetadataSchemaList);
};

export const fetchLSP5Data = async (contract: ERC725Y) => {
  const metadata = await fetchDataForSchemaList(
    contract,
    LSP5ReceivedAssetsSchemaList
  );
  const receivedAssets = metadata.find(
    (x) => x.schemaName === "LSP5ReceivedAssets[]"
  );

  if (isFetchDataForSchemaResultList(receivedAssets)) {
    await Promise.all(
      receivedAssets.listEntries.map(async (receivedAsset) => {
        const [receivedAssetMapEntry] = await contract.getData([
          LSPMappings.LSP5ReceivedAssetsMap.buildKey(
            receivedAsset.decodedValue
          ),
        ]);

        // mutating the result to include parsed map entries
        (receivedAsset as any).mapEntries = {
          receivedAsset: LSPMappings.LSP5ReceivedAssetsMap.parseValue(
            receivedAssetMapEntry
          ),
        };
      })
    );
  }

  return metadata;
};

export const fetchLSP6Data = async (contract: ERC725Y) => {
  const metadata = await fetchDataForSchemaList(
    contract,
    LSP6KeyManagerSchemaList
  );
  const addressPermissions = metadata.find(
    (x) => x.schemaName === "AddressPermissions[]"
  );

  if (isFetchDataForSchemaResultList(addressPermissions)) {
    await Promise.all(
      addressPermissions.listEntries.map(async (addressWithPermission) => {
        const [
          permissions,
          allowedAddresses,
          allowedFunctions,
          allowedStandards,
        ] = await contract.getData([
          LSPMappings.LSP6KeyManagerAddressPermissions.buildKey(
            addressWithPermission.decodedValue
          ),
          LSPMappings.LSP6KeyManagerAddressPermissionsAllowedAddresses.buildKey(
            addressWithPermission.decodedValue
          ),
          LSPMappings.LSP6KeyManagerAddressPermissionsAllowedFunctions.buildKey(
            addressWithPermission.decodedValue
          ),
          LSPMappings.LSP6KeyManagerAddressPermissionsAllowedStandards.buildKey(
            addressWithPermission.decodedValue
          ),
        ]);

        // mutating the result to include parsed map entries
        (addressWithPermission as any).mapEntries = {
          permissions:
            LSPMappings.LSP6KeyManagerAddressPermissions.parseValue(
              permissions
            ),
          allowedAddresses:
            LSPMappings.LSP6KeyManagerAddressPermissionsAllowedAddresses.parseValue(
              allowedAddresses
            ),
          allowedFunctions:
            LSPMappings.LSP6KeyManagerAddressPermissionsAllowedFunctions.parseValue(
              allowedFunctions
            ),
          allowedStandards:
            LSPMappings.LSP6KeyManagerAddressPermissionsAllowedStandards.parseValue(
              allowedStandards
            ),
        };
      })
    );
  }

  return metadata;
};

//
// --- LSP Mapping
//

export enum ERC165InterfaceIds {
  LSP7 = "0xe33f65c3",
  LSP8 = "0x49399145",
}

export const LSPMappings = {
  LSP5ReceivedAssetsMap: {
    buildKey: (address: Address) =>
      // LSP5ReceivedAssetsMap:<address>
      `0x812c4334633eb81600000000${address.replace(/^0x/, "")}`,

    parseValue: (
      hexValue: string // bytes8(index) + bytes4(ERC165 interface id)
    ) => {
      const value = hexValue.replace(/^0x/, "");

      const index = parseInt(value.slice(0, 16), 10);
      const interfaceId = `0x${value.slice(16, 20)}`;

      const tokenType =
        interfaceId === ERC165InterfaceIds.LSP7 ? "LSP7" : "LSP8";

      return {
        schemaName: "LSP5ReceivedAssetsMap:<address>",
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
      `0x4b80742d0000000082ac0000${address.replace(/^0x/, "")}`,

    parseValue: (
      hexValue: string // bytes32
    ) => {
      const value = ethers.BigNumber.from(hexValue);

      return Object.keys(LSP6_KEY_MANAGER_PERMISSIONS).reduce(
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
        {} as LSP6KeyManagerPermissions<boolean>
      );
    },
  },

  LSP6KeyManagerAddressPermissionsAllowedAddresses: {
    buildKey: (address: Address) =>
      // AddressPermissions:AllowedAddresses:<address>
      `0x4b80742d00000000c6dd0000${address.replace(/^0x/, "")}`,

    parseValue: (
      hexValue: string // bytes20(address)[]
    ) => {
      if (hexValue == "0x") return null;

      return ethers.utils.defaultAbiCoder.decode(["address[]"], hexValue);
    },
  },

  LSP6KeyManagerAddressPermissionsAllowedFunctions: {
    buildKey: (address: Address) =>
      // AddressPermissions:AllowedFunctions:<address>
      `0x4b80742d000000008efe0000${address.replace(/^0x/, "")}`,

    parseValue: (
      hexValue: string // bytes4(function signature)[]
    ) => {
      if (hexValue == "0x") return null;

      return ethers.utils.defaultAbiCoder.decode(["bytes4[]"], hexValue);
    },
  },

  LSP6KeyManagerAddressPermissionsAllowedStandards: {
    buildKey: (address: Address) =>
      // AddressPermissions:AllowedStandards:<address>
      `0x4b80742d000000003efa0000${address.replace(/^0x/, "")}`,

    parseValue: (
      hexValue: string // bytes4(ERC165 interface id)[]
    ) => {
      if (hexValue == "0x") return null;

      return ethers.utils.defaultAbiCoder.decode(["bytes4[]"], hexValue);
    },
  },
};
