import {
  observable,
  action,
  makeObservable,
  override,
  computed,
  reaction,
} from "mobx";
import { PlayerGameState } from "../types.ds";
import { Dealer } from "./dealer";
import gameTable from "./table";

export class Player extends Dealer {
  @observable betChips: number[] = [];
  @observable insuarence: number[] = [];
  @observable parentPlayer: Player | null = null;
  @observable roundNumber: number = 0;

  constructor(seatId: string) {
    super(seatId);
    makeObservable(this);
  }

  @override get canHit() {
    return this.handTotal < 21 && this.handTotal > 0;
  }

  @computed get canSplit() {
    return this.hand[0].rank === this.hand[1].rank && this.hand.length === 2;
  }

  @computed get canDouble() {
    return this.hand.length == 2 && this.handTotal < 21;
  }

  @computed get betChipsTotal() {
    return this.betChips.length
      ? this.betChips.reduce((bet1, bet2) => bet1 + bet2)
      : 0;
  }

  @computed get state(): PlayerGameState {
    if (this.handTotal > 21) return PlayerGameState.bust;
    if (this.handTotal === 21 && this.hand.length === 2)
      return PlayerGameState["natural blackjack"];
    if (this.handTotal === 21) return PlayerGameState.blackjack;
    return PlayerGameState.active;
  }

  @computed get isSubplayer(): boolean {
    return !!this.parentPlayer;
  }

  @action bet(amount: number): void {
    if (amount <= this.balance) {
      this.betChips.push(amount);
      this.balance -= amount;
    } else alert("Insufficient funds");
  }

  @action betDeleteByIndex(index: number): void {
    let confirmDel = true;
    if (this.betChips.length === 1) {
      confirmDel = window.confirm(
        "You will lose progress and leave the place. Are you sure?"
      );
    }
    if (confirmDel) {
      this.balance += this.betChips[index];
      this.betChips.splice(index, 1);
      if (this.betChips.length < 1) gameTable.playerRemove(this);
    }
  }

  @override reset(): void {
    if (this.betChipsTotal > this.balance) {
      this.betChips = [];
    } else this.balance -= this.betChipsTotal;
    this.hand = [];
    this.insuarence = [];

    //remove the subplayers that were after the split (mutate the players array)
    for (let i = 0; i < gameTable.players.length; i++) {
      if (
        gameTable.players[i].parentPlayer &&
        gameTable.players[i].parentPlayer?.id === this.id
      ) {
        gameTable.players.splice(i, 1);
        i--;
      }
    }
    gameTable.dealer = null;
    this.roundIsEnded = false;
  }
}
