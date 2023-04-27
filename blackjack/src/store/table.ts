/* eslint-disable @typescript-eslint/lines-between-class-members */
import { makeObservable } from 'mobx';
import { observable } from 'mobx';
import { computed } from 'mobx';
import { action } from 'mobx';

import { GameStatus } from '../types.ds';
import { PlayerType } from '../types.ds';
import { IPlayer } from '../types.ds';
import { Rank } from '../types.ds';
import { TBet } from '../types.ds';
import { Dealer } from './dealer';
import { Player } from './player';
import { Card } from './card';
import { game } from './game';

export class Table {
  @observable public allPlayers: Player[] = [];
  @observable public currentBetBtnValue: TBet = 2;
  @observable private _dealer: Dealer | null = null;
  @observable private _currentPlayerIndex: number | null = null;
  @observable private _roundIsStarted = false;

  public constructor(public readonly id: string) {
    this.id = id;
    makeObservable(this);
  }

  @computed public get players(): Player[] {
    return this.allPlayers.filter(
      (player) => player.playerType !== PlayerType.Parent
    );
  }

  @computed public get playingPlayers(): Player[] {
    return this.allPlayers.filter((player) => !!player.hand.length);
  }

  @computed public get parentPlayers(): Player[] {
    return this.allPlayers.filter(
      (player) => player.playerType === PlayerType.Parent
    );
  }

  @computed public get currentPlayer(): Player | null {
    return typeof this._currentPlayerIndex === 'number'
      ? this.players[this._currentPlayerIndex]
      : null;
  }

  @computed public get spots(): Record<string, Player[]> {
    return this.players.reduce<Record<string, Player[]>>((result, player) => {
      if (!result[player.spotId]) {
        result[player.spotId] = [];
      }
      result[player.spotId].push(player);
      return result;
    }, {});
  }

  @computed public get gameStatus(): GameStatus {
    if (
      this.parentPlayers.some(
        (parentPlayer) =>
          !this.players.find(
            (player) => player.parentPlayer?.id === parentPlayer.id
          )
      ) &&
      this.parentPlayers.every(
        (player) => player.balance >= 2 || player.betChipsTotalWithChildren
      ) &&
      Object.keys(this.spots).length < 5 &&
      !this._dealer
    ) {
      return GameStatus.WaitBets;
    }
    if (this._dealer?.hand.length) {
      return GameStatus.Playing;
    }
    if (!!this.playingPlayers.length) {
      return GameStatus.WaitEndAndBets;
    }
    return GameStatus.ReadyToStart;
  }

  @computed public get ableToStartGame(): boolean {
    return (
      this.players.length > 0 &&
      !this._dealer &&
      this.players.every((player) => player.betChipsTotal) &&
      this.gameStatus === GameStatus.ReadyToStart &&
      this.playingPlayers.length === 0
    );
  }

  @computed public get needInsurance(): boolean {
    return Boolean(this._dealer?.hand.find((card) => card.rank === Rank.Ace));
  }

  @computed public set dealer(value: Dealer | null) {
    this._dealer = value;
  }
  public get dealer(): Dealer | null {
    return this._dealer;
  }

  @computed public set roundIsStarted(value: boolean) {
    this._roundIsStarted = value;
  }
  public get roundIsStarted(): boolean {
    return this._roundIsStarted;
  }

  @computed public set currentPlayerIndex(value: number | null) {
    this._currentPlayerIndex = value;
  }
  public get currentPlayerIndex(): number | null {
    return this._currentPlayerIndex;
  }

  @action.bound public addPlayer(player: IPlayer): Player {
    const hand = player.hand
      ? player.hand.map(
        (card) =>
          new Card(card.suit, card.rank, card.value, card.id, card.isNew)
      )
      : [];

    const parentAfterSplitPlayer = player.parentAfterSplitPlayer
      ? game.findPlayerById(player.parentAfterSplitPlayer?.id)
      : null;
    if (parentAfterSplitPlayer && player.parentAfterSplitPlayer) {
      parentAfterSplitPlayer.update(player.parentAfterSplitPlayer);
    }

    const parentPlayer = player.parentPlayer
      ? game.findPlayerById(player.parentPlayer?.id)
      : null;
    if (parentPlayer && player.parentPlayer) {
      parentPlayer.update(player.parentPlayer);
    }

    const newPlayer = new Player(
      player._name,
      player.spotId,
      hand,
      player.roundIsEnded,
      player.betChips,
      player.insuranceBet,
      parentAfterSplitPlayer ?? null,
      parentPlayer ?? null,
      player._balance,
      player.id
    );
    this.allPlayers.push(newPlayer);
    return newPlayer;
  }

  @action.bound public playerRemove(playerForRemoving: Player): void {
    const subPlayers = this.players.filter(
      (player) =>
        player.parentAfterSplitPlayer?.id === playerForRemoving.id ||
        player.parentPlayer?.id === playerForRemoving.id
    );
    subPlayers.push(playerForRemoving);
    subPlayers.forEach((player) => {
      const index = this.allPlayers.indexOf(player);
      if (index >= 0) {
        this.allPlayers.splice(index, 1);
      }
    });
  }
}
