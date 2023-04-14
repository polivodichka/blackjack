import { observable, action, makeObservable, override, computed } from 'mobx';
import { IPlayer, PlayerGameState, PlayerType, TBet } from '../types.ds';
import { Dealer } from './dealer';
import { game } from './game';
import { Card } from './card';

export class Player extends Dealer {
  @observable public betChips: TBet[];
  @observable public insuranceBet: number | null;
  @observable public parentAfterSplitPlayer: Player | null;
  @observable public parentPlayer: Player | null;
  @observable private _balance: number;

  public constructor(
    spotId: string,
    hand: Card[],
    roundIsEnded: boolean,
    betChips: TBet[],
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

  @computed public get betChipsTotal(): number {
    return this.betChips.length
      ? (this.betChips as number[]).reduce((bet1, bet2) => bet1 + bet2)
      : 0;
  }

  @computed public get balance(): number {
    if (this.playerType !== PlayerType.parent && this.parentPlayer) {
      return this.parentPlayer._balance;
    } else {
      return this._balance;
    }
  }

  @computed public get playerType(): PlayerType {
    if (this.parentPlayer) {
      return PlayerType.player;
    }
    if (this.parentAfterSplitPlayer) {
      return PlayerType.subplayer;
    }
    return PlayerType.parent;
  }

  @computed public get canHit(): boolean {
    return this.isActive;
  }

  @computed public get canSplit(): boolean {
    return (
      this.hand[0].rank === this.hand[1].rank &&
      !this.roundIsStarted &&
      !this.isSplitted
    );
  }

  @computed public get isSplitted(): boolean {
    return this.isSubplayer || (game.table?.spots[this.spotId].length ?? 1) > 1;
  }

  @computed public get isSubplayer(): boolean {
    return !!this.parentAfterSplitPlayer;
  }

  @computed public get canDouble(): boolean {
    return (
      this.isActive &&
      !this.roundIsStarted &&
      !(this.insuranceBet && this.insuranceBet > 0) &&
      !this.isSplitted
    );
  }

  @computed public get canInsurance(): boolean {
    return (
      (!this.isNaturalBJ &&
        !this.isBJ &&
        game.table?.needInsurance &&
        this.insuranceBet === null &&
        !this.roundIsStarted) ??
      false
    );
  }

  @computed private get state(): PlayerGameState {
    if (this.handTotal > 21) {
      return PlayerGameState.Bust;
    }
    if (this.handTotal === 21 && !this.roundIsStarted) {
      return PlayerGameState.NaturalBlackjack;
    }
    if (this.handTotal === 21) {
      return PlayerGameState.Blackjack;
    }
    if (this.handTotal < 21 && this.handTotal > 0) {
      return PlayerGameState.Active;
    }
    return PlayerGameState.Error;
  }

  @computed private get isNaturalBJ(): boolean {
    return this.state === PlayerGameState.NaturalBlackjack;
  }

  @computed private get isBJ(): boolean {
    return this.state === PlayerGameState.Blackjack;
  }

  @computed private get isBust(): boolean {
    return this.state === PlayerGameState.Bust;
  }

  @computed private get isActive(): boolean {
    return this.state === PlayerGameState.Active;
  }

  @action.bound public increaseBalance(amount: number): void {
    if (this.playerType !== PlayerType.parent && this.parentPlayer) {
      this.parentPlayer._balance += amount;
    } else {
      this._balance += amount;
    }
  }

  @action.bound public decreaseBalance(amount: number): void {
    if (this.playerType !== PlayerType.parent && this.parentPlayer) {
      this.parentPlayer._balance -= amount;
    } else {
      this._balance -= amount;
    }
  }

  @override public update(player: IPlayer): Player {
    const hand = player.hand
      ? player.hand.map((card) => new Card(card.suit, card.rank, card.value))
      : [];

    const parentAfterSplitPlayer = player.parentAfterSplitPlayer
      ? game.findPlayerById(player.parentAfterSplitPlayer?.id)
      : null;

    if (player.parentAfterSplitPlayer) {
      parentAfterSplitPlayer?.update(player.parentAfterSplitPlayer);
    }

    const parentPlayer = player.parentPlayer
      ? game.findPlayerById(player.parentPlayer?.id)
      : null;

    if (player.parentPlayer) {
      parentPlayer?.update(player.parentPlayer);
    }

    if (this.spotId !== player.spotId) {
      this.spotId = player.spotId;
    }

    if (this.roundIsEnded !== player.roundIsEnded) {
      this.roundIsEnded = player.roundIsEnded;
    }

    if (this.insuranceBet !== player.insuranceBet) {
      this.insuranceBet = player.insuranceBet;
    }

    this.hand = hand;
    this.betChips = player.betChips;
    this.parentAfterSplitPlayer = parentAfterSplitPlayer ?? null;
    this.parentPlayer = parentPlayer ?? null;
    this._balance = player._balance;

    return this;
  }
}
