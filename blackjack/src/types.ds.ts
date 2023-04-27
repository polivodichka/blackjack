export enum SuitCard {
  Hearts = '♥︎',
  Diamonds = '♦',
  Spades = '♠︎',
  Clubs = '♣',
}

export type Suit = keyof typeof SuitCard;

export enum Rank {
  Ace = 'ace',
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
  Ten = '10',
  Jack = 'jack',
  Queen = 'queen',
  King = 'king',
}

export enum PlayerGameState {
  Bust = 'Bust',
  Blackjack = 'Blackjack',
  NaturalBlackjack = 'Natural blackjack',
  Active = 'Active',
  Loose = 'Loose',
  Win = 'Win',
  Error = 'Error',
}

export enum PlayerType {
  Parent = 'Parent',
  Player = 'Player',
  Subplayer = 'Subplayer',
}

export interface ICard {
  id: string;
  rank: Rank;
  suit: Suit;
  value: number;
  isNew: boolean;
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

export enum GameStatus {
  WaitBets = 'Waiting for the players to place their bets',
  ReadyToStart = 'Ready to start',
  Playing = 'Playing process',
  WaitEndAndBets = 'Waiting for the players to finish the previous round and place their bets',
}

export enum ActionType {
  Hit = 'Hit',
  Stand = 'Stand',
  Double = 'Double',
  Insurance = 'Insurance',
  SkipInsurance = 'SkipInsurance',
  Split = 'Split',
}

export enum EndGameActions {
  Rebet = 'Rebet',
  NewBet = 'NewBet',
}

export enum SocketOn {
  TableCreated = 'tableCreated',
  TableJoined = 'tableJoined',
  ActionMade = 'actionMade',
  DisconnectPlayer = 'disconnectPlayer',
  BetUpdate = 'betUpdate',
  Dealt = 'dealt',
  DealerMadeAction = 'dealerMadeAction',
  WinnersCounted = 'winnersCounted',
  GameEnded = 'gameEnded',
  Error = 'error',
  Message = 'message',
  BalanceToppedUp = 'balanceToppedUp',
  ChatServerMessage = 'chatServerMessage',
}

export enum SocketEmit {
  JoinTable = 'join_table',
  CreateTable = 'create_table',
  Action = 'action',
  Deal = 'deal',
  EndGame = 'end_game',
  RemoveBet = 'remove_bet',
  SetBet = 'set_bet',
  TopupBalance = 'topup_balance',
  ChatSendMessage = 'chat_send_message',
}

export type TBet = 2 | 5 | 10 | 20 | 40 | 60 | 100;

export enum ModalTypes {
  CreateOrJoin = 'CreateOrJoin',
  Balance = 'Balance',
  GameEnd = 'GameEnd',
  Chat = 'Chat',
  Sounds = 'Sounds',
}

export interface IModal {
  type: ModalTypes;
  hide: boolean;
}

export interface IMessage {
  id: string;
  text: string[];
  playerId: string;
  playerName: string;
  time: string;
}

export interface IChat {
  messages: IMessage[];
}

export enum SoundType {
  Click = 'click',
  Chip = 'chip',
  Flip = 'flip',
  Balance = 'balance',
  Background = 'background',
  PlayerConnected = 'player-connsected',
  PlayerDisconnected = 'player-disconnsected',
  Message = 'message',
}

export enum CardholdersIds {
  Spot0 = 'spot-0Cardholder',
  Spot1 = 'spot-1Cardholder',
  Spot2 = 'spot-2Cardholder',
  Spot3 = 'spot-3Cardholder',
  Spot4 = 'spot-4Cardholder',
  Dealer = 'dealerCardholder',
}
