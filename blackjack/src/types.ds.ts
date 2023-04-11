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

export interface IPlayer {
  id: string;
  tableId: string;
  cards: ICard[];
}

export interface IParticipant extends IPlayer {
  bet: number[];
}

export interface ITable {
  participants: IParticipant[];
  dealer: IPlayer;
}

export interface IDealer {
  id: string;
  hand: ICard;
}

export enum PlayerType {
  parent,
  player,
  subplayer,
}
//export type PlayerType = "parent" | "player" | "subPlayer";
