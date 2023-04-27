import { makeObservable } from 'mobx';
import { observable } from 'mobx';
import { computed } from 'mobx';
import { override } from 'mobx';
import { action } from 'mobx';

import { PlayerGameState } from '../types.ds';
import { PlayerType } from '../types.ds';
import { IPlayer } from '../types.ds';
import { TBet } from '../types.ds';
import { Dealer } from './dealer';
import { Card } from './card';
import { game } from './game';

export class Player extends Dealer {
  @observable public betChips: TBet[];
  @observable public insuranceBet: number | null;
  @observable public parentAfterSplitPlayer: Player | null;
  @observable public parentPlayer: Player | null;
  @observable private _balance: number;
  @observable private _name: string;

  public constructor(
    _name: string,
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
    this._name = _name;
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

  @computed public get betChipsTotalWithChildren(): number {
    if (game.table) {
      const players = game.table.allPlayers.filter(
        (player) =>
          player.id === this.id ||
          player.parentAfterSplitPlayer?.id === this.id ||
          player.parentPlayer?.id === this.id
      );
      const chips = players
        .map((player) => player.betChips)
        .reduce((a, b) => a.concat(b));
      return chips.length
        ? (chips as number[]).reduce((bet1, bet2) => bet1 + bet2)
        : 0;
    }
    return 0;
  }

  @computed public get balance(): number {
    return this.playerType !== PlayerType.Parent && this.parentPlayer
      ? this.parentPlayer._balance
      : this._balance;
  }

  @computed public get playerType(): PlayerType {
    return this.parentPlayer
      ? PlayerType.Player
      : this.parentAfterSplitPlayer
        ? PlayerType.Subplayer
        : PlayerType.Parent;
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

  @computed public get state(): PlayerGameState {
    if (this.handTotal > 21) {
      return PlayerGameState.Bust;
    }
    if (this.handTotal === 21 && !this.roundIsStarted) {
      return PlayerGameState.NaturalBlackjack;
    }
    if (this.handTotal === 21) {
      return PlayerGameState.Blackjack;
    }
    if (
      this.handTotal < 21 &&
      this.handTotal > 0 &&
      game.table?.dealer &&
      game.table.dealer.handTotal > this.handTotal &&
      game.table.dealer.handTotal <= 21 &&
      game.allActionsMade
    ) {
      return PlayerGameState.Loose;
    } else if (
      this.handTotal < 21 &&
      this.handTotal > 0 &&
      game.table?.dealer &&
      (game.table.dealer.handTotal <= this.handTotal ||
        game.table.dealer.handTotal > 21) &&
      game.allActionsMade
    ) {
      return PlayerGameState.Win;
    } else if (this.handTotal < 21 && this.handTotal > 0) {
      return PlayerGameState.Active;
    }
    return PlayerGameState.Error;
  }

  @computed public get isNaturalBJ(): boolean {
    return this.state === PlayerGameState.NaturalBlackjack;
  }

  @computed public get isBJ(): boolean {
    return this.state === PlayerGameState.Blackjack;
  }

  @computed public get isBust(): boolean {
    return this.state === PlayerGameState.Bust;
  }

  @computed public get isActive(): boolean {
    return this.state === PlayerGameState.Active;
  }

  @computed public get isWin(): boolean {
    return this.state === PlayerGameState.Win;
  }

  @computed public get isLoose(): boolean {
    return this.state === PlayerGameState.Loose;
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

  @action.bound public canBetAtThisSpot(spotId: string): boolean {
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

  @computed public set name(value: string) {
    this._name = value;
  }

  public get name(): string {
    return (
      this._name.charAt(0).toUpperCase() + this._name.slice(1).toLowerCase()
    );
  }

  @override public update(player: IPlayer): Player {
    const hand = player.hand
      ? player.hand.map(
        (card) =>
          new Card(card.suit, card.rank, card.value, card.id, card.isNew)
      )
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
    if (this._name !== player._name) {
      this._name = player._name;
    }

    this.hand = hand;
    this.betChips = player.betChips;
    this.parentAfterSplitPlayer = parentAfterSplitPlayer ?? null;
    this.parentPlayer = parentPlayer ?? null;
    this._balance = player._balance;

    return this;
  }
}
