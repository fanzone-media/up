export interface ILSP4Card {
  readonly address: string;
  readonly name: string;
  readonly symbol: string;
  readonly totalSupply: number;
  readonly card: {
    readonly assets: [];
    readonly batch: string;
    readonly batchMax: string;
    readonly card: {};
    readonly cardType: string;
    readonly card_tier: string;
    readonly card_tierLabel: string;
    readonly description: string;
    readonly edition: string;
    readonly editionCategory: string;
    readonly editionSet: string;
    readonly images: {
      readonly hash: string;
      readonly hashFunction: string;
      readonly height: number;
      readonly url: string;
      readonly width: number;
    }[];
    readonly leagueLabel: string;
    readonly links: [];
    readonly metaCardIndex: string;
    readonly scoreMax: string;
    readonly scoreMin: string;
    readonly season: string;
    readonly teamLabel: string;
    readonly zoneLabel: string;
  };
  readonly owner: string;
  readonly holders: string[];
  readonly image: string;
}

export interface IBalanceOf {
  readonly address: string;
  readonly balance: number;
}

export interface ILSP3Profile {
  readonly address: string;
  readonly name: string;
  readonly description: string;
  readonly balance: number;
  readonly profileImage: string;
  readonly backgroundImage: string;
  readonly links: { title: string; url: string }[];
}

export interface IUserAccount {
  readonly accountAddr: string;
  readonly coins: number;
  readonly profile: ILSP3Profile;
}
interface ILSP4Metadata {
  title: string;
  description: string;
  images: {
      height: number;
      width: number;
      hashFunction: "keccak256(bytes)";
      hash: string;
      url: string;
  }[][];
  assets: []
}

interface NumericTrait {
  value: number;
  trait_type: string;
  display_type?: "number" | "boost_percentage" | "boost_number";
  max_value?: number
}

interface DateTraits {
  value: number
  display_type: "date";
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
  lsp4MetaData: ILSP4Metadata
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
  network: string;
  name: string;
  description: string;
  links: { title: string; url: string }[];
  profileImage: string;
  backgroundImage: string;
  ownedAssets: string[];
  issuedAssets: string[];
}
