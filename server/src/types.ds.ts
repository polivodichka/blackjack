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
  _name: string;
}
export interface ITable {
  id: string;
  allPlayers: IPlayer[];
  dealer: IDealer | null;
  currentPlayerIndex: null;
  deck: ICard[];
  currentBetBtnValue: number;
  roundIsStarted: boolean;
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

export enum SocketEmit {
  tableCreated = 'tableCreated',
  tableJoined = 'tableJoined',
  actionMade = 'actionMade',
  disconnectPlayer = 'disconnectPlayer',
  betUpdate = 'betUpdate',
  dealt = 'dealt',
  dealerMadeAction = 'dealerMadeAction',
  winnersCounted = 'winnersCounted',
  gameEnded = 'gameEnded',
  error = 'error',
  message = 'message',
  balanceToppedUp = 'balanceToppedUp',
  chatServerMessage = 'chatServerMessage',
}
export enum SocketOn {
  join_table = 'join_table',
  create_table = 'create_table',
  action = 'action',
  deal = 'deal',
  end_game = 'end_game',
  remove_bet = 'remove_bet',
  set_bet = 'set_bet',
  topup_balance = 'topup_balance',
  connect = 'connect',
  disconnect = 'disconnect',
  chat_send_message = 'chat_send_message',
}
export type TBet = 2 | 5 | 10 | 20 | 40 | 60 | 100;

export enum BaseMessages {
  SmthWentWrong = 'Something went wrong.',
  NoTable = 'No such table!',
  NoMoney = 'Insufficient funds!',
  PlayerLost = 'The player is lost, please re login.',
  ChatLost = 'The chat is lost, please re login.',
}


export interface IMessage {
  id: string;
  text: string;
  playerId: string;
  playerName: string;
  time: string;
}
