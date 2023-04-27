import { v4 } from 'uuid';

import { PlayerGameState } from '../types.ds';
import { Rank } from '../types.ds';
import { Card } from './card';

export abstract class User {
  public readonly id: string = v4();
  public spotId: string | null = v4();
  public hand: Card[] = [];

  public constructor(public tableId: string) {
    this.tableId = tableId;
  }

  public get roundIsStarted(): boolean {
    return this.hand.length > 2;
  }

  public get handTotal(): number {
    let total = this.hand.reduce((sum, card) => sum + card.value, 0);
    const aces = this.hand.filter((card) => card.rank === Rank.Ace);
    while (aces.length > 0 && total > 21) {
      total -= 10;
      aces.pop();
    }
    return total;
  }

  public get canHit(): boolean {
    return this.handTotal < 17;
  }

  public get state(): PlayerGameState {
    if (this.handTotal > 21) {
      return PlayerGameState.Bust;
    }
    if (this.handTotal === 21 && !this.roundIsStarted) {
      return PlayerGameState.NaturalBlackjack;
    }
    if (this.handTotal === 21) {
      return PlayerGameState.Blackjack;
    }
    if (this.handTotal < 21 && this.handTotal > 0) {
      return PlayerGameState.Active;
    }
    return PlayerGameState.Error;
  }

  public get isNaturalBJ(): boolean {
    return this.state === PlayerGameState.NaturalBlackjack;
  }

  public get isBJ(): boolean {
    return this.state === PlayerGameState.Blackjack;
  }

  public get isBust(): boolean {
    return this.state === PlayerGameState.Bust;
  }

  public get isActive(): boolean {
    return this.state === PlayerGameState.Active;
  }

  public get isError(): boolean {
    return this.state === PlayerGameState.Error;
  }
}
