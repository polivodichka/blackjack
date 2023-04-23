import { Rank, SuitCard } from '../types.ds';

export class Card {

  public constructor(
    public suit: keyof typeof SuitCard,
    public rank: Rank,
    public value: number,
    public id: string
  ) {
    this.suit = suit;
    this.rank = rank;
    this.value = value;
    this.id = id;
  }
}
