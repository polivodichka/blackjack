import { Rank, SuitCard } from '../types.ds';

export class Card {
  public suit: keyof typeof SuitCard;
  public rank: Rank;
  public value: number;

  public constructor(suit: keyof typeof SuitCard, rank: Rank, value: number) {
    this.suit = suit;
    this.rank = rank;
    this.value = value;
  }
}
