import { v4 } from "uuid";
import { PlayerGameState, Rank } from "../src/types.ds";
import { Card } from "./card";
import { socket } from "../src/server";

export class Dealer {
  readonly id: string = v4();
  spotId: string = v4();
  hand: Card[] = [];
  tableId: string;
  constructor(tableId: string) {
    this.tableId = tableId;
  }
  get roundIsStarted(): boolean {
    return this.hand.length !== 2;
  }
  get isTurn(): boolean {
    return this.id === socket.tables[this.tableId].currentPlayer?.id;
  }

  get handTotal(): number {
    let total = this.hand.reduce((sum, card) => sum + card.value, 0);
    let aces = this.hand.filter((card) => card.rank === Rank.ace);
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
    if (this.handTotal > 21) return PlayerGameState.Bust;
    if (this.handTotal === 21 && !this.roundIsStarted)
      return PlayerGameState.NaturalBlackjack;
    if (this.handTotal === 21) return PlayerGameState.Blackjack;
    if (this.handTotal < 21 && this.handTotal > 0)
      return PlayerGameState.Active;
    return PlayerGameState.Error;
  }

  get isNaturalBJ(): boolean {
    return this.state === PlayerGameState.NaturalBlackjack;
  }
  get isBJ(): boolean {
    return this.state === PlayerGameState.Blackjack;
  }
  get isBust(): boolean {
    return this.state === PlayerGameState.Bust;
  }
  get isActive(): boolean {
    return this.state === PlayerGameState.Active;
  }
}
