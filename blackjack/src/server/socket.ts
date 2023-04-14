import { io, Socket } from 'socket.io-client';
import { ActionType, EndGameActions, SocketEmit, SocketOn, TBet } from '../types.ds';

const socketWithoutTypes: Socket = io('http://localhost:5000');

interface SocketEventsOn {
  [SocketOn.tableCreated]: (player: string, table: string) => void;
  [SocketOn.tableJoined]: (table: string) => void;
  [SocketOn.disconnectPlayer]: (player: string) => void;
  [SocketOn.betUpdate]: (players: string) => void;
  [SocketOn.dealt]: (table: string) => void;
  [SocketOn.actionMade]: (table: string) => void;
  [SocketOn.dealerMadeAction]: (table: string) => void;
  [SocketOn.winnersCounted]: (table: string) => void;
  [SocketOn.gameEnded]: (table: string) => void;
}

type SocketEventNamesOn = keyof SocketEventsOn;

interface SocketEventsEmit {
  [SocketEmit.join_table]: (table: string) => void;
  [SocketEmit.create_table]: () => void;
  [SocketEmit.action]: (
    actionType: ActionType,
    tableId: string | undefined,
    playerId: string | undefined
  ) => void;
  [SocketEmit.deal]: (tableId: string | undefined) => void;
  [SocketEmit.end_game]: (
    tableId: string | undefined,
    playerId: string | undefined,
    endGameActionType: EndGameActions
  ) => void;
  [SocketEmit.remove_bet]: (
    tableId: string | undefined,
    playerId: string | undefined,
    betIndex: number
  ) => void;
  [SocketEmit.set_bet]: (
    tableId: string | undefined,
    spotId: string,
    playerId: string | undefined,
    bet: TBet
  ) => void;
}

type SocketEventNamesEmit = keyof SocketEventsEmit;

interface SocketWithTypedEvents<T extends keyof SocketEventsEmit> {
  on<E extends SocketEventNamesOn>(
    event: E,
    listener: SocketEventsOn[E]
  ): Socket;
  emit<E extends T>(event: E, ...args: Parameters<SocketEventsEmit[E]>): Socket;
}

export const socket: SocketWithTypedEvents<SocketEventNamesEmit> =
  socketWithoutTypes;
