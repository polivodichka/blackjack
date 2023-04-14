export enum SuitCard {
  hearts = '♥︎',
  diamonds = '♦',
  spades = '♠︎',
  clubs = '♣',
}

export type Suit = keyof typeof SuitCard;
export enum Rank {
  ace = 'ace',
  _2 = '2',
  _3 = '3',
  _4 = '4',
  _5 = '5',
  _6 = '6',
  _7 = '7',
  _8 = '8',
  _9 = '9',
  _10 = '10',
  jack = 'jack',
  queen = 'queen',
  king = 'king',
}
export enum PlayerGameState {
  Bust,
  Blackjack,
  NaturalBlackjack,
  Active,
  Error,
}
export enum PlayerType {
  parent,
  player,
  subplayer,
}
export interface ICard {
  id: number;
  rank: Rank;
  suit: keyof typeof SuitCard;
  value: number;
}
export interface IDealer {
  id: string;
  spotId: string;
  hand: ICard[];
  roundIsEnded: boolean;
}
export interface IPlayer {
  id: string;
  spotId: string;
  hand: ICard[];
  roundIsEnded: boolean;
  betChips: TBet[];
  insuranceBet: number | null;
  parentAfterSplitPlayer: IPlayer | null;
  parentPlayer: IPlayer | null;
  _balance: number;
}
export interface ITable {
  id: string;
  allPlayers: IPlayer[];
  dealer: IDealer | null;
  currentPlayerIndex: null;
  deck: ICard[];
  currentBetBtnValue: number;
}

export enum GameStatus {
  waitBets = 'Waiting for all players to place their bets',
  readyToStart = 'Ready to start',
  playing = 'Playing process',
}

export enum ActionType {
  hit,
  stand,
  double,
  insurance,
  skipInsurance,
  split,
}

export enum EndGameActions {
  rebet,
  newBet,
}

export enum SocketOn {
  tableCreated = 'tableCreated',
  tableJoined = 'tableJoined',
  actionMade = 'actionMade',
  disconnectPlayer = 'disconnectPlayer',
  betUpdate = 'betUpdate',
  dealt = 'dealt',
  dealerMadeAction = 'dealerMadeAction',
  winnersCounted = 'winnersCounted',
  gameEnded = 'gameEnded',
}
export enum SocketEmit {
  join_table = 'join_table',
  create_table = 'create_table',
  action = 'action',
  deal = 'deal',
  end_game = 'end_game',
  remove_bet = 'remove_bet',
  set_bet = 'set_bet',
}
export type TBet = 2 | 5 | 10 | 20 | 40 | 60 | 100;

