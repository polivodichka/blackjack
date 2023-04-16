import { makeObservable } from 'mobx';
import { observable } from 'mobx';
import { computed } from 'mobx';
import { override } from 'mobx';

import { PlayerGameState } from '../types.ds';
import { PlayerType } from '../types.ds';
import { IPlayer } from '../types.ds';
import { TBet } from '../types.ds';
import { Dealer } from './dealer';
import { Card } from './card';
import { game } from './game';

export class Player extends Dealer {
  @observable public name: string;
  @observable public betChips: TBet[];
  @observable public insuranceBet: number | null;
  @observable public parentAfterSplitPlayer: Player | null;
  @observable public parentPlayer: Player | null;
  @observable private _balance: number;

  public constructor(
    name: string,
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
    this.name = name;
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
    return this.playerType !== PlayerType.parent && this.parentPlayer
      ? this.parentPlayer._balance
      : this._balance;
  }

  @computed public get playerType(): PlayerType {
    return this.parentPlayer
      ? PlayerType.player
      : this.parentAfterSplitPlayer
        ? PlayerType.subplayer
        : PlayerType.parent;
  }

  @computed public get isTurn(): boolean {
    return (
      game.table?.currentPlayer?.id === this.id ||
      game.table?.currentPlayer?.parentPlayer?.id === this?.id
    );
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
      !this.isNaturalBJ &&
      !this.isBJ &&
      (game.table?.needInsurance ?? false) &&
      this.insuranceBet === null &&
      !this.roundIsStarted
    );
  }

  @computed private get state(): PlayerGameState {
    if (this.handTotal > 21) {
      return PlayerGameState.Bust;
    } else if (this.handTotal === 21 && !this.roundIsStarted) {
      return PlayerGameState.NaturalBlackjack;
    } else if (this.handTotal === 21) {
      return PlayerGameState.Blackjack;
    } else if (this.handTotal > 0) {
      return PlayerGameState.Active;
    } else {
      return PlayerGameState.Error;
    }
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

  @computed public get handIsEmpty(): boolean {
    const playingChildren = game.table?.playingPlayers.filter(
      (player) =>
        player.id === this.id ||
        player.parentAfterSplitPlayer?.id === this.id ||
        player.parentPlayer?.id === this.id
    );
    return playingChildren?.length === 0;
  }

  @computed public canBetAtThisSpot(spotId: string): boolean {
    const table = game.table;
    const players = table?.spots[spotId];
    if (players && players.length > 0) {
      return players.every(
        (player) =>
          player.id === this.id ||
          (player.parentPlayer && player.parentPlayer.id === this.id)
      );
    } else {
      return true;
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
    if (this.name !== player.name) {
      this.name = player.name;
    }

    this.hand = hand;
    this.betChips = player.betChips;
    this.parentAfterSplitPlayer = parentAfterSplitPlayer ?? null;
    this.parentPlayer = parentPlayer ?? null;
    this._balance = player._balance;

    return this;
  }
}
