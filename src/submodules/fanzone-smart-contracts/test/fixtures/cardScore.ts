import Common from "./Common.json";
import CommunityFav_25 from "./Community-Fav(25).json";
import CommunityFav_50 from "./Community-Fav(50).json";
import Epic from "./Epic.json";
import Founders from "./Founders.json";
import Legendary from "./Legendary.json";
import PAULE_Raffle from "./PAULE-Raffle.json";
import Rare from "./Rare.json";
import Starter from "./Starter.json";

type CardScoreFixture = {
  tokenSupplyCap: number;
  scoreMin: number;
  scoreMax: number;
  scoreScale: number;
  scoreMap: { [key: string]: string };
};

export type CardScoreFixtures = {
  Common: CardScoreFixture;
  CommunityFav_25: CardScoreFixture;
  CommunityFav_50: CardScoreFixture;
  Epic: CardScoreFixture;
  Founders: CardScoreFixture;
  Legendary: CardScoreFixture;
  PAULE_Raffle: CardScoreFixture;
  Rare: CardScoreFixture;
  Starter: CardScoreFixture;
};

const cardScoreFixtures: CardScoreFixtures = {
  Common,
  CommunityFav_25,
  CommunityFav_50,
  Epic,
  Founders,
  Legendary,
  PAULE_Raffle,
  Rare,
  Starter,
};

export default cardScoreFixtures;
