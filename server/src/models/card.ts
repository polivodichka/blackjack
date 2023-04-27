import { v4 } from 'uuid';

import { Rank, SuitCard } from '../types.ds';

export class Card {
  private id: string;

  public constructor(
    public suit: keyof typeof SuitCard,
    public rank: Rank,
    public value: number,
    public isNew: boolean = true
  ) {
    this.id = v4();
  }
}
