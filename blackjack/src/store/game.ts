import { ActionType } from '../types.ds';
import { Card } from './card';
import { Chat } from './chat';
import { Dealer } from './dealer';
import { EndGameActions } from '../types.ds';
import { IChat } from '../types.ds';
import { IModal } from '../types.ds';
import { IPlayer } from '../types.ds';
import { ITable } from '../types.ds';
import { ModalTypes } from '../types.ds';
import { Player } from './player';
import { SocketEmit } from '../types.ds';
import { SocketOn } from '../types.ds';
import { Table } from './table';

import { action } from 'mobx';
import { computed } from 'mobx';
import { makeObservable } from 'mobx';
import { observable } from 'mobx';
import { socket } from '../server/socket';
import { toast } from 'react-toastify';
import { toastSettings } from '../components/App/App.styled';

import equal from 'fast-deep-equal';

export class Game {
  @observable public player: Player | null = null;
  @observable public table: Table | null = null;
  @observable public chat: Chat | null = null;
  @observable public modal: IModal = {
    type: ModalTypes.CreateOrJoin,
    hide: false,
  };

  public emit = {
    [SocketEmit.ChatSendMessage]: (message: string): void => {
      if (this.table) {
        socket.emit(SocketEmit.ChatSendMessage, this.table?.id ?? '', message);
      }
    },
    [SocketEmit.TopupBalance]: (balance: number): void => {
      if (this.table && this.player) {
        socket.emit(
          SocketEmit.TopupBalance,
          balance,
          this.table.id,
          this.player.id
        );
      }
    },
    [SocketEmit.JoinTable]: (
      tableId: string,
      name: string,
      balance: number
    ): void => {
      socket.emit(SocketEmit.JoinTable, tableId, name, balance);
    },
    [SocketEmit.CreateTable]: (name: string, balance: number): void => {
      socket.emit(SocketEmit.CreateTable, name, balance);
    },
    [SocketEmit.EndGame]: (endGameAction: EndGameActions): void => {
      socket.emit(
        SocketEmit.EndGame,
        this.table?.id,
        this.player?.id,
        endGameAction
      );
    },
    [SocketEmit.Deal]: (): void => {
      socket.emit(SocketEmit.Deal, this.table?.id);
    },
    [SocketEmit.Action]: (actionType: ActionType): void => {
      socket.emit(
        SocketEmit.Action,
        actionType,
        this.table?.id,
        this.table?.currentPlayer?.id
      );
    },
    [SocketEmit.SetBet]: (spotId: string): void => {
      socket.emit(
        SocketEmit.SetBet,
        this.table?.id,
        spotId,
        this.player?.id,
        this.table?.currentBetBtnValue ?? 0
      );
    },
    [SocketEmit.RemoveBet]: (playerId: string, betIndex: number): void => {
      socket.emit(SocketEmit.RemoveBet, this.table?.id, playerId, betIndex);
    },
  };

  public constructor() {
    makeObservable(this);

    socket.on(SocketOn.Error, (message) => toast.error(message, toastSettings));

    socket.on(SocketOn.Message, (message) => toast(message, toastSettings));

    socket.on(SocketOn.TableJoined, (table) => {
      this.onTableJoined(JSON.parse(table));
      this.modalUpdate(true);
    });

    socket.on(SocketOn.DisconnectPlayer, (tableStr) =>
      this.handleTableUpdate(tableStr)
    );

    socket.on(SocketOn.BetUpdate, (playersStr) =>
      this.updateAllPlayersArray(JSON.parse(playersStr))
    );
    socket.on(SocketOn.BalanceToppedUp, (playerStr) => {
      const playerObj = JSON.parse(playerStr) as IPlayer;
      const player = this.findPlayerById(playerObj.id);
      if (player) {
        player.update(playerObj);
      }
    });

    socket.on(SocketOn.Dealt, (tableStr) => {
      this.handleTableUpdate(tableStr);
      if (
        this.table?.currentPlayer?.isBJ ||
        this.table?.currentPlayer?.isBust ||
        this.table?.currentPlayer?.isNaturalBJ
      ) {
        this.emit[SocketEmit.Action](ActionType.Stand);
      }
    });

    socket.on(SocketOn.ActionMade, (tableStr) => {
      this.handleTableUpdate(tableStr);
      if (
        this.table?.currentPlayer?.isBJ ||
        this.table?.currentPlayer?.isBust ||
        this.table?.currentPlayer?.isNaturalBJ
      ) {
        this.emit[SocketEmit.Action](ActionType.Stand);
      }
    });

    socket.on(SocketOn.DealerMadeAction, (tableStr) =>
      this.handleTableUpdate(tableStr)
    );

    socket.on(SocketOn.WinnersCounted, (tableStr) =>
      this.handleTableUpdate(tableStr)
    );

    socket.on(SocketOn.GameEnded, (tableStr) => {
      this.handleTableUpdate(tableStr);
      if (
        this.table?.dealer &&
        !this.table?.roundIsStarted &&
        this.player?.handIsEmpty
      ) {
        this.table.dealer = null;
      }
      if (this.player?.handIsEmpty) {
        this.modalUpdate(true);
      }
    });
  }

