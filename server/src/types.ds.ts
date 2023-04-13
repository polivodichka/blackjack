export enum SuitCard {
  hearts = "♥︎",
  diamonds = "♦",
  spades = "♠︎",
  clubs = "♣",
}

export type Suit = keyof typeof SuitCard;

export enum PlayerGameState {
  bust,
  blackjack,
  "natural blackjack",
  active,
  error,
}
export interface ICard {
  id: number;
  rank: number;
  suit: SuitCard;
}

export interface IParticipant extends IPlayer {
  bet: number[];
}

export enum PlayerType {
  parent,
  player,
  subplayer,
}
//export type PlayerType = "parent" | "player" | "subPlayer";

export interface IPlayer {
  id: string;
  spotId: string;
  hand: ICard[];
  roundIsEnded: boolean;
  betChips: number[];
  insuranceBet: number | null;
  parentAfterSplitPlayer: IPlayer | null;
  parentPlayer: IPlayer | null;
  _balance: number;
}

export interface ITable {
  id: string;
  allPlayers: IPlayer[];
  dealer: IPlayer | null;
  currentPlayerIndex: null;
  deck: [];
  currentBetBtnValue: 2;
}

export enum ActionType {
  hit,
  stand,
  double,
  insurance,
  skipInsurance,
  split,
}
