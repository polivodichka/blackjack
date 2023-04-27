import { Server } from 'socket.io';
import { Socket } from 'socket.io';

import { EndGameActions } from './types.ds';
import { ActionType } from './types.ds';
import { SocketEmit } from './types.ds';
import { SocketOn } from './types.ds';
import { TBet } from './types.ds';

export interface SocketEventsEmit {
  [SocketEmit.TableCreated]: (
    table: string,
    player: string,
    chat: string
  ) => void;
  [SocketEmit.TableJoined]: (table: string) => void;
  [SocketEmit.DisconnectPlayer]: (table: string) => void;
  [SocketEmit.BetUpdate]: (players: string) => void;
  [SocketEmit.Dealt]: (table: string) => void;
  [SocketEmit.ActionMade]: (table: string, actionType?: ActionType) => void;
  [SocketEmit.DealerMadeAction]: (
    table: string,
    actionType?: ActionType
  ) => void;
  [SocketEmit.WinnersCounted]: (table: string) => void;
  [SocketEmit.GameEnded]: (table: string) => void;
  [SocketEmit.Error]: (message: string) => void;
  [SocketEmit.Message]: (message: string, messageType?: 'chat') => void;
  [SocketEmit.BalanceToppedUp]: (player: string) => void;
  [SocketEmit.ChatServerMessage]: (message: string) => void;
}

export type SocketEventNamesEmit = keyof SocketEventsEmit;

export interface SocketEventsOn {
  [SocketOn.JoinTable]: (
    table: string,
    name: string,
    balance: number,
    id?: string | undefined
  ) => void;
  [SocketOn.CreateTable]: (name: string, balance: number) => void;
  [SocketOn.Action]: (
    actionType: ActionType,
    tableId: string | undefined,
    playerId: string | undefined
  ) => void;
  [SocketOn.Deal]: (tableId: string | undefined) => void;
  [SocketOn.EndGame]: (
    tableId: string | undefined,
    playerId: string | undefined,
    endGameActionType: EndGameActions
  ) => void;
  [SocketOn.RemoveBet]: (
    tableId: string | undefined,
    playerId: string | undefined,
    betIndex: number
  ) => void;
  [SocketOn.SetBet]: (
    tableId: string,
    spotId: string,
    playerId: string,
    bet: TBet
  ) => void;
  [SocketOn.TopupBalance]: (
    balance: number,
    tableId: string,
    playerId: string
  ) => void;
  [SocketOn.Connect]: () => void;
  [SocketOn.Disconnect]: () => void;
  [SocketOn.ChatSendMessage]: (tableId: string, message: string) => void;
}

export type SocketEventNamesOn = keyof SocketEventsOn;

export interface ServerWithTypedEvents<T extends keyof SocketEventsEmit> {
  on<E extends SocketEventNamesOn>(
    event: E,
    listener: SocketEventsOn[E]
  ): Server;
  emit<E extends T>(event: E, ...args: Parameters<SocketEventsEmit[E]>): void;
  to(room: string): {
    emit<E extends T>(event: E, ...args: Parameters<SocketEventsEmit[E]>): void;
  };
}

export interface SocketWithTypedEvents<T extends keyof SocketEventsEmit> {
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