  @computed public get gameIsReady(): boolean {
    return !!(this.player && this.table);
  }

  @action.bound public onTableCreated(
    table: ITable,
    player: IPlayer,
    chat: IChat
  ): void {
    this.table = new Table(table.id);
    this.chat = new Chat();
    this.updateTableInfo(table);
    this.player = this.findPlayerById(player.id) ?? null;

    chat.messages.forEach((message) => {
      this.chat?.addMessage(message);
    });
  }

  @action.bound public onTableJoined(table: ITable): void {
    this.updateAllPlayersArray(table.allPlayers);
  }

  @action.bound public modalUpdate(
    hide: boolean,
    type = this.modal.type
  ): void {
    this.modal.type = type;
    this.modal.hide = hide;
  }

  public findPlayerById(playerId: string): Player | undefined {
    const table = this.table;
    return table
      ? table.allPlayers.find((player) => player.id === playerId)
      : undefined;
  }

  public getNameBySpotId(id: string): string {
    const spot = this.table?.spots[id];
    if (spot) {
      const spotParent = spot ? spot[0].parentPlayer : undefined;
      const name = spotParent ? spotParent.name : '';
      return name;
    } else {
      return '';
    }
  }

  private handleTableUpdate(tableStr: string) {
    const table = JSON.parse(tableStr) as ITable;
    this.updateTableInfo(table);
  }

  @action.bound private updateAllPlayersArray(source: IPlayer[]) {
    const target: IPlayer[] = JSON.parse(
      JSON.stringify(this.table?.allPlayers)
    ) as IPlayer[];

    source.forEach((player) => {
      const findedObjPlayer = target.find(
        (findedPlayer) => findedPlayer.id === player.id
      );
      if (findedObjPlayer && !equal(player, findedObjPlayer)) {
        const realPlayer = this.findPlayerById(findedObjPlayer.id);
        realPlayer?.update(player);
      } else if (!findedObjPlayer) {
        const index = source.indexOf(player);
        const newPlayer = this.table?.addPlayer(player);
        if (newPlayer) {
          this.table?.allPlayers.splice(-1);
          this.table?.allPlayers.splice(index, 0, newPlayer);
        }
      }
      if (target.length > source.length) {
        target
          .filter(
            (targetPlayer) =>
              !source.find(
                (findedPlayer) => findedPlayer.id === targetPlayer.id
              )
          )
          .map((targetPlayer) => {
            const realPlayer = this.findPlayerById(targetPlayer.id);
            if (realPlayer) {
              this.table?.playerRemove(realPlayer);
            }
          });
      }
    });
  }

  private updateTableInfo(table: ITable) {
    const dealerHand = table.dealer?.hand.map(
      (card) => new Card(card.suit, card.rank, card.value, card.id)
    );

    let dealer: Dealer | null;
    if (!table.dealer) {
      dealer = null;
    } else if (this.table?.dealer) {
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
      this.table.roundIsStarted = table.roundIsStarted;
      this.table.currentPlayerIndex = table.currentPlayerIndex;
      this.updateAllPlayersArray(table.allPlayers);
    }
  }
}

export const game = new Game();
