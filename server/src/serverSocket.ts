import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

import { MyServer } from './serverSocket.ds';
import { MySocket } from './serverSocket.ds';
import { EndGameActions } from './types.ds';
import { BaseMessages } from './types.ds';
import { Player } from './models/player';
import { ActionType } from './types.ds';
import { SocketEmit } from './types.ds';
import { Table } from './models/table';
import { IMessage } from './types.ds';
import { SocketOn } from './types.ds';
import { Chat } from './models/chat';
import { Rank } from './types.ds';

export class ServerSocket {
  public static instance: ServerSocket;
  public io: MyServer;

  public tables: Record<string, Table>;
  public chats: Record<string, Chat>;

  public constructor(server: HttpServer) {
    ServerSocket.instance = this;
    this.tables = {};
    this.chats = {};
    this.io = new Server(server, {
      serveClient: false,
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false,
      cors: {
        origin: '*',
      },
    });

    this.io.on(SocketOn.Connect, this.startListeners);
  }

  private startListeners = (socket: MySocket): void => {
    console.info(`Message received from ${socket.id}`);

    socket.on(SocketOn.CreateTable, async (name, balance) => {
      try {
        const table = new Table();
        const player = table.addPlayer(name, '', balance, socket.id);
        const chat = new Chat();

        this.tables[table.id] = table;
        this.chats[table.id] = chat;
        await socket.join(table.id);

        console.info(`${SocketEmit.TableCreated}: ${table.id}`);
        //send
        socket.emit(
          SocketEmit.TableCreated,
          JSON.stringify(table),
          JSON.stringify(player),
          JSON.stringify(chat)
        );
      } catch (error) {
        this.handleError(error, socket);
      }
    });

    socket.on(SocketOn.JoinTable, async (tableId, name, balance) => {
      try {
        const table = this.tables[tableId];
        if (!table) {
          throw new Error(BaseMessages.NoTable);
        }
        const chat = this.chats[tableId];

        const player = table.addPlayer(name, '', balance, socket.id);

        await socket.join(table.id);

        console.info(`${SocketEmit.TableJoined}: ${table.id}`);
        //send
        socket.broadcast
          .to(tableId)
          .emit(SocketEmit.Message, `${player.name} has joined`);
        socket.broadcast
          .to(table.id)
          .emit(SocketEmit.TableJoined, JSON.stringify(table));
        socket.emit(
          SocketEmit.TableCreated,
          JSON.stringify(table),
          JSON.stringify(player),
          JSON.stringify(chat)
        );
      } catch (error) {
        this.handleError(error, socket);
      }
    });

    socket.on(SocketOn.SetBet, (tableId, spotId, parentId, amount) => {
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
            .emit(SocketEmit.BetUpdate, JSON.stringify(table.allPlayers));
        }
      } catch (error) {
        this.handleError(error, socket);
      }
    });

    socket.on(
      SocketOn.RemoveBet,
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

          table.betDeleteByIndex(betIndex, player);

          console.info(`betRemoved player ${player.parentPlayer?.id}`);
          //send
          this.io
            .to(table.id)
            .emit(SocketEmit.BetUpdate, JSON.stringify(table.allPlayers));
        } catch (error) {
          this.handleError(error, socket);
        }
      }
    );

    socket.on(SocketOn.Deal, (tableId: string) => {
      try {
        const table = this.tables[tableId];

        if (!table) {
          throw new Error(BaseMessages.NoTable);
        }

        if (!Object.keys(table.spots).length) {
          throw new Error(BaseMessages.ProhibitedAction);
        }

        table.deal();

        const player = table.currentPlayer;

        console.info(`${SocketEmit.Dealt} ${table.id}`);
        //send
        this.io.to(table.id).emit(SocketEmit.Dealt, JSON.stringify(table));
      } catch (error) {
        this.handleError(error, socket);
      }
    });

    socket.on(
      SocketOn.Action,
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

          if (table.currentPlayer && player.id !== table.currentPlayer.id) {
            throw new Error(BaseMessages.ProhibitedAction);
          }

          table.playingPlayers.forEach((plPlayer) => {
            const hand = plPlayer.hand;
            const filtredHand = hand.filter((card) => card.isNew);
            for(const newCard of filtredHand){
              newCard.isNew = false
            }
          });

          switch (actionType) {
            case ActionType.Hit:
              table.hit();
              break;

            case ActionType.Double:
              if (player.betChipsTotal > player.balance) {
                throw new Error(BaseMessages.NoMoney);
              }
              table.double();
              break;

            case ActionType.Split:
              if (player.betChipsTotal > player.balance) {
                throw new Error(BaseMessages.NoMoney);
              }
              if (player.hand[0].rank !== player.hand[1].rank) {
                throw new Error('Cant split!');
              }
              table.split();
              break;

            case ActionType.Stand:
              table.stand();
              break;

            case ActionType.Insurance:
              if (player.betChipsTotal / 2 > player.balance) {
                throw new Error(BaseMessages.NoMoney);
              }
              if (table.dealer?.hand[0].rank !== Rank.Ace) {
                throw new Error(BaseMessages.ProhibitedAction);
              }
              player.insurance();
              break;

            case ActionType.SkipInsurance:
              player.insurance(0);
              break;
          }

          console.info(
            `${SocketEmit.ActionMade} ${player.parentPlayer?.id}  ${actionType}`
          );
          //send
          this.io
            .to(table.id)
            .emit(SocketEmit.ActionMade, JSON.stringify(table), actionType);

          if (
            table.dealer &&
            table.currentPlayerIndex === table.playingPlayers.length
          ) {
            /*Dealers round*/
            while (table.dealer.canHit) {
              table.dealer.hand.push(table.draw());

              console.info(`${SocketEmit.ActionMade} by dealer ${table.id}`);
              //send
              this.io
                .to(table.id)
                .emit(
                  SocketEmit.DealerMadeAction,
                  JSON.stringify(table),
                  ActionType.Hit
                );
            }

            table.countWinnings();

            console.info(SocketEmit.WinnersCounted);
            //send
            this.io
              .to(table.id)
              .emit(SocketEmit.WinnersCounted, JSON.stringify(table));
            table.currentPlayerIndex = null;
          }
        } catch (error) {
          this.handleError(error, socket);

          //чтобы на клиенте разблокировались кнопки
          const table = this.tables[tableId];
          if (table) {
            this.io
              .to(table.id)
              .emit(SocketEmit.ActionMade, JSON.stringify(table));
          }
        }
      }
    );

    socket.on(
      SocketOn.TopupBalance,
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

          player.increaseBalance(+balance);

          console.info(
            `${SocketEmit.BalanceToppedUp} to ${player.balance} for ${player.id}`
          );
          //send
          socket.emit(SocketEmit.BalanceToppedUp, JSON.stringify(player));
          socket.emit(SocketEmit.Message, 'Balance successfully topped up!');
        } catch (error) {
          this.handleError(error, socket);
        }
      }
    );
    socket.on(SocketOn.ChatSendMessage, (tableId, messageStr) => {
      try {
        const message = JSON.parse(messageStr) as IMessage;
        const table = this.tables[tableId];

        if (!table) {
          throw new Error(BaseMessages.NoTable);
        }
        let chat = this.chats[tableId];

        if (!chat) {
          throw new Error(BaseMessages.ChatLost);
        }

        const newMessage = chat.addMessage(message);

        console.info(`Message ${table.id}`);
        //send
        socket.broadcast
          .to(tableId)
          .emit(SocketEmit.Message, newMessage.text.join('\n'), 'chat');
        socket.broadcast
          .to(table.id)
          .emit(SocketEmit.ChatServerMessage, JSON.stringify(newMessage));
        socket.emit(SocketEmit.ChatServerMessage, JSON.stringify(newMessage));
      } catch (error) {
        this.handleError(error, socket);
      }
    });
    socket.on(
      SocketOn.EndGame,
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
            case EndGameActions.NewBet:
              table.removeFakePlayers(player);
              break;
            case EndGameActions.Rebet:
              if (
                table.getPlayerBetChipsTotalWithChildren(player) <=
                player.balance
              ) {
                table.rebet(player);
              } else {
                table.removeFakePlayers(player);
                socket.emit(SocketEmit.Error, BaseMessages.NoMoney);
              }
              break;
          }
          table.roundIsStarted = false;
          this.io
            .to(table.id)
            .emit(SocketEmit.GameEnded, JSON.stringify(table));
        } catch (error) {
          this.handleError(error, socket);
        }
      }
    );

    socket.on(SocketOn.Disconnect, () => {
      console.info(`Disconnect received from: ${socket.id}`);
      try {
        let player: Player | undefined;
        let table: Table | undefined;
        for (const key_id in this.tables) {
          if (this.tables[key_id].players) {
            table = this.tables[key_id];
            if (table) {
              player = this.findPlayerById(socket.id, table);
              if (player) {
                break;
              }
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

          console.info(`${SocketEmit.DisconnectPlayer}  ${socket.id}`);
          //sent
          socket.broadcast
            .to(table.id)
            .emit(SocketEmit.Message, `${player.name} left`);
          socket.broadcast
            .to(table.id)
            .emit(SocketEmit.DisconnectPlayer, JSON.stringify(table));
        }
      } catch (error) {
        this.handleError(error, socket);
      }
    });
  };

  private handleError = (error: unknown, socket: MySocket): void => {
    if (error instanceof Error) {
      console.info(error);
      socket.emit(SocketEmit.Error, error.message);
    } else {
      console.info('An unknown error occurred');
      socket.emit(SocketEmit.Error, BaseMessages.SmthWentWrong);
    }
  };

  private findPlayerById = (
    playerId: string,
    table: Table
  ): Player | undefined => {
    return table.allPlayers.find((player) => player.id === playerId);
  };
}
