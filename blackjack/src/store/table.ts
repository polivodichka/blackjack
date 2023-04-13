import { action, computed, makeObservable, observable } from "mobx";
import { GameStatus, IPlayer, PlayerType } from "../types.ds";
import { Card } from "./card";
import { Dealer } from "./dealer";
import { Player } from "./player";
import { nanoid } from "nanoid";
import game from "./game";

export class Table {
  readonly id: string;
  @observable allPlayers: Player[] = [];
  @observable dealer: Dealer | null = null;
  @observable currentPlayerIndex: number | null = null;
  @observable currentBetBtnValue: number = 2;

  constructor(id: string = nanoid()) {
    this.id = id;
    makeObservable(this);
  }

  @computed get players(): Player[] {
    return this.allPlayers.filter(
      (player) => player.playerType !== PlayerType.parent
    );
  }
  @computed get parentPlayers(): Player[] {
    return this.allPlayers.filter(
      (player) => player.playerType === PlayerType.parent
    );
  }
  @computed get currentPlayer(): Player | null {
    return typeof this.currentPlayerIndex === "number"
      ? this.players[this.currentPlayerIndex]
      : null;
  }
  @computed get spots(): {
    [key: string]: Player[];
  } {
    return this.players.reduce<{ [key: string]: Player[] }>(
      (result, player) => {
        if (!result[player.spotId]) {
          result[player.spotId] = [];
        }
        result[player.spotId].push(player);
        return result;
      },
      {}
    );
  }
  @computed get gameStatus(): GameStatus {
    if (
      this.parentPlayers.some(
        (parentPlayer) =>
          !this.players.find(
            (player) => player.parentPlayer?.id === parentPlayer.id
          )
      ) &&
      Object.keys(this.spots).length < 5
    )
      return GameStatus.waitBets;
    if (this.dealer && this.dealer.hand.length) return GameStatus.playing;
    return GameStatus.readyToStart;
  }
  @computed get ableToStartGame(): boolean {
    return (
      this.players.length > 0 &&
      !this.dealer &&
      this.players.every((player) => player.betChipsTotal) &&
      this.gameStatus === GameStatus.readyToStart
    );
  }
  @computed get roundIsStarted(): boolean {
    return this.players.length > 0 && !!this.dealer;
  }
  @computed get needInsurance(): boolean {
    return Boolean(
      this.dealer && this.dealer.hand.find((card) => card.rank === "ace")
    );
  }

  @action.bound addPlayer(player: IPlayer): Player {
    const hand = player.hand
      ? player.hand.map((card) => new Card(card.suit, card.rank, card.value))
      : [];

    const parentAfterSplitPlayer = player.parentAfterSplitPlayer
      ? game.findPlayerById(player.parentAfterSplitPlayer?.id)
      : null;
    parentAfterSplitPlayer &&
      player.parentAfterSplitPlayer &&
      parentAfterSplitPlayer.update(player.parentAfterSplitPlayer);

    const parentPlayer = player.parentPlayer
      ? game.findPlayerById(player.parentPlayer?.id)
      : null;
    parentPlayer &&
      player.parentPlayer &&
      parentPlayer.update(player.parentPlayer);

    const newPlayer = new Player(
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
  @action.bound canBetAtThisSpot(spotId: string): Boolean {
    const players = this.spots[spotId];
    if (players && players.length > 0) {
      return players.every(
        (player) =>
          player.id === game.player!.id ||
          (player.parentPlayer && player.parentPlayer.id === game.player!.id)
      );
    } else return true;
  }
  @action.bound setCurrentBetBtnValue(value: number): void {
    this.currentBetBtnValue = value;
  }
  @action.bound playerRemove(playerForRemoving: Player): void {
    const subPlayers = this.players.filter(
      (player) =>
        player.parentAfterSplitPlayer?.id === playerForRemoving.id ||
        player.parentPlayer!.id === playerForRemoving.id
    );
    subPlayers.push(playerForRemoving);
    subPlayers.forEach((player) => {
      const index = this.allPlayers.indexOf(player);
      index >= 0 && this.allPlayers.splice(index, 1);
    });
    if (!this.players.length) this.dealer = null;
  }
}
