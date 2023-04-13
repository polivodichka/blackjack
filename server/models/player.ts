import { PlayerGameState, PlayerType } from "../src/types.ds";
import { Dealer } from "./dealer";
import { Card } from "./card";
import { v4 } from "uuid";
import { socket } from "../src/server";

export class Player extends Dealer {
  betChips: number[];
  insuranceBet: number | null;
  parentAfterSplitPlayer: Player | null;
  parentPlayer: Player | null;
  private _balance: number;

  constructor(
    tableId: string,
    id: string = v4(),
    spotId?: string,
    hand?: Card[],
    roundIsEnded?: boolean,
    betChips?: number[],
    insuranceBet?: number | null,
    parentAfterSplitPlayer?: Player | null,
    parentPlayer?: Player | null,
    _balance?: number
  ) {
    super(tableId, spotId ?? "", id, hand, roundIsEnded);
    this.betChips = betChips ?? [];
    this.insuranceBet = insuranceBet ?? null;
    this.parentAfterSplitPlayer = parentAfterSplitPlayer ?? null;
    this.parentPlayer = parentPlayer ?? null;
    this._balance = _balance ?? 100;
  }

  get playerType(): PlayerType {
    if (this.parentPlayer) return PlayerType.player;
    if (this.parentAfterSplitPlayer) return PlayerType.subplayer;
    return PlayerType.parent;
  }
  get canHit() {
    return this.isActive;
  }

  get canSplit() {
    return (
      this.hand[0].rank === this.hand[1].rank &&
      !this.roundIsStarted &&
      !this.isSplitted
    );
  }

  get isSplitted(): boolean {
    return (
      this.isSubplayer ||
      (socket.tables[this.tableId].spots[this.spotId].length ?? 1) > 1
    );
  }

  get isSubplayer(): boolean {
    return !!this.parentAfterSplitPlayer;
  }

  get canDouble() {
    return (
      this.isActive &&
      !this.roundIsStarted &&
      !(this.insuranceBet && this.insuranceBet > 0) &&
      !this.isSplitted
    );
  }

  // get canInsurance() {
  //   return (
  //     !this.isNaturalBJ &&
  //     socket.tables[this.tableId].needInsurance &&
  //     this.insuranceBet === null &&
  //     !this.roundIsStarted
  //   );
  // }

  get betChipsTotal() {
    return this.betChips.length
      ? this.betChips.reduce((bet1, bet2) => bet1 + bet2)
      : 0;
  }
  get balance(): number {
    if (this.playerType !== PlayerType.parent && this.parentPlayer)
      return this.parentPlayer._balance;
    else return this._balance;
  }
  increaseBalance(amount: number) {
    if (this.playerType !== PlayerType.parent && this.parentPlayer)
      this.parentPlayer._balance += amount;
    else this._balance += amount;
  }
  decreaseBalance(amount: number) {
    if (this.playerType !== PlayerType.parent && this.parentPlayer)
      this.parentPlayer._balance -= amount;
    else this._balance -= amount;
  }
  bet(amount: number): void {
    if (amount <= this.balance) {
      this.betChips.push(amount);
      this.decreaseBalance(amount);
    }
  }
  insurance(amount = this.betChipsTotal / 2): void {
    console.log("insurance", this.id);
    if (amount <= this.balance) {
      this.insuranceBet = amount;
      this.decreaseBalance(amount);
    }
  }

  betDeleteByIndex(index: number): void {
    this.increaseBalance(this.betChips[index]);
    this.betChips.splice(index, 1);
    console.log(
      this.id,
      this.betChips,
      socket.tables[this.tableId].allPlayers.length
    );
    if (this.betChips.length < 1)
      socket.tables[this.tableId].playerRemove(this);
  }

  get state(): PlayerGameState {
    if (this.handTotal > 21) return PlayerGameState.bust;
    if (this.handTotal === 21 && !this.roundIsStarted && !this.isSplitted)
      return PlayerGameState["natural blackjack"];
    if (this.handTotal === 21) return PlayerGameState.blackjack;
    if (this.handTotal < 21 && this.handTotal > 0)
      return PlayerGameState.active;
    return PlayerGameState.error;
  }

  reset(): void {
    if (this.betChipsTotal > this.balance) {
      this.betChips = [];
    } else this.decreaseBalance(this.betChipsTotal);
    this.hand = [];
    this.insuranceBet = 0;

    //remove the subplayers that were after the split (mutate the players array)
    for (
      let i = 0;
      i < (socket.tables[this.tableId].players.length ?? 0);
      i++
    ) {
      if (
        socket.tables[this.tableId].players[i].parentAfterSplitPlayer &&
        socket.tables[this.tableId].players[i].parentAfterSplitPlayer?.id ===
          this.id
      ) {
        socket.tables[this.tableId].players.splice(i, 1);
        i--;
      }
    }
    socket.tables[this.tableId].dealer = null;
    this.parentPlayer!.roundIsEnded = true;
  }
}
