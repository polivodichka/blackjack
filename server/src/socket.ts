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

    socket.on("create_table", () => {
      const table = new Table();
      const player = table.addPlayer("", socket.id);

      this.tables[table.id] = table;
      socket.join(table.id);

      console.info("Table created ", table.id);

      socket.emit(
        "tableCreated",
        JSON.stringify(table),
        JSON.stringify(player)
      );
    });
    socket.on("join_table", (tableId: string) => {
      const table = this.tables[tableId];
      if (table && Object.keys(table.spots).length <= 5) {
        const player = table.addPlayer("", socket.id);

        socket.join(table.id);

        socket.broadcast
          .to(table.id)
          .emit("tableJoined", JSON.stringify(table));
        socket.emit(
          "tableCreated",
          JSON.stringify(table),
          JSON.stringify(player)
        );
        console.info("Table joined ", table.id);
      } else if (!table) {
        console.info("No such table");
        socket.emit("errorOnTableCreation", "No such table!");
      } else if (Object.keys(table.spots).length > 5) {
        console.info("Too much players ");
        socket.emit("errorOnTableCreation", "Too much players!");
      }
    });
    socket.on(
      "set_bet",
      (tableId: string, spotId: string, parentId: string, amount: TBet) => {
        const table = this.tables[tableId];
        if (table && !table.roundIsStarted) {
          const player = table.spots[spotId]
            ? table.spots[spotId][0]
            : table.addPlayer(spotId, undefined, parentId);

          if (amount <= player.balance) {
            player.bet(amount);
            this.io
              .to(table.id)
              .emit("betUpdate", JSON.stringify(table.allPlayers), "betSet");
          } else {
            socket.emit("errorOnBetSet", "Insufficient funds");
          }
        } else {
          socket.emit("errorOnBetSet", "Error on bet set");
        }
      }
    );
    socket.on(
      "remove_bet",
      (tableId: string, playerId: string, betIndex: number) => {
        const table = this.tables[tableId];
        const player = this.findPlayerById(playerId, table);
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
        const player = this.findPlayerById(playerId, table);
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
          this.io.to(table.id).emit("actionMade", JSON.stringify(table));
          if (
            table.dealer &&
            table.currentPlayerIndex! === table.players.length ///тут мб надо только активные игроки(со ставками)
          ) {
            table.currentPlayerIndex = null;
            while (table.dealer.canHit) {
              table.dealer.hand.push(table.draw());
              this.io
                .to(table.id)
                .emit("dealerMadeAction", JSON.stringify(table));
            }
            table.countWinnings();
            this.io.to(table.id).emit("winnersCounted", JSON.stringify(table));
          }
          if (table.currentPlayer && table.currentPlayer.isBust) {
            table.stand();
          }
        }
      }
    );
    socket.on(
      "end_game",
      (tableId: string, playerId: string, action: EndGameActions) => {
        const table = this.tables[tableId];
        const player = this.findPlayerById(playerId, table);
        if (table && player) {
          switch (action) {
            case EndGameActions.newBet:
              table.removeFakePlayers(player);
              break;
            case EndGameActions.rebet:
              table.rebet(player);
              break;
          }
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
          player = this.findPlayerById(socket.id, this.tables[prop]);
        }
      }
      if (player && tableId.length) {
        const table = this.tables[tableId];
        table.removeFakePlayers(player);
        table.playerRemove(player);
        if (!table.allPlayers.length) {
          delete this.tables[table.id];
        } else
          socket.broadcast.to(table.id).emit("disconnectPlayer", socket.id);
      }
    });
  };
  private findPlayerById(playerId: string, table: Table): Player | undefined {
    return table.allPlayers.find((player) => player.id === playerId);
  }
}
