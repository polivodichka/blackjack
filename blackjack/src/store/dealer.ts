import { Card } from './card';
import { IDealer } from '../types.ds';
import { Rank } from '../types.ds';

import { action } from 'mobx';
import { computed } from 'mobx';
import { game } from './game';
import { makeObservable } from 'mobx';
import { observable } from 'mobx';

export class Dealer {
  public readonly id: string;
  @observable public spotId: string;
  @observable public hand: Card[];
  @observable public roundIsEnded: boolean;

  public constructor(
    spotId: string,
    hand: Card[],
    roundIsEnded: boolean,
    id: string
  ) {
    this.hand = hand;
    this.roundIsEnded = roundIsEnded;
    this.spotId = spotId;
    this.id = id;
    makeObservable(this);
  }

  @computed public get roundIsStarted(): boolean {
    return this.hand.length !== 2;
  }

  @computed public get handTotal(): number {
    let total = this.hand.reduce((sum, card) => sum + card.value, 0);
    const aces = this.hand.filter((card) => card.rank === Rank.Ace);
    while (aces.length > 0 && total > 21) {
      total -= 10;
      aces.pop();
    }
    return total;
  }

  @action.bound public update(dealer: IDealer | null): Dealer {
    if (dealer) {
      const hand = dealer.hand
        ? dealer.hand.map((card) => new Card(card.suit, card.rank, card.value))
        : [];

      this.hand = hand;
      this.roundIsEnded = dealer.roundIsEnded;
    } else if (game.table?.dealer) {
      game.table.dealer = null;
    }

    return this;
  }
}
