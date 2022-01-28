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
