import { v4 } from 'uuid';
import { Rank, SuitCard } from '../types.ds';

export class Card {
  public id: string

  public constructor(
    public suit: keyof typeof SuitCard,
    public rank: Rank,
    public value: number,
  ) {
    this.suit = suit;
    this.rank = rank;
    this.value = value;
    this.id = v4();
  }
}
