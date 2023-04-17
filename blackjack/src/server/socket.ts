import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import { EndGameActions } from '../types.ds';
import { ActionType } from '../types.ds';
import { SocketEmit } from '../types.ds';
import { SocketOn } from '../types.ds';
import { TBet } from '../types.ds';

const socketWithoutTypes: Socket = io('http://localhost:5000');

interface SocketEventsOn {
  [SocketOn.tableCreated]: (table: string, player: string) => void;
  [SocketOn.tableJoined]: (table: string) => void;
  [SocketOn.disconnectPlayer]: (table: string) => void;
  [SocketOn.betUpdate]: (players: string) => void;
  [SocketOn.dealt]: (table: string) => void;
  [SocketOn.actionMade]: (table: string) => void;
  [SocketOn.dealerMadeAction]: (table: string) => void;
  [SocketOn.winnersCounted]: (table: string) => void;
  [SocketOn.gameEnded]: (table: string) => void;
  [SocketOn.error]: (message: string) => void;
  [SocketOn.message]: (message: string) => void;
  [SocketOn.balanceToppedUp]: (player: string) => void;
}

type SocketEventNamesOn = keyof SocketEventsOn;

interface SocketEventsEmit {
  [SocketEmit.join_table]: (
    table: string,
    name: string,
    balance: number,
    id?: string | undefined
  ) => void;
  [SocketEmit.create_table]: (name: string, balance: number) => void;
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
  [SocketEmit.topup_balance]: (
    balance: number,
    tableId: string,
    playerId: string,
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
