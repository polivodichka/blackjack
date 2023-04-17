import { ActionType } from './types.ds';
import { BaseMessages } from './types.ds';
import { EndGameActions } from './types.ds';
import { MyServer } from './socket.ds';
import { MySocket } from './socket.ds';
import { Player } from './models/player';
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { SocketEmit } from './types.ds';
import { SocketOn } from './types.ds';
import { Table } from './models/table';

export class ServerSocket {
  public static instance: ServerSocket;
  public io: MyServer;

  public tables: Record<string, Table>;

  public constructor(server: HttpServer) {
    ServerSocket.instance = this;
    this.tables = {};
    this.io = new Server(server, {
      serveClient: false,
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false,
      cors: {
        origin: '*',
      },
    });

    this.io.on(SocketOn.connect, this.StartListeners);
  }

  private StartListeners = (socket: MySocket) => {
    console.info(`Message received from ${socket.id}`);

    socket.on(SocketOn.create_table, async (name, balance) => {
      try {
        const table = new Table();
        const player = table.addPlayer(name, '', balance, socket.id);

        this.tables[table.id] = table;
        await socket.join(table.id);

        console.info(`${SocketEmit.tableCreated}: ${table.id}`);
        //send
        socket.emit(
          SocketEmit.tableCreated,
          JSON.stringify(table),
          JSON.stringify(player)
        );
      } catch (error) {
        handleError(error);
      }
    });
    socket.on(SocketOn.join_table, async (tableId, name, balance) => {
      try {
        const table = this.tables[tableId];
        if (!table) {
          throw new Error(BaseMessages.NoTable);
        }

        const player = table.addPlayer(name, '', balance, socket.id);

        await socket.join(table.id);

        console.info(`${SocketEmit.tableJoined}: ${table.id}`);
        //send
        socket.broadcast
          .to(tableId)
          .emit(SocketEmit.message, `${player.name} has joined`);
        socket.broadcast
          .to(table.id)
          .emit(SocketEmit.tableJoined, JSON.stringify(table));
        socket.emit(
          SocketEmit.tableCreated,
          JSON.stringify(table),
          JSON.stringify(player)
        );
      } catch (error) {
        handleError(error);
      }
    });

    socket.on(SocketOn.set_bet, (tableId, spotId, parentId, amount) => {
      try {
        const table = this.tables[tableId];
        if (!table) {
          throw new Error(BaseMessages.NoTable);
        }

        const parent = this.findPlayerById(parentId, table);
        if (!parent) {
          throw new Error(BaseMessages.PlayerLost);
        }

        if (amount > parent.balance) {
          throw new Error(BaseMessages.NoMoney);
        }

        if (!table.roundIsStarted) {
          const player = table.spots[spotId]
            ? table.spots[spotId][0]
            : table.addPlayer('', spotId, 0, undefined, parentId);

          player.bet(amount);

          console.info(`betSetted player ${parentId}`);
          //send
          this.io
            .to(table.id)
            .emit(SocketEmit.betUpdate, JSON.stringify(table.allPlayers));
        }
      } catch (error) {
        handleError(error);
      }
    });
    socket.on(
      SocketOn.remove_bet,
      (tableId: string, playerId: string, betIndex: number) => {
        try {
          const table = this.tables[tableId];
          if (!table) {
            throw new Error(BaseMessages.NoTable);
          }

          const player = this.findPlayerById(playerId, table);
          if (!player) {
            throw new Error(BaseMessages.PlayerLost);
          }

          player.betDeleteByIndex(betIndex);

          console.info(`betRemoved player ${player.parentPlayer?.id}`);
          //send
          this.io
            .to(table.id)
            .emit(SocketEmit.betUpdate, JSON.stringify(table.allPlayers));
        } catch (error) {
          handleError(error);
        }
      }
    );
    socket.on(SocketOn.deal, (tableId: string) => {
      try {
        const table = this.tables[tableId];

        if (!table) {
          throw new Error(BaseMessages.NoTable);
        }

        table.deal();

        console.info(`SocketEmit.dealt ${table.id}`);
        //send
        this.io.to(table.id).emit(SocketEmit.dealt, JSON.stringify(table));
      } catch (error) {
        handleError(error);
      }
    });
    socket.on(
      SocketOn.action,
      (actionType: ActionType, tableId: string, playerId: string) => {
        try {
          const table = this.tables[tableId];

          if (!table) {
            throw new Error(BaseMessages.NoTable);
          }

          const player = this.findPlayerById(playerId, table);
          if (!player) {
            throw new Error(BaseMessages.PlayerLost);
          }

          switch (actionType) {
            case ActionType.hit:
              table.hit();
              break;

            case ActionType.double:
              if (player.betChipsTotal > player.balance) {
                throw new Error(BaseMessages.NoMoney);
              }
              table.double();
              break;

            case ActionType.split:
              if (player.betChipsTotal > player.balance) {
                throw new Error(BaseMessages.NoMoney);
              }
              table.split();
              break;

            case ActionType.stand:
              table.stand();
              break;

            case ActionType.insurance:
              if (player.betChipsTotal / 2 > player.balance) {
                throw new Error(BaseMessages.NoMoney);
              }
              player.insurance();
              break;

            case ActionType.skipInsurance:
              player.insurance(0);
              break;
          }

          console.info(`${SocketEmit.actionMade} ${player.parentPlayer?.id}`);
          //send
          this.io
            .to(table.id)
            .emit(SocketEmit.actionMade, JSON.stringify(table));

          if (
            table.dealer &&
            table.currentPlayerIndex === table.playingPlayers.length
          ) {
            /*Dealers round*/
            while (table.dealer.canHit) {
              table.dealer.hand.push(table.draw());

              console.info(`${SocketEmit.actionMade} by dealer ${table.id}`);
              //send
              this.io
                .to(table.id)
                .emit(SocketEmit.dealerMadeAction, JSON.stringify(table));
            }

            table.countWinnings();

            console.info(SocketEmit.winnersCounted);
            //send
            this.io
              .to(table.id)
              .emit(SocketEmit.winnersCounted, JSON.stringify(table));
            table.currentPlayerIndex = null;
          }
        } catch (error) {
          handleError(error);
        }
      }
    );

    socket.on(
      SocketOn.topup_balance,
      (balance: number, tableId: string, playerId: string) => {
        try {
          const table = this.tables[tableId];
          if (!table) {
            throw new Error(BaseMessages.NoTable);
          }

          const player = this.findPlayerById(playerId, table);
          if (!player) {
            throw new Error(BaseMessages.PlayerLost);
          }

          player.balance = +balance + +player.balance;

          console.info(
            `${SocketEmit.balanceToppedUp} to ${player.balance} for ${player.parentPlayer?.id}`
          );
          //send
          socket.emit(SocketEmit.balanceToppedUp, JSON.stringify(player));
          socket.emit(
            SocketEmit[SocketEmit.message],
            'Balance successfully topped up!'
          );
        } catch (error) {
          handleError(error);
        }
      }
    );
    socket.on(
      SocketOn.end_game,
      (tableId: string, playerId: string, action: EndGameActions) => {
        try {
          const table = this.tables[tableId];
          if (!table) {
            throw new Error(BaseMessages.NoTable);
          }

          const player = this.findPlayerById(playerId, table);
          if (!player) {
            throw new Error(BaseMessages.PlayerLost);
          }

          switch (action) {
            case EndGameActions.newBet:
              table.removeFakePlayers(player);
              break;
            case EndGameActions.rebet:
              if (player.betChipsTotalWithChildren <= player.balance) {
                table.rebet(player);
              } else {
                table.removeFakePlayers(player);
                socket.emit(SocketEmit.error, BaseMessages.NoMoney);
              }
              break;
          }
          table.roundIsStarted = false;
          this.io
            .to(table.id)
            .emit(SocketEmit.gameEnded, JSON.stringify(table));
        } catch (error) {
          handleError(error);
        }
      }
    );

    socket.on(SocketOn.disconnect, () => {
      console.info(`Disconnect received from: ${socket.id}`);
      try {
        let player: Player | undefined;
        let table: Table | undefined;
        for (const key_id in this.tables) {
          if (this.tables[key_id].players) {
            table = this.tables[key_id];
            if (table) {
              player = this.findPlayerById(socket.id, table);
            }
          }
        }

        if (!player || !table) {
          throw new Error('Problem on disconnection');
        }

        table.playerRemove(player);

        if (!table.allPlayers.length) {
          console.info(`Table  ${table.id} deleted`);
          delete this.tables[table.id];
        } else {
          if (!table.playingPlayers.length) {
            table.dealer = null;
            table.roundIsStarted = false;
          }

          console.info(`${SocketEmit.disconnectPlayer}  ${socket.id}`);
          //sent
          socket.broadcast
            .to(table.id)
            .emit(SocketEmit.message, `${player.name} left`);
          socket.broadcast
            .to(table.id)
            .emit(SocketEmit.disconnectPlayer, JSON.stringify(table));
        }
      } catch (error) {}
    });

    const handleError = (error: unknown) => {
      if (error instanceof Error) {
        console.info(error);
        socket.emit(SocketEmit.error, error.message);
      } else {
        console.info('An unknown error occurred');
        socket.emit(SocketEmit.error, BaseMessages.SmthWentWrong);
      }
    };
  };

  private findPlayerById(playerId: string, table: Table): Player | undefined {
    return table.allPlayers.find((player) => player.id === playerId);
  }
}
