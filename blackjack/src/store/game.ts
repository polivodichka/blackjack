import { action, computed, makeObservable, observable } from "mobx";

import { Player } from "./player";
import { Table } from "./table";
import { socket } from "../server/socket";
import { IPlayer, ITable, SocketOn } from "../types.ds";
import { Card } from "./card";
import { Dealer } from "./dealer";
import { isObjectsEqual } from "../utils/isObjectsEqual";
import game from "./game";

export class Game {
  @observable player: Player | null = null;
  @observable table: Table | null = null;

  constructor() {
    makeObservable(this);

    socket.on(SocketOn.disconnectPlayer, (playerId) => {
      const playerForRemoving = this.findPlayerById(playerId);
      if (playerForRemoving) {
        this.table?.playerRemove(playerForRemoving);
      }
    });

    socket.on(SocketOn.betUpdate, (playersStr) =>
      this.updateAllPlayersArray(JSON.parse(playersStr))
    );
    socket.on(SocketOn.dealt, (tableStr) => this.handleTableUpdate(tableStr));
    socket.on(SocketOn.actionMade, (tableStr) =>
      this.handleTableUpdate(tableStr)
    );
    socket.on(SocketOn.dealerMadeAction, (tableStr) =>
      this.handleTableUpdate(tableStr)
    );
    socket.on(SocketOn.winnersCounted, (tableStr) =>
      this.handleTableUpdate(tableStr)
    );
    socket.on(SocketOn.gameEnded, (tableStr) =>
      this.handleTableUpdate(tableStr)
    );
  }

  @computed get gameIsReady(): boolean {
    return !!(this.player && this.table);
  }

  @action.bound onTableCreated(table: ITable, player: IPlayer) {
    this.table = new Table(table.id);
    this.updateTableInfo(table);

    this.player = this.findPlayerById(player.id) ?? null;
  }
  @action.bound onTableJoined(table: ITable) {
    this.updateAllPlayersArray(table.allPlayers);
  }
  findPlayerById(playerId: string): Player | undefined {
    const table = this.table;
    return table
      ? table.allPlayers.find((player) => player.id === playerId)
      : undefined;
  }
  private handleTableUpdate(tableStr: string) {
    const table = JSON.parse(tableStr);
    this.updateTableInfo(table);
  }
  private updateAllPlayersArray(source: IPlayer[]) {
    const target: IPlayer[] = JSON.parse(
      JSON.stringify(this.table?.allPlayers)
    );
    source.forEach((player) => {
      const findedObjPlayer = target.find(
        (findedPlayer) => findedPlayer.id === player.id
      );
      if (findedObjPlayer && !isObjectsEqual(player, findedObjPlayer)) {
        const realPlayer = this.findPlayerById(findedObjPlayer.id);
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
            const realPlayer = this.findPlayerById(player.id);
            realPlayer && this.table?.playerRemove(realPlayer);
          });
      }
    });
  }
  private updateTableInfo(table: ITable) {
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
        dealerHand ?? [],
        table.dealer.roundIsEnded,
        table.dealer.id
      );
    } else {
      dealer = null;
    }

    if (this.table) {
      this.table.dealer = dealer;
      this.table.currentPlayerIndex = table.currentPlayerIndex;
      this.updateAllPlayersArray(table.allPlayers);
    }
  }
}

export default new Game();
