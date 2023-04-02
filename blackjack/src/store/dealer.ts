import { observable, computed, action, makeObservable } from "mobx";
import { nanoid } from "nanoid";
import { Card } from "./card";
import game from "./table";

export class Dealer {
  id: string = nanoid();
  hand: Card[] = [];
  seatId: string;

  constructor(seatId: string) {
    this.seatId = seatId;
    makeObservable(this, {
      hand: observable,
      isTurn: computed,
      handTotal: computed,
      canHit: computed,
      reset: action,
    });
  }

  get isTurn(): boolean {
    return this.id === game.currentPlayer?.id;
  }

  get handTotal(): number {
    let total = this.hand.reduce((sum, card) => sum + card.value, 0);
    let aces = this.hand.filter((card) => card.rank === "ace");
    while (aces.length > 0 && total > 21) {
      total -= 10;
      aces.pop();
    }
    return total;
  }

  get canHit(): boolean {
    return this.handTotal < 17;
  }

  reset(): void {
    this.hand = [];
  }
}
