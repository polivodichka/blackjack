import { SuitCard } from "../src/types.ds";

export class Card {
  suit: keyof typeof SuitCard;
  rank: string;
  value: number;

  constructor(suit: keyof typeof SuitCard, rank: string, value: number) {
    this.suit = suit;
    this.rank = rank;
    this.value = value;
  }
}
