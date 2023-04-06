import { observable, action, makeObservable, override, computed } from "mobx";
import { PlayerGameState } from "../types.ds";
import { Dealer } from "./dealer";
import gameTable from "./table";

export class Player extends Dealer {
  @observable betChips: number[] = [];
  @observable insuranceBet: number | null = null;
  @observable parentPlayer: Player | null = null;

  constructor(spotId: string) {
    super(spotId);
    makeObservable(this);
  }

  @override get canHit() {
    return this.isActive;
  }

  @computed get canSplit() {
    return (
      this.hand[0].rank === this.hand[1].rank &&
      !this.roundIsStarted &&
      !this.isSplitted
    );
  }

  @computed get isSplitted(): boolean {
    return this.isSubplayer || gameTable.spots[this.spotId].length > 1;
  }

  @computed get isSubplayer(): boolean {
    return !!this.parentPlayer;
  }

  @computed get canDouble() {
    return (
      this.isActive &&
      !this.roundIsStarted &&
      !(this.insuranceBet && this.insuranceBet > 0) &&
      !this.isSplitted
    );
  }

  @computed get canInsurance() {
    return (
      !this.isNaturalBJ &&
      gameTable.needInsurance &&
      this.insuranceBet === null &&
      !this.roundIsStarted
    );
  }

  @computed get betChipsTotal() {
    return this.betChips.length
      ? this.betChips.reduce((bet1, bet2) => bet1 + bet2)
      : 0;
  }

  @action.bound bet(amount: number): void {
    if (amount <= this.balance) {
      this.betChips.push(amount);
      this.balance -= amount;
    } else alert("Insufficient funds");
  }
  @action.bound insurance(amount = this.betChipsTotal / 2): void {
    if (amount <= (this.parentPlayer?.balance ?? this.balance)) {
      this.insuranceBet = amount;
      this.parentPlayer
        ? (this.parentPlayer.balance -= amount)
        : (this.balance -= amount);
    } else alert("Insufficient funds");
  }

  @action.bound betDeleteByIndex(index: number): void {
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
  
  @override get state(): PlayerGameState {
    if (this.handTotal > 21) return PlayerGameState.bust;
    if (this.handTotal === 21 && !this.roundIsStarted && !this.isSplitted)
      return PlayerGameState["natural blackjack"];
    if (this.handTotal === 21) return PlayerGameState.blackjack;
    if (this.handTotal < 21 && this.handTotal > 0)
      return PlayerGameState.active;
    return PlayerGameState.error;
  }

  @override reset(): void {
    if (this.betChipsTotal > this.balance) {
      this.betChips = [];
    } else this.balance -= this.betChipsTotal;
    this.hand = [];
    this.insuranceBet = 0;

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
