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
export enum PlayerType {
  parent,
  player,
  subplayer,
}
export interface ICard {
  id: number;
  rank: string;
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
  betChips: number[];
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
  waitBets = "Waiting for all players to place their bets",
  readyToStart = "Ready to start",
  playing = "Playing process",
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
  tableCreated = "tableCreated",
  tableJoined = "tableJoined",
  actionMade = "actionMade",
  disconnectPlayer = "disconnectPlayer",
  betUpdate = "betUpdate",
  dealt = "dealt",
  dealerMadeAction = "dealerMadeAction",
  winnersCounted = "winnersCounted",
  gameEnded = "gameEnded",
}
export enum SocketEmit {
  join_table = "join_table",
  create_table = "create_table",
  action = "action",
  deal = "deal",
  end_game = "end_game",
  remove_bet = "remove_bet",
  set_bet = "set_bet",
}
