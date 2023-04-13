import { action, computed, makeObservable, observable } from "mobx";
import { nanoid } from "nanoid";
import { IDealer, PlayerGameState } from "../types.ds";
import { Card } from "./card";
import game from "./game";

export class Dealer {
  readonly id: string;
  spotId: string;
  @observable hand: Card[];
  @observable roundIsEnded: boolean;

  constructor(spotId: string, hand: Card[], roundIsEnded: boolean, id: string) {
    this.hand = hand;
    this.roundIsEnded = roundIsEnded;
    this.spotId = spotId;
    this.id = id;
    makeObservable(this);
  }
  @computed get roundIsStarted(): boolean {
    return !(this.hand.length === 2);
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

  @action.bound update(player: IDealer | null) {
    if (player) {
      const hand = player.hand
        ? player.hand.map((card) => new Card(card.suit, card.rank, card.value))
        : [];

      this.hand = hand;
      this.roundIsEnded = player.roundIsEnded;
    } else game.table?.dealer && (game.table.dealer = null);
    return this;
  }
}
