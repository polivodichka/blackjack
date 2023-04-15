import { Server as HttpServer } from "http";
import { Socket, Server } from "socket.io";
import { Table } from "../models/table";
import { Player } from "../models/player";
import { ActionType, EndGameActions, TBet } from "./types.ds";

export class ServerSocket {
  public static instance: ServerSocket;
  public io: Server;

  public tables: { [tid: string]: Table };

  constructor(server: HttpServer) {
    ServerSocket.instance = this;
    this.tables = {};
    this.io = new Server(server, {
      serveClient: false,
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false,
      cors: {
        origin: "*",
      },
    });

    this.io.on("connect", this.StartListeners);
  }

  StartListeners = (socket: Socket) => {
    console.info("Message received from " + socket.id);

    socket.on("create_table", (name: string, balance: number) => {
      const table = new Table();
      const player = table.addPlayer(name, "", balance, socket.id);

      this.tables[table.id] = table;
      socket.join(table.id);

      console.info("Table created ", table.id);

      socket.emit(
        "tableCreated",
        JSON.stringify(table),
        JSON.stringify(player)
      );
    });
    socket.on(
      "join_table",
      (tableId: string, name: string, balance: number) => {
        const table = this.tables[tableId];
        if (table && Object.keys(table.spots).length <= 5) {
          const player = table.addPlayer(name, "", balance, socket.id);

          socket.join(table.id);

          socket.broadcast
            .to(table.id)
            .emit("tableJoined", JSON.stringify(table));
          socket.broadcast
            .to(table.id)
            .emit(
              "message",
              `${
                name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
              } has joined`
            );
          socket.emit(
            "tableCreated",
            JSON.stringify(table),
            JSON.stringify(player)
          );
          console.info("Table joined ", table.id);
        } else if (!table) {
          socket.emit("error", "No such table!");
        } else if (Object.keys(table.spots).length > 5) {
          socket.emit("error", "Too much players!");
        }
      }
    );
    socket.on(
      "set_bet",
      (tableId: string, spotId: string, parentId: string, amount: TBet) => {
        const table = this.tables[tableId];
        const parent = table ? this.findPlayerById(parentId, table) : undefined;
        if (table && !table.roundIsStarted && parent) {
          const player = table.spots[spotId]
            ? table.spots[spotId][0]
            : table.addPlayer("", spotId, 0, undefined, parentId);

          if (amount <= parent.balance) {
            player.bet(amount);
            this.io
              .to(table.id)
              .emit("betUpdate", JSON.stringify(table.allPlayers), "betSet");
          } else {
            socket.emit("error", "Insufficient funds");
          }
        } else {
          socket.emit("error", "Error on bet set");
        }
      }
    );
    socket.on(
      "remove_bet",
      (tableId: string, playerId: string, betIndex: number) => {
        const table = this.tables[tableId];
        const player = table ? this.findPlayerById(playerId, table) : undefined;
        player?.betDeleteByIndex(betIndex);
        this.io
          .to(table.id)
          .emit("betUpdate", JSON.stringify(table.allPlayers), "betRemoved");
      }
    );
    socket.on("deal", (tableId: string) => {
      const table = this.tables[tableId];

      if (table) {
        table.deal();
        this.io.to(table.id).emit("dealt", JSON.stringify(table));
      }
    });
    socket.on(
      "action",
      (actionType: ActionType, tableId: string, playerId: string) => {
        const table = this.tables[tableId];
        const player = table ? this.findPlayerById(playerId, table) : undefined;
        if (table) {
          switch (actionType) {
            case ActionType.hit:
              table.hit();
              break;
            case ActionType.double:
              table.double();
              break;
            case ActionType.split:
              if (player && player.betChipsTotal <= player.balance) {
                table.split();
              } else socket.emit("error", "ERROR");
              break;
            case ActionType.stand:
              table.stand();
              break;
            case ActionType.insurance:
              if (player && player.betChipsTotal <= player.balance) {
                player.insurance();
              } else socket.emit("error", "ERROR");
              break;
            case ActionType.skipInsurance:
              player && player.insurance(0);
              break;
          }
          if (
            table.currentPlayer &&
            (table.currentPlayer.isBust ||
              table.currentPlayer.isBJ ||
              table.currentPlayer.isNaturalBJ)
          ) {
            console.log(table.currentPlayer.handTotal);
            table.stand();
          }
          this.io.to(table.id).emit("actionMade", JSON.stringify(table));

          if (
            table.dealer &&
            table.currentPlayerIndex === table.playingPlayers.length
          ) {
            while (table.dealer.canHit) {
              table.dealer.hand.push(table.draw());
              this.io
                .to(table.id)
                .emit("dealerMadeAction", JSON.stringify(table));
            }
            table.countWinnings();
            this.io.to(table.id).emit("winnersCounted", JSON.stringify(table));
            table.currentPlayerIndex = null;
          }
        }
      }
    );
    socket.on(
      "end_game",
      (tableId: string, playerId: string, action: EndGameActions) => {
        const table = this.tables[tableId];
        const player = table ? this.findPlayerById(playerId, table) : undefined;
        if (table && player) {
          switch (action) {
            case EndGameActions.newBet:
              table.removeFakePlayers(player);
              break;
            case EndGameActions.rebet:
              table.rebet(player);
              break;
          }
          table.roundIsStarted = false;
          this.io.to(table.id).emit("gameEnded", JSON.stringify(table));
        }
      }
    );

    socket.on("disconnect", () => {
      console.info("Disconnect received from: " + socket.id);

      let player: Player | undefined;
      let tableId: string = "";
      for (const prop in this.tables) {
        if (this.tables[prop].players) {
          tableId = prop;
          const table = this.tables[prop];
          player = table ? this.findPlayerById(socket.id, table) : undefined;
        }
      }
      if (player && tableId.length) {
        const table = this.tables[tableId];
        socket.broadcast
          .to(table.id)
          .emit(
            "message",
            `${
              player.name.charAt(0).toUpperCase() +
              player.name.slice(1).toLowerCase()
            } left`
          );
        table.removeFakePlayers(player);
        table.playerRemove(player);

        if (!table.allPlayers.length) {
          console.info("table deleted");
          delete this.tables[table.id];
        } else {
          if (!table.playingPlayers.length) {
            table.dealer = null;
            table.roundIsStarted = false;
          }
          socket.broadcast.to(table.id).emit("disconnectPlayer", JSON.stringify(table));
        }
      }
    });
  };
  private findPlayerById(playerId: string, table: Table): Player | undefined {
    return table.allPlayers.find((player) => player.id === playerId);
  }
}
