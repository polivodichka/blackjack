import { v4 } from "uuid";
import { PlayerGameState } from "../src/types.ds";
import { Card } from "./card";
import { socket } from "../src/server";

export class Dealer {
  readonly id: string;
  spotId: string;
  hand: Card[];
  roundIsEnded: boolean;
  tableId: string;

  constructor(
    tableId: string,
    spotId: string = v4(),
    id: string = v4(),
    hand?: Card[],
    roundIsEnded?: boolean
  ) {
    this.tableId = tableId;
    this.id = id;
    this.hand = hand ?? [];
    this.roundIsEnded = roundIsEnded ?? false;
    this.spotId = spotId;
  }
  get roundIsStarted(): boolean {
    return !(this.hand.length === 2);
  }

  get isTurn(): boolean {
    return this.id === socket.tables[this.tableId].currentPlayer?.id;
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

  get state(): PlayerGameState {
    if (this.handTotal > 21) return PlayerGameState.bust;
    if (this.handTotal === 21 && !this.roundIsStarted)
      return PlayerGameState["natural blackjack"];
    if (this.handTotal === 21) return PlayerGameState.blackjack;
    if (this.handTotal < 21 && this.handTotal > 0)
      return PlayerGameState.active;
    return PlayerGameState.error;
  }

  get isNaturalBJ(): boolean {
    return this.state === PlayerGameState["natural blackjack"];
  }
  get isBJ(): boolean {
    return this.state === PlayerGameState.blackjack;
  }
  get isBust(): boolean {
    return this.state === PlayerGameState.bust;
  }
  get isActive(): boolean {
    return this.state === PlayerGameState.active;
  }

  reset(): void {
    this.hand = [];
  }
}
