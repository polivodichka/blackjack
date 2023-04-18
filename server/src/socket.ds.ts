import { ActionType } from './types.ds';
import { EndGameActions } from './types.ds';
import { Server } from 'socket.io';
import { Socket } from 'socket.io';
import { SocketEmit } from './types.ds';
import { SocketOn } from './types.ds';
import { TBet } from './types.ds';

interface SocketEventsEmit {
  [SocketEmit.tableCreated]: (
    table: string,
    player: string,
    chat: string
  ) => void;
  [SocketEmit.tableJoined]: (table: string) => void;
  [SocketEmit.disconnectPlayer]: (table: string) => void;
  [SocketEmit.betUpdate]: (players: string) => void;
  [SocketEmit.dealt]: (table: string) => void;
  [SocketEmit.actionMade]: (table: string) => void;
  [SocketEmit.dealerMadeAction]: (table: string) => void;
  [SocketEmit.winnersCounted]: (table: string) => void;
  [SocketEmit.gameEnded]: (table: string) => void;
  [SocketEmit.error]: (message: string) => void;
  [SocketEmit.message]: (message: string) => void;
  [SocketEmit.balanceToppedUp]: (player: string) => void;
  [SocketEmit.chatServerMessage]: (message: string) => void;
}

type SocketEventNamesEmit = keyof SocketEventsEmit;

interface SocketEventsOn {
  [SocketOn.join_table]: (
    table: string,
    name: string,
    balance: number,
    id?: string | undefined
  ) => void;
  [SocketOn.create_table]: (name: string, balance: number) => void;
  [SocketOn.action]: (
    actionType: ActionType,
    tableId: string | undefined,
    playerId: string | undefined
  ) => void;
  [SocketOn.deal]: (tableId: string | undefined) => void;
  [SocketOn.end_game]: (
    tableId: string | undefined,
    playerId: string | undefined,
    endGameActionType: EndGameActions
  ) => void;
  [SocketOn.remove_bet]: (
    tableId: string | undefined,
    playerId: string | undefined,
    betIndex: number
  ) => void;
  [SocketOn.set_bet]: (
    tableId: string,
    spotId: string,
    playerId: string,
    bet: TBet
  ) => void;
  [SocketOn.topup_balance]: (
    balance: number,
    tableId: string,
    playerId: string
  ) => void;
  [SocketOn.connect]: () => void;
  [SocketOn.disconnect]: () => void;
  [SocketOn.chat_send_message]: (tableId: string, message: string) => void;
}

type SocketEventNamesOn = keyof SocketEventsOn;

interface ServerWithTypedEvents<T extends keyof SocketEventsEmit> {
  on<E extends SocketEventNamesOn>(
    event: E,
    listener: SocketEventsOn[E]
  ): Server;
  emit<E extends T>(event: E, ...args: Parameters<SocketEventsEmit[E]>): void;
  to(room: string): {
    emit<E extends T>(event: E, ...args: Parameters<SocketEventsEmit[E]>): void;
  };
}

interface SocketWithTypedEvents<T extends keyof SocketEventsEmit> {
  emit<E extends T>(
    event: E,
    ...args: Parameters<SocketEventsEmit[E]>
  ): boolean;
  on<E extends SocketEventNamesOn>(
    event: E,
    listener: SocketEventsOn[E]
  ): Socket;
  broadcast: {
    to(room: string): {
      emit<E extends T>(
        event: E,
        ...args: Parameters<SocketEventsEmit[E]>
      ): void;
    };
  };
}

export type MyServer = ServerWithTypedEvents<SocketEventNamesEmit> & Server;
export type MySocket = SocketWithTypedEvents<SocketEventNamesEmit> & Socket;
