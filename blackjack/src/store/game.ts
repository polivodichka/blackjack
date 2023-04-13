import { action, autorun, computed, makeObservable, observable } from "mobx";

import { Player } from "./player";
import { Table } from "./table";
import { socket } from "../server/socket";
import { IPlayer, ITable } from "../types.ds";
import { Card } from "./card";
import { Dealer } from "./dealer";
import { isObjectsEqual } from "../utils/isObjectsEqual";

export class Game {
  @observable player: Player | null = null;
  @observable table: Table | null = null;

  constructor() {
    makeObservable(this);
    autorun(() => {
      this.table = new Table();
    });
    socket.on("disconnectPlayer", (playerId: string) => {
      const playerForRemoving = this.table?.allPlayers.find(
        (findedPlayer) => findedPlayer.id === playerId
      );
      if (playerForRemoving) {
        this.table?.removeFakePlayers(playerForRemoving);
        this.table?.playerRemove(playerForRemoving);
      }
      console.log("disconnectPlayer", this);
    });

    socket.on("betUpdate", (playersAfterBetStr: string, status: string) => {
      this.updateAllPlayersArray(JSON.parse(playersAfterBetStr));

      console.log(this.table);
      console.log(this.player === this.table?.allPlayers[0], status);
    });
    socket.on("dealMade", (tableStr: string) => {
      const table = JSON.parse(tableStr);
      this.updateTableInfo(table);
    });
    socket.on("actionMade", (tableStr: string) => {
      const table = JSON.parse(tableStr);
      this.updateTableInfo(table);
      console.log(table.allPlayers);
      console.log(this.table?.allPlayers);
    });
  }

  @computed get gameIsReady(): boolean {
    return !!(this.player && this.table);
  }

  @action.bound onTableCreated(table: ITable, player: IPlayer) {
    this.table = new Table(table.id);
    this.updateTableInfo(table);

    this.player =
      this.table.allPlayers.find(
        (findedPlayer) => findedPlayer.id === player.id
      ) ?? null;
    console.log("onTableCreated", this);
  }
  @action.bound onTableJoined(table: ITable) {
    this.updateAllPlayersArray(table.allPlayers);
    console.log("onTableJoined", this);
  }
  updateAllPlayersArray(source: IPlayer[]) {
    const target: IPlayer[] = JSON.parse(
      JSON.stringify(this.table?.allPlayers)
    );
    source.forEach((player) => {
      const findedObjPlayer = target.find(
        (findedPlayer) => findedPlayer.id === player.id
      );
      if (findedObjPlayer && !isObjectsEqual(player, findedObjPlayer)) {
        const realPlayer = this.table?.allPlayers.find(
          (player) => player.id === findedObjPlayer.id
        );
        realPlayer && realPlayer.update(player);
      } else if (!findedObjPlayer) {
        const index = source.indexOf(player);
        const newPlayer = this.table!.addPlayer(player);
        this.table?.allPlayers.splice(-1);
        this.table?.allPlayers.splice(index, 0, newPlayer);
      }
      if (target.length > source.length) {
        target
          .filter(
            (player) =>
              !source.find((findedPlayer) => findedPlayer.id === player.id)
          )
          .map((player) => {
            const realPlayer = this.table?.allPlayers.find(
              (realPlayer) => player.id === realPlayer.id
            );
            realPlayer && this.table?.playerRemove(realPlayer);
          });
      }
    });
  }
  updateTableInfo(table: ITable) {
    const dealerHand = table.dealer?.hand.map(
      (card) => new Card(card.suit, card.rank, card.value)
    );

    const deck = table.deck
      ? table.deck.map((card) => new Card(card.suit, card.rank, card.value))
      : [];

    let dealer: Dealer | null;
    if (this.table?.dealer) {
      dealer = this.table.dealer.update(table.dealer);
    } else if (table.dealer) {
      dealer = new Dealer(
        table.dealer.spotId,
        dealerHand,
        table.dealer.roundIsEnded,
        table.dealer.id
      );
    } else {
      dealer = null;
    }

    if (this.table) {
      this.table.dealer = dealer;
      this.table.deck = deck;
      this.table.currentPlayerIndex = table.currentPlayerIndex;
      this.updateAllPlayersArray(table.allPlayers);
    }
  }
}

export default new Game();
