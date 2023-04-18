import { makeObservable } from 'mobx';
import { observable } from 'mobx';
import { computed } from 'mobx';
import { action } from 'mobx';

import { isObjectsEqual } from '../utils/isObjectsEqual';
import { socket } from '../server/socket';
import { ModalTypes } from '../types.ds';
import { SocketOn } from '../types.ds';
import { IPlayer } from '../types.ds';
import { IModal } from '../types.ds';
import { ITable } from '../types.ds';
import { IChat } from '../types.ds';
import { Dealer } from './dealer';
import { Player } from './player';
import { Table } from './table';
import { Card } from './card';
import { Chat } from './chat';

export class Game {
  @observable public player: Player | null = null;
  @observable public table: Table | null = null;
  @observable public chat: Chat | null = null;
  @observable public modal: IModal = {
    type: ModalTypes.CreateOrJoin,
    hide: false,
  };

  public constructor() {
    makeObservable(this);

    socket.on(SocketOn.disconnectPlayer, (tableStr) =>
      this.handleTableUpdate(tableStr)
    );

    socket.on(SocketOn.betUpdate, (playersStr) =>
      this.updateAllPlayersArray(JSON.parse(playersStr))
    );
    socket.on(SocketOn.balanceToppedUp, (playerStr) => {
      const playerObj = JSON.parse(playerStr) as IPlayer;
      const player = this.findPlayerById(playerObj.id);
      if (player) {
        player.update(playerObj);
      }
    });

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

    socket.on(SocketOn.gameEnded, (tableStr) => {
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
      if (findedObjPlayer && !isObjectsEqual(player, findedObjPlayer)) {
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
      (card) => new Card(card.suit, card.rank, card.value)
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
