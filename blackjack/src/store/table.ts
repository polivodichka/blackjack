import { action, computed, makeObservable, observable } from 'mobx';
import { GameStatus, IPlayer, PlayerType, Rank, TBet } from '../types.ds';
import { Card } from './card';
import { Dealer } from './dealer';
import { Player } from './player';
import { nanoid } from 'nanoid';
import { game } from './game';

export class Table {
  public readonly id: string;
  @observable public allPlayers: Player[] = [];
  @observable public dealer: Dealer | null = null;
  @observable public currentPlayerIndex: number | null = null;
  @observable public currentBetBtnValue: TBet = 2;

  public constructor(id: string = nanoid()) {
    this.id = id;
    makeObservable(this);
  }

  @computed public get players(): Player[] {
    return this.allPlayers.filter(
      (player) => player.playerType !== PlayerType.parent
    );
  }

  @computed public get parentPlayers(): Player[] {
    return this.allPlayers.filter(
      (player) => player.playerType === PlayerType.parent
    );
  }

  @computed public get currentPlayer(): Player | null {
    return typeof this.currentPlayerIndex === 'number'
      ? this.players[this.currentPlayerIndex]
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
      Object.keys(this.spots).length < 5
    ) {
      return GameStatus.waitBets;
    }
    if (this.dealer?.hand.length) {
      return GameStatus.playing;
    }
    return GameStatus.readyToStart;
  }

  @computed public get ableToStartGame(): boolean {
    return (
      this.players.length > 0 &&
      !this.dealer &&
      this.players.every((player) => player.betChipsTotal) &&
      this.gameStatus === GameStatus.readyToStart
    );
  }

  @computed public get roundIsStarted(): boolean {
    return this.players.length > 0 && !!this.dealer;
  }

  @computed public get needInsurance(): boolean {
    return Boolean(this.dealer?.hand.find((card) => card.rank === Rank.ace));
  }

  @action.bound public addPlayer(player: IPlayer): Player {
    const hand = player.hand
      ? player.hand.map((card) => new Card(card.suit, card.rank, card.value))
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
      player.name,
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

  @action.bound public canBetAtThisSpot(spotId: string): boolean {
    const players = this.spots[spotId];
    if (players && players.length > 0) {
      return players.every(
        (player) =>
          player.id === game.player?.id ||
          (player.parentPlayer && player.parentPlayer.id === game.player?.id)
      );
    } else {
      return true;
    }
  }

  @action.bound public setCurrentBetBtnValue(value: TBet): void {
    this.currentBetBtnValue = value;
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
    if (!this.players.length) {
      this.dealer = null;
    }
  }
}
