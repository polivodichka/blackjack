import { observable, computed, action, makeObservable } from "mobx";
import { nanoid } from "nanoid";
import { IDealer, PlayerGameState } from "../types.ds";
import { Card } from "./card";
import game from "./game";

export class Dealer {
  readonly id: string;
  spotId: string;
  @observable hand: Card[];
  @observable roundIsEnded: boolean;

  constructor(
    spotId: string,
    hand: Card[] = [],
    roundIsEnded: boolean = false,
    id: string = nanoid()
  ) {
    this.hand = hand;
    this.roundIsEnded = roundIsEnded;
    this.spotId = spotId;
    this.id = id;
    makeObservable(this);
  }
  @computed get roundIsStarted(): boolean {
    return !(this.hand.length === 2);
  }

  @computed get isTurn(): boolean {
    return this.id === game.table?.currentPlayer?.id;
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
