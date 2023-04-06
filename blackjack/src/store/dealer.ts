import { observable, computed, action, makeObservable } from "mobx";
import { nanoid } from "nanoid";
import { Card } from "./card";
import gameTable from "./table";

export class Dealer {
  readonly id: string = nanoid();
  seatId: string;
  @observable hand: Card[] = [];
  @observable balance: number = 100;
  @observable roundIsEnded: boolean = false;

  constructor(seatId: string) {
    this.seatId = seatId;
    makeObservable(this);
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

  @action reset(): void {
    this.hand = [];
  }
}
