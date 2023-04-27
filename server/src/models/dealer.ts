import { v4 } from 'uuid';

import { PlayerGameState } from '../types.ds';
import { User } from './abstractUser';
import { Rank } from '../types.ds';
import { Card } from './card';

export class Dealer extends User {
  public readonly id: string = v4();
  public spotId: string | null = v4();
  public hand: Card[] = [];

  public constructor(public tableId: string) {
    super(tableId);
  }
}
