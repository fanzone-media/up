export interface IBalanceOf {
  readonly address: string;
  readonly balance: number;
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
  assets: [];
}

export interface StringTrait {
  display_type: "string",
  trait_type: string;
  value: string;
}
export interface NumericTrait {
  display_type: "number" | "boost_percentage" | "boost_number"
  trait_type: string;
  value: number;
  max_value?: number;
}
export interface DateTrait {
  display_type: "date",
  trait_type: string,
  value: number
}
export interface GenericProperty {
  value: string | number
}

export type OpenseaAttribute = StringTrait | NumericTrait | DateTrait | GenericProperty;
interface ILSP8MetaData {
  batch: string;
  batchMax: string;
  cardType: string;
  edition: string;
  editionCategory: string;
  editionSet: string;
  leagueLabel: string;
  metacardIndex: string;
  scoreMax: string;
  scoreMin: string;
  season: string;
  teamLabel: string;
  tier: string;
  tierLabel: string;
  zoneLabel: string;
  lsp4MetaData: ILSP4Metadata;
  // extra OpenSea fields
  image: string;
  external_url: string;
  description: string;
  name: string;
  attributes: OpenseaAttribute[];
}

export interface ICard {
  address: string;
  network: string;
  name: string;
  symbol: string;
  owner: string;
  totalSupply: number;
  holders: string[];
  creators: string[];
  ls8MetaData: ILSP8MetaData;
}

export interface IProfile {
  address: string;
  owner: string;
  network: string;
  name: string;
  description: string;
  links: { title: string; url: string }[];
  profileImage: string;
  backgroundImage: string;
  ownedAssets: string[];
  issuedAssets: string[];
}
