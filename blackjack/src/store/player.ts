import { observable, action, makeObservable, override, computed } from "mobx";
import { PlayerGameState } from "../types.ds";
import { Dealer } from "./dealer";
import gameTable from "./table";

export class Player extends Dealer {
  currentBet: number[] = [];
  insuarence: number[] = [];
  parentPlayer: Player | null = null;

  constructor(seatId: string) {
    super(seatId);
    makeObservable(this, {
      currentBet: observable,
      insuarence: observable,
      parentPlayer: observable,
      state: computed,
      canSplit: computed,
      isSubplayer: computed,
      canDouble: computed,
      bet: action,
      betDeleteByIndex: action,
      canHit: override,
      reset: override,
    });
  }

  get canHit() {
    return this.handTotal < 21 && this.handTotal > 0;
  }
  get canSplit() {
    return this.hand[0].rank === this.hand[1].rank;
  }
  get canDouble() {
    //можем пока не походили
    return this.hand.length == 2;
  }

  //пока не поняла сюда ли это и как это обыграть
  get state(): PlayerGameState {
    if (this.handTotal > 21) return "loose";
    if (this.handTotal === 21) return "win";
    return "active";
  }
  get isSubplayer(): boolean {
    return !!this.parentPlayer;
  }

  bet(amount: number): void {
    this.currentBet.push(amount);
  }
  betDeleteByIndex(index: number): void {
    this.currentBet.splice(index, 1);
    if (this.currentBet.length < 1) gameTable.playerRemove(this);
  }

  reset(): void {
    this.hand = [];
    this.currentBet = [];
  }
}
