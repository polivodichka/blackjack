import { observable, computed, action, makeObservable } from "mobx";
import { nanoid } from "nanoid";
import { PlayerGameState } from "../types.ds";
import { Card } from "./card";
import gameTable from "./table";

export class Dealer {
  readonly id: string = nanoid();
  spotId: string;
  @observable hand: Card[] = [];
  @observable balance: number = 100;
  @observable roundIsEnded: boolean = false;

  constructor(spotId: string) {
    this.spotId = spotId;
    makeObservable(this);
  }
  @computed get roundIsStarted(): boolean {
    return !(this.hand.length === 2);
  }

  @computed get isTurn(): boolean {
    return this.id === gameTable.currentPlayer?.id;
  }

  @computed get handTotal(): number {
    let total = this.hand.reduce((sum, card) => sum + card.value, 0);
    let aces = this.hand.filter((card) => card.rank === "ace");
    while (aces.length > 0 && total > 21) {
      total -= 10;
      aces.pop();
    }
    return total;
  }

  @computed get canHit(): boolean {
    return this.handTotal < 17;
  }

  @computed get state(): PlayerGameState {
    if (this.handTotal > 21) return PlayerGameState.bust;
    if (this.handTotal === 21 && !this.roundIsStarted)
      return PlayerGameState["natural blackjack"];
    if (this.handTotal === 21) return PlayerGameState.blackjack;
    if (this.handTotal < 21 && this.handTotal > 0)
      return PlayerGameState.active;
    return PlayerGameState.error;
  }

  @computed get isNaturalBJ(): boolean {
    return this.state === PlayerGameState["natural blackjack"];
  }
  @computed get isBJ(): boolean {
    return this.state === PlayerGameState.blackjack;
  }
  @computed get isBust(): boolean {
    return this.state === PlayerGameState.bust;
  }
  @computed get isActive(): boolean {
    return this.state === PlayerGameState.active;
  }

  @action.bound reset(): void {
    this.hand = [];
  }
}
