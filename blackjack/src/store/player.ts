import { observable, action, makeObservable, override, computed } from "mobx";
import { PlayerGameState } from "../types.ds";
import { Dealer } from "./dealer";
import game from "./table";

export class Player extends Dealer {
  currentBet: number[] = [];
  insuarence: number[] = [];

  constructor(seatId: string) {
    super(seatId);
    makeObservable(this, {
      currentBet: observable,
      insuarence: observable,
      state: computed,
      canSplit: computed,
      bet: action,
      betDeleteByIndex: action,
      split: action,
      canHit: override,
      reset: override,
    });
  }

  get canHit() {
    return this.handTotal < 21;
  }
  get canSplit() {
    return this.hand[0].rank === this.hand[1].rank;
  }
  get state(): PlayerGameState {
    if (this.handTotal > 21) return "loose";
    if (this.handTotal === 21) return "win";
    return "active";
  }

  split() {}

  bet(amount: number): void {
    this.currentBet.push(amount);
  }
  betDeleteByIndex(index: number): void {
    this.currentBet.splice(index, 1);
    if (this.currentBet.length < 1) game.playerRemove(this);
  }

  reset(): void {
    this.hand = [];
    this.currentBet = [];
  }
}
