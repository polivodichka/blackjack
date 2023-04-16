import { SuitCard } from '../types.ds';

export class Card {
  public suit: keyof typeof SuitCard;
  public rank: string;
  public value: number;

  public constructor(suit: keyof typeof SuitCard, rank: string, value: number) {
    this.suit = suit;
    this.rank = rank;
    this.value = value;
  }
}
