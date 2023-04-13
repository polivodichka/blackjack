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
