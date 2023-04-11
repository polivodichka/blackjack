import { observable, action, makeObservable, override, computed } from "mobx";
import { PlayerGameState, PlayerType } from "../types.ds";
import { Dealer } from "./dealer";
import game from "./game";

export class Player extends Dealer {
  @observable betChips: number[] = [];
  @observable insuranceBet: number | null = null;
  @observable parentAfterSplitPlayer: Player | null = null;
  @observable parentPlayer: Player | null = null;
  @observable private _balance: number = 100;

  constructor(spotId?: string) {
    super(spotId ?? "");
    makeObservable(this);
  }

  @computed get playerType(): PlayerType {
    if (this.parentPlayer) return PlayerType.player;
    if (this.parentAfterSplitPlayer) return PlayerType.subplayer;
    return PlayerType.parent;
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
    return this.isSubplayer || (game.table?.spots[this.spotId].length ?? 1) > 1;
  }

  @computed get isSubplayer(): boolean {
    return !!this.parentAfterSplitPlayer;
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
      game.table?.needInsurance &&
      this.insuranceBet === null &&
      !this.roundIsStarted
    );
  }

  @computed get betChipsTotal() {
    return this.betChips.length
      ? this.betChips.reduce((bet1, bet2) => bet1 + bet2)
      : 0;
  }
  @computed get balance(): number {
    console.log(this.playerType !== PlayerType.parent && this.parentPlayer);
    if (this.playerType !== PlayerType.parent && this.parentPlayer)
      return this.parentPlayer._balance;
    else return this._balance;
  }
  @action increaseBalance(amount: number) {
    if (this.playerType !== PlayerType.parent && this.parentPlayer)
      this.parentPlayer._balance += amount;
    else this._balance += amount;
  }
  @action decreaseBalance(amount: number) {
    if (this.playerType !== PlayerType.parent && this.parentPlayer)
      this.parentPlayer._balance -= amount;
    else this._balance -= amount;
  }
  @action.bound bet(amount: number): void {
    if (amount <= this.balance) {
      this.betChips.push(amount);
      this.decreaseBalance(amount);
    } else alert("Insufficient funds");
  }
  @action.bound insurance(amount = this.betChipsTotal / 2): void {
    if (amount <= this.balance) {
      this.insuranceBet = amount;
      this.decreaseBalance(amount);
    } else alert("Insufficient funds");
  }

  @action.bound betDeleteByIndex(index: number): void {
    this.increaseBalance(this.betChips[index]);
    this.betChips.splice(index, 1);
    if (this.betChips.length < 1) game.table?.playerRemove(this);
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
    } else this.decreaseBalance(this.betChipsTotal);
    this.hand = [];
    this.insuranceBet = 0;

    //remove the subplayers that were after the split (mutate the players array)
    for (let i = 0; i < (game.table?.players.length ?? 0); i++) {
      if (
        game.table?.players[i].parentAfterSplitPlayer &&
        game.table?.players[i].parentAfterSplitPlayer?.id === this.id
      ) {
        game.table?.players.splice(i, 1);
        i--;
      }
    }
    game.table && (game.table.dealer = null);
    this.parentPlayer!.roundIsEnded = true;
  }
}
