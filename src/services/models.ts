import { BigNumber } from 'ethers';
import { NetworkName } from '../boot/types';

export interface IOwnedAssets {
  assetAddress: string;
  balance: number;
  tokenIds: number[];
}
interface ILSP4Metadata {
  title: string;
  description: string;
  images: {
    height: number;
    width: number;
    hashFunction: 'keccak256(bytes)';
    hash: string;
    url: string;
  }[][];
  image_back?: {
    height: number;
    width: number;
    hashFunction: 'keccak256(bytes)';
    hash: string;
    url: string;
  }[][];
  assets: {
    fileType: string;
    hash: string;
    hashFunction: 'keccak256(bytes)';
    url: string;
  }[];
}

export interface StringTrait {
  trait_type: string;
  value: string;
}
export interface NumericTrait {
  display_type: 'number' | 'boost_percentage' | 'boost_number';
  trait_type: string;
  value: number;
  max_value?: number;
}
export interface DateTrait {
  display_type: 'date';
  trait_type: string;
  value: number;
}
export interface GenericProperty {
  value: string | number;
}

export type OpenseaAttribute =
  | StringTrait
  | NumericTrait
  | DateTrait
  | GenericProperty;
export interface ILSP8MetaData {
  // tokenId: number;
  // batch: string;
  // batchMax: string;
  // cardType: string;
  // edition: string;
  // editionCategory: string;
  // editionSet: string;
  // leagueLabel: string;
  // metacardIndex: string;
  // scoreMax: string;
  // scoreMin: string;
  // season: string;
  // teamLabel: string;
  // tier: string;
  // tierLabel: string;
  // zoneLabel: string;
  LSP4Metadata: ILSP4Metadata;
  // extra OpenSea fields
  image: string;
  external_url: string;
  animation_url: string;
  description: string;
  name: string;
  attributes: OpenseaAttribute[];
}

export type SupportedInterface = 'lsp8' | 'lsp4' | 'erc721' | 'lsp3';
export interface ICard {
  address: string;
  network: NetworkName;
  name: string;
  symbol: string;
  owner: string;
  totalSupply: number;
  supportedInterface: SupportedInterface;
  holders: string[];
  creators: string[];
  lsp8MetaData: {
    [key: string]: ILSP8MetaData;
  };
  markets: IMarket[];
  whiteListedTokens: IWhiteListedTokens[];
}

export interface IWhiteListedTokens {
  tokenAddress: string;
  symbol: string;
  decimals: number;
}

export interface IMarket {
  tokenId: string;
  minimumAmount: BigNumber;
  acceptedToken: string;
}

export interface IProfile {
  address: string;
  owner: string;
  isOwnerKeyManager: boolean;
  network: NetworkName;
  name: string;
  description: string;
  links: { title: string; url: string }[];
  profileImage: string;
  profileImageHash: string;
  backgroundImage: string;
  backgroundImageHash: string;
  ownedAssets: IOwnedAssets[];
  issuedAssets: string[];
  permissionSet: IPermissionSet[];
}

export interface ISetProfileData {
  backgroundImage: {
    width: string;
    height: string;
    hashFunction: 'keccak256(bytes)';
    url: File | string;
    hash: string;
  }[];
  profileImage: {
    width: string;
    height: string;
    hashFunction: 'keccak256(bytes)';
    url: File | string;
    hash: string;
  }[];
  name: string;
  description: string;
  links: {
    title: 'facebook' | 'twitter' | 'instagram';
    url: string;
  }[];
}

export interface IPermissionSet {
  permissions: {
    sign: string;
    transferValue: string;
    deploy: string;
    delegateCall: string;
    staticCall: string;
    call: string;
    setData: string;
    addPermissions: string;
    changePermissions: string;
    changeOwner: string;
  };
  address: string;
}
