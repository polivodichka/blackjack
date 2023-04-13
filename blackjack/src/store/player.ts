import { observable, action, makeObservable, override, computed } from "mobx";
import { IPlayer, PlayerGameState, PlayerType } from "../types.ds";
import { Dealer } from "./dealer";
import game from "./game";
import { Card } from "./card";

export class Player extends Dealer {
  @observable betChips: number[];
  @observable insuranceBet: number | null;
  @observable parentAfterSplitPlayer: Player | null;
  @observable parentPlayer: Player | null;
  @observable private _balance: number;

  constructor(
    spotId: string,
    hand: Card[],
    roundIsEnded: boolean,
    betChips: number[],
    insuranceBet: number | null,
    parentAfterSplitPlayer: Player | null,
    parentPlayer: Player | null,
    _balance: number,
    id: string
  ) {
    super(spotId, hand, roundIsEnded, id);
    this.betChips = betChips;
    this.insuranceBet = insuranceBet;
    this.parentAfterSplitPlayer = parentAfterSplitPlayer;
    this.parentPlayer = parentPlayer;
    this._balance = _balance;
    makeObservable(this);
  }

  @computed get betChipsTotal(): number {
    return this.betChips.length
      ? this.betChips.reduce((bet1, bet2) => bet1 + bet2)
      : 0;
  }
  @computed get balance(): number {
    if (this.playerType !== PlayerType.parent && this.parentPlayer)
      return this.parentPlayer._balance;
    else return this._balance;
  }
  @computed get playerType(): PlayerType {
    if (this.parentPlayer) return PlayerType.player;
    if (this.parentAfterSplitPlayer) return PlayerType.subplayer;
    return PlayerType.parent;
  }
  @computed get canHit(): boolean {
    return this.isActive;
  }
  @computed get canSplit(): boolean {
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
  @computed get canDouble(): boolean {
    return (
      this.isActive &&
      !this.roundIsStarted &&
      !(this.insuranceBet && this.insuranceBet > 0) &&
      !this.isSplitted
    );
  }
  @computed get canInsurance(): boolean {
    return (
      (!this.isNaturalBJ &&
        !this.isBJ &&
        game.table?.needInsurance &&
        this.insuranceBet === null &&
        !this.roundIsStarted) ??
      false
    );
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
  @action.bound increaseBalance(amount: number) {
    if (this.playerType !== PlayerType.parent && this.parentPlayer)
      this.parentPlayer._balance += amount;
    else this._balance += amount;
  }
  @action.bound decreaseBalance(amount: number) {
    if (this.playerType !== PlayerType.parent && this.parentPlayer)
      this.parentPlayer._balance -= amount;
    else this._balance -= amount;
  }
  @action.bound setBalance(newBalance: number) {
    this._balance = newBalance;
  }
  @override update(player: IPlayer) {
    const hand = player.hand
      ? player.hand.map((card) => new Card(card.suit, card.rank, card.value))
      : [];

    const parentAfterSplitPlayer = player.parentAfterSplitPlayer
      ? game.findPlayerById(player.parentAfterSplitPlayer?.id)
      : null;
    parentAfterSplitPlayer &&
      parentAfterSplitPlayer.update(player.parentAfterSplitPlayer!);

    const parentPlayer = player.parentPlayer
      ? game.findPlayerById(player.parentPlayer?.id)
      : null;
    parentPlayer && parentPlayer.update(player.parentPlayer!);

    this.spotId !== player.spotId && (this.spotId = player.spotId);
    this.roundIsEnded !== player.roundIsEnded &&
      (this.roundIsEnded = player.roundIsEnded);
    this.insuranceBet !== player.insuranceBet &&
      (this.insuranceBet = player.insuranceBet);
    this.hand = hand;
    this.betChips = player.betChips;
    this.parentAfterSplitPlayer = parentAfterSplitPlayer ?? null;
    this.parentPlayer = parentPlayer ?? null;
    this.setBalance(player._balance);

    return this;
  }
}
