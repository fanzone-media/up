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

interface NumericTrait {
  value: number;
  trait_type: string;
  display_type?: 'number' | 'boost_percentage' | 'boost_number';
  max_value?: number;
}

interface DateTraits {
  value: number;
  display_type: 'date';
  trait_type?: string;
}

type Trait = NumericTrait | DateTraits;
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
  attributes: Trait[];
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
