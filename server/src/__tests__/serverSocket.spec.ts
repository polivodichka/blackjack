/* eslint-disable @typescript-eslint/ban-ts-comment */
import http from 'http';

import { ServerSocket } from '../serverSocket';
import { EndGameActions } from '../types.ds';
import { BaseMessages } from '../types.ds';
import { Dealer } from '../models/dealer';
import { Player } from '../models/player';
import { mockedDeck } from './mockedDeck';
import { ActionType } from '../types.ds';
import { SocketEmit } from '../types.ds';
import { Table } from '../models/table';
import { IMessage } from '../types.ds';
import { Chat } from '../models/chat';

/* eslint-disable @typescript-eslint/dot-notation */


/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */

describe('ServerSocket', () => {
  let serverSocket: ServerSocket;
  let httpServer: http.Server;
  let mockSocket1: any;
  let mockSocket2: any;
  let mockSocket3: any;

  beforeAll(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {});

    httpServer = http.createServer();
    serverSocket = new ServerSocket(httpServer);
    serverSocket.io.to = jest.fn().mockReturnValue({
      emit: jest.fn(),
    });
    httpServer.listen(8080);
    mockSocket1 = {
      id: 'testSocketId1',
      join: jest.fn(),
      emit: jest.fn(),
      on: jest.fn(),
      broadcast: {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      },
    };
    mockSocket2 = {
      id: 'testSocketId2',
      join: jest.fn(),
      emit: jest.fn(),
      on: jest.fn(),
      broadcast: {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      },
    };
    mockSocket3 = {
      id: 'testSocketId3',
      join: jest.fn(),
      emit: jest.fn(),
      on: jest.fn(),
      broadcast: {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      },
    };
  });

  afterAll(() => {
    httpServer.close();
  });

  describe('StartListeners', () => {
    it('should set up event listeners on the socket', () => {
      //@ts-ignore
      serverSocket.startListeners(mockSocket1);
      expect(mockSocket1.on).toHaveBeenCalledTimes(10);
    });
  });

  describe('CreateTable', () => {
    const name = 'testPlayer1';
    const balance = 1000;
    let table: Table;
    let player: Player;
    let chat: Chat;

    beforeAll(async () => {
      //@ts-ignore
      serverSocket.startListeners(mockSocket1);
      await mockSocket1.on.mock.calls[0][1](name, balance);
      table = Object.values(serverSocket.tables)[0];
      player = table.allPlayers[0];
      chat = Object.values(serverSocket.chats)[0];
    });

    it('should create a new table and add it to the tables list', () => {
      expect(table).toBeDefined();
      expect(Object.values(serverSocket.tables)).toHaveLength(1);
    });

    it('should create a new player and add it to the table', () => {
      expect(player).toBeDefined();
      expect(player.id).toBe(mockSocket1.id);
      expect(player.tableId).toBe(table.id);
      expect(table.allPlayers).toHaveLength(1);
      expect(player.balance).toBe(balance);
      expect(player.name).toBe(
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
      );
    });
    it('should create a new chat without messages and add it to the chats list', () => {
      expect(chat).toBeDefined();
      expect(Object.values(serverSocket.chats)).toHaveLength(1);
      expect(chat.messages).toHaveLength(0);
    });
    it('should join the socket to the table room', () => {
      expect(mockSocket1.join).toHaveBeenCalledWith(table.id);
    });

    it('should emit the TableCreated event', () => {
      expect(mockSocket1.emit).toHaveBeenCalledWith(
        SocketEmit.TableCreated,
        JSON.stringify(table),
        JSON.stringify(player),
        JSON.stringify(chat)
      );
    });
  });

  describe('JoinTable', () => {
    let table: Table;
    let player: Player;
    let chat: Chat;

    it('should add a player to the specified table', async () => {
      const name = 'testPlayer2';
      const balance = 100;
      //@ts-ignore
      serverSocket.startListeners(mockSocket2);

      table = Object.values(serverSocket.tables)[0];
      const initialPlayerCount: number = table.allPlayers.length;

      await mockSocket2.on.mock.calls[1][1](table.id, name, balance);

      player = table.allPlayers[initialPlayerCount];
      chat = serverSocket.chats[table.id];

      expect(table.allPlayers).toHaveLength(initialPlayerCount + 1);
      expect(player.id).toBe(mockSocket2.id);
      expect(player.name).toBe(
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
      );
      expect(player.balance).toBe(balance);
    });

    it('should emit the TableJoined event to other players', () => {
      expect(mockSocket2.broadcast.to(table.id).emit).toHaveBeenCalledWith(
        SocketEmit.TableJoined,
        JSON.stringify(table)
      );
    });

    it('should emit the TableCreated event to this player', () => {
      expect(mockSocket2.emit).toHaveBeenCalledWith(
        SocketEmit.TableCreated,
        JSON.stringify(table),
        JSON.stringify(player),
        JSON.stringify(chat)
      );
    });

    it('should throw an error if table is not found', async () => {
      const name = 'testPlayer3';
      const balance = 200;
      //@ts-ignore
      serverSocket.startListeners(mockSocket3);

      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');

      await mockSocket3.on.mock.calls[1][1]('fakeId', name, balance);

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error(BaseMessages.NoTable),
        mockSocket3
      );

      spyHandleError.mockRestore();
    });

    it("shouldn't add player if table is not fount", () => {
      const initialPlayerCount: number = table.allPlayers.length;

      expect(table.allPlayers).toHaveLength(initialPlayerCount);
      //@ts-ignore
      expect(serverSocket.findPlayerById(mockSocket3.id, table)).not
        .toBeDefined;
    });
  });

  describe('SetBet', () => {
    let table: Table;
    let player1: Player;
    let player2: Player;

    beforeAll(() => {
      table = Object.values(serverSocket.tables)[0];
      //@ts-ignore
      player1 = serverSocket.findPlayerById(mockSocket1.id, table)!;
      //@ts-ignore
      player2 = serverSocket.findPlayerById(mockSocket2.id, table)!;
    });

    it('should add a player with bet and with correct parent to the specified table', async () => {
      const amount = 100;
      const amount2 = 40;
      const initialPlayerCount = table.allPlayers.length;
      const initialPlayerBalance1 = player1.balance;
      const initialPlayerBalance2 = player2.balance;

      await mockSocket1.on.mock.calls[2][1](
        table.id,
        'spot-1',
        player1.id,
        amount
      );
      await mockSocket1.on.mock.calls[2][1](
        table.id,
        'spot-1',
        player1.id,
        amount
      );
      await mockSocket1.on.mock.calls[2][1](
        table.id,
        'spot-2',
        player2.id,
        amount2
      );
      await mockSocket1.on.mock.calls[2][1](
        table.id,
        'spot-3',
        player2.id,
        player2.balance
      );

      const newPlayer1_1 = table.allPlayers[initialPlayerCount];

      const newPlayer2_1 = table.allPlayers[initialPlayerCount + 1];
      const newPlayer2_2 = table.allPlayers[initialPlayerCount + 2];

      expect(newPlayer1_1).toBeDefined();
      expect(newPlayer1_1.parentPlayer).toBe(player1);

      expect(newPlayer2_1).toBeDefined();
      expect(newPlayer2_1.parentPlayer).toBe(player2);

      expect(newPlayer2_2).toBeDefined();
      expect(newPlayer2_2.parentPlayer).toBe(player2);

      expect(table.allPlayers).toHaveLength(initialPlayerCount + 3);
      expect(player1.balance).toBe(initialPlayerBalance1 - amount * 2);
      expect(player2.balance).toBe(0);
      expect(table.getPlayerBetChipsTotalWithChildren(player2)).toBe(
        initialPlayerBalance2
      );
      expect(newPlayer1_1.betChips).toHaveLength(2);
      expect(newPlayer1_1.betChipsTotal).toBe(amount * 2);
    });

    it('should emit the BetUpdate event to all players', () => {
      expect(serverSocket.io.to(table.id).emit).toHaveBeenCalledWith(
        SocketEmit.BetUpdate,
        JSON.stringify(table.allPlayers)
      );
    });

    it('should throw an error if table is not found', async () => {
      const amount = 100;
      const spotId = 'spot-1';
      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');
      const initialPlayerCount = table.allPlayers.length;
      const initialPlayerBalance = player1.balance;

      await mockSocket1.on.mock.calls[2][1](
        'fakeTableId',
        spotId,
        player1?.id,
        amount
      );

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error(BaseMessages.NoTable),
        mockSocket1
      );
      expect(table.allPlayers).toHaveLength(initialPlayerCount);
      expect(player1.balance).toBe(initialPlayerBalance);

      spyHandleError.mockRestore();
    });

    it('should throw an error if player is not found', async () => {
      const amount = 100;
      const spotId = 'spot-1';
      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');
      const initialPlayerCount = table.allPlayers.length;
      const initialPlayerBalance = player1.balance;

      await mockSocket1.on.mock.calls[2][1](
        table.id,
        spotId,
        'fakePlayerId',
        amount
      );

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error(BaseMessages.PlayerLost),
        mockSocket1
      );
      expect(table.allPlayers).toHaveLength(initialPlayerCount);
      expect(player1.balance).toBe(initialPlayerBalance);

      spyHandleError.mockRestore();
    });

    it('should throw an error if bet amount is bigger than balance', async () => {
      const amount = player1.balance + 100;
      const spotId = 'spot-1';
      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');
      const initialPlayerCount = table.allPlayers.length;
      const initialPlayerBalance = player1.balance;

      await mockSocket1.on.mock.calls[2][1](
        table.id,
        spotId,
        player1.id,
        amount
      );

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error(BaseMessages.NoMoney),
        mockSocket1
      );
      expect(table.allPlayers).toHaveLength(initialPlayerCount);
      expect(player1.balance).toBe(initialPlayerBalance);

      spyHandleError.mockRestore();
    });
  });

  describe('RemoveBet', () => {
    let table: Table;
    let fakePlayer1: Player;
    let fakePlayer2: Player;

    beforeAll(() => {
      table = Object.values(serverSocket.tables)[0];
      fakePlayer1 = table.allPlayers.find(
        (player) => player.parentPlayer?.id === mockSocket1.id
      )!;
      fakePlayer2 = table.allPlayers.find(
        (player) => player.parentPlayer?.id === mockSocket2.id
      )!;
    });

    it('should correctly remove bet', async () => {
      const parent = fakePlayer1.parentPlayer!;
      const amount = 100;
      const initialPlayerCount = table.allPlayers.length;
      const initialPlayerBalance = parent.balance;

      await mockSocket1.on.mock.calls[3][1](table.id, fakePlayer1.id, 1);

      expect(parent.balance).toBe(initialPlayerBalance + amount);
      expect(table.allPlayers).toHaveLength(initialPlayerCount);
      expect(fakePlayer1.betChips).toHaveLength(1);
      expect(fakePlayer1.betChipsTotal).toBe(amount);
    });

    it('should remove fake player if they have no bets', async () => {
      const parent = fakePlayer2.parentPlayer!;
      const amount = 40;
      const initialPlayerCount = table.allPlayers.length;
      const initialPlayerBalance = parent.balance;

      await mockSocket2.on.mock.calls[3][1](table.id, fakePlayer2.id, 0);

      expect(parent.balance).toBe(initialPlayerBalance + amount);
      expect(table.allPlayers).toHaveLength(initialPlayerCount - 1);
      expect(
        table.allPlayers.find((player) => player.id === fakePlayer2.id)
      ).toBeUndefined();
    });

    it('should emit the BetUpdate event to all players', () => {
      expect(serverSocket.io.to(table.id).emit).toHaveBeenCalledWith(
        SocketEmit.BetUpdate,
        JSON.stringify(table.allPlayers)
      );
    });

    it('should throw an error if table is not found', async () => {
      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');
      const initialPlayerCount = table.allPlayers.length;
      const initialPlayerBalance = fakePlayer1.parentPlayer!.balance;

      await mockSocket2.on.mock.calls[3][1]('fakeTableId', fakePlayer1.id, 0);

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error(BaseMessages.NoTable),
        mockSocket2
      );
      expect(table.allPlayers).toHaveLength(initialPlayerCount);
      expect(fakePlayer1.parentPlayer!.balance).toBe(initialPlayerBalance);

      spyHandleError.mockRestore();
    });

    it('should throw an error if player is not found', async () => {
      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');
      const initialPlayerCount = table.allPlayers.length;
      const initialPlayerBalance = fakePlayer1.parentPlayer!.balance;

      await mockSocket1.on.mock.calls[3][1](table.id, 'fakePlayerId', 0);

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error(BaseMessages.PlayerLost),
        mockSocket1
      );
      expect(table.allPlayers).toHaveLength(initialPlayerCount);
      expect(fakePlayer1.parentPlayer!.balance).toBe(initialPlayerBalance);

      spyHandleError.mockRestore();
    });
  });

  describe('Deal', () => {
    let table: Table;
    let player1: Player;
    let player2: Player;
    let fakePlayer1: Player;
    let fakePlayer2: Player;
    let dealer: Dealer | null;

    beforeAll(() => {
      table = Object.values(serverSocket.tables)[0];

      //@ts-ignore
      player1 = serverSocket.findPlayerById(mockSocket1.id, table)!;
      //@ts-ignore
      player2 = serverSocket.findPlayerById(mockSocket2.id, table)!;

      fakePlayer1 = table.allPlayers.find(
        (player) => player.parentPlayer?.id === mockSocket1.id
      )!;
      fakePlayer2 = table.allPlayers.find(
        (player) => player.parentPlayer?.id === mockSocket2.id
      )!;
      dealer = table.dealer;
    });

    it('should throw an error if there are no bets at all', async () => {
      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');
      jest.spyOn(table, 'spots', 'get').mockReturnValueOnce({});

      await mockSocket2.on.mock.calls[4][1](table.id);

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error(BaseMessages.ProhibitedAction),
        mockSocket2
      );

      spyHandleError.mockRestore();
    });

    it('should not deal if table is not found', async () => {
      await mockSocket2.on.mock.calls[4][1]('fakeTableId');

      expect(dealer).toBeNull();
      expect(fakePlayer1.hand).toHaveLength(0);
      expect(fakePlayer2.hand).toHaveLength(0);
    });

    it('should throw an error if table is not found', async () => {
      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');

      await mockSocket2.on.mock.calls[4][1]('fakeTableId');

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error(BaseMessages.NoTable),
        mockSocket2
      );

      spyHandleError.mockRestore();
    });

    it('should deal cards to players with bets and dealer', async () => {
      table['shuffleDeck'] = jest.fn(() => {
        table['deck'] = mockedDeck;
      });

      await mockSocket1.on.mock.calls[4][1](table.id);
      dealer = table.dealer;

      expect(dealer).not.toBeNull();
      expect(fakePlayer1.hand).toHaveLength(2);
      expect(fakePlayer2.hand).toHaveLength(2);
      dealer && expect(dealer.hand).toHaveLength(1);
    });

    it('should not deal cards to players without bets', () => {
      expect(player1.hand).toHaveLength(0);
      expect(player2.hand).toHaveLength(0);
    });

    it('should emit the Dealt event to all players', () => {
      expect(serverSocket.io.to(table.id).emit).toHaveBeenCalledWith(
        SocketEmit.Dealt,
        JSON.stringify(table)
      );
    });
  });

  describe('Action', () => {
    let table: Table;

    beforeAll(() => {
      table = Object.values(serverSocket.tables)[0];
    });
    beforeEach(() => {
      (serverSocket.io.to(table.id).emit as jest.Mock).mockReset();
    });

    it("should throw an error if player doesn't exist", async () => {
      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');

      await mockSocket1.on.mock.calls[5][1](
        ActionType.Hit,
        table.id,
        'fakePlayerId'
      );

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error(BaseMessages.PlayerLost),
        mockSocket1
      );

      spyHandleError.mockRestore();
    });

    it("should throw an error if table doesn't exist", async () => {
      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');

      await mockSocket1.on.mock.calls[5][1](
        ActionType.Hit,
        'fakeTableId',
        table.playingPlayers[1].id
      );

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error(BaseMessages.NoTable),
        mockSocket1
      );

      spyHandleError.mockRestore();
    });

    it("should throw an error if user can't make an action", async () => {
      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');
      const player = table.playingPlayers[1];
      const initialBalance = player.parentPlayer!.balance;

      await mockSocket2.on.mock.calls[5][1](
        ActionType.Double,
        table.id,
        player.id
      );

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error(BaseMessages.ProhibitedAction),
        mockSocket2
      );
      expect(player.parentPlayer!.balance).toBe(initialBalance);

      spyHandleError.mockRestore();
    });

    it('should insurance', async () => {
      const player = table.playingPlayers[table.currentPlayerIndex!];
      const spyInsurance = jest.spyOn(player, 'insurance');

      await mockSocket1.on.mock.calls[5][1](
        ActionType.Insurance,
        table.id,
        player.id
      );

      expect(spyInsurance).toHaveBeenCalledTimes(1);
      expect(player.insuranceBet).toBe(player.betChipsTotal / 2);
      expect(player.hand).toHaveLength(2);
      expect(table.currentPlayer?.id).toBe(player.id);
      expect(serverSocket.io.to(table.id).emit).toHaveBeenCalledWith(
        SocketEmit.ActionMade,
        JSON.stringify(table),
        ActionType.Insurance
      );
    });

    it('should split', async () => {
      const player = table.playingPlayers[0];
      const initialPlayerCount = table.playingPlayers.length;
      const spySplit = jest.spyOn(table, 'split');

      await mockSocket2.on.mock.calls[5][1](
        ActionType.Split,
        table.id,
        player.id
      );

      const child = table.playingPlayers.find(
        (p) => p.parentAfterSplitPlayer?.id === player.id
      );

      expect(spySplit).toHaveBeenCalledTimes(1);
      expect(child).toBeDefined();
      expect(table.playingPlayers).toHaveLength(3);
      expect(player.hand).toHaveLength(2);
      expect(table.playingPlayers).toHaveLength(initialPlayerCount + 1);
      child && expect(child.hand).toHaveLength(2);
      child && expect(table.currentPlayer?.id).toBe(child.id);
      expect(serverSocket.io.to(table.id).emit).toHaveBeenCalledWith(
        SocketEmit.ActionMade,
        JSON.stringify(table),
        ActionType.Split
      );
    });

    it('should hit', async () => {
      const player = table.playingPlayers[table.currentPlayerIndex!];
      const spyHit = jest.spyOn(table, 'hit');

      await mockSocket2.on.mock.calls[5][1](
        ActionType.Hit,
        table.id,
        player.id
      );

      expect(spyHit).toHaveBeenCalledTimes(1);
      expect(player.hand).toHaveLength(3);
      expect(player.handTotal).toBe(8);
      expect(player.hand.map((card) => card.value)).toEqual(
        expect.arrayContaining([2, 3, 3])
      );
      expect(serverSocket.io.to(table.id).emit).toHaveBeenCalledWith(
        SocketEmit.ActionMade,
        JSON.stringify(table),
        ActionType.Hit
      );

      spyHit.mockRestore();
    });

    it('should double and stand after double', async () => {
      //prep
      let player = table.playingPlayers[table.currentPlayerIndex!];
      let spyStand = jest.spyOn(table, 'stand');
      const spyHit = jest.spyOn(table, 'hit');

      await mockSocket2.on.mock.calls[5][1](
        ActionType.Hit,
        table.id,
        player.id
      );
      await mockSocket2.on.mock.calls[5][1](
        ActionType.Hit,
        table.id,
        player.id
      );
      await mockSocket2.on.mock.calls[5][1](
        ActionType.Stand,
        table.id,
        player.id
      );

      spyStand.mockRestore();

      //test
      player = table.playingPlayers[table.currentPlayerIndex!];
      spyStand = jest.spyOn(table, 'stand');
      const spyDouble = jest.spyOn(table, 'double');
      const initialPlayerBet = player.betChipsTotal;
      const initialPlayerBalance = player.parentPlayer!.balance;

      await mockSocket2.on.mock.calls[5][1](
        ActionType.Double,
        table.id,
        player.id
      );

      expect(spyStand).toHaveBeenCalledTimes(1);
      expect(spyDouble).toHaveBeenCalledTimes(1);
      expect(player.hand).toHaveLength(3);
      expect(player.handTotal).toBe(9);
      expect(player.hand.map((card) => card.value)).toEqual(
        expect.arrayContaining([2, 3, 4])
      );
      expect(player.parentPlayer?.balance).toBe(
        initialPlayerBalance - initialPlayerBet
      );
      expect(player.betChipsTotal).toBe(initialPlayerBet * 2);
      expect(table.currentPlayer?.id).not.toBe(player.id);
      expect(serverSocket.io.to(table.id).emit).toHaveBeenCalledWith(
        SocketEmit.ActionMade,
        JSON.stringify(table),
        ActionType.Double
      );
    });

    it('should skip insurance', async () => {
      const player = table.playingPlayers[table.currentPlayerIndex!];
      const spyInsurance = jest.spyOn(player, 'insurance');

      await mockSocket1.on.mock.calls[5][1](
        ActionType.SkipInsurance,
        table.id,
        player.id
      );

      expect(spyInsurance).toHaveBeenCalledTimes(1);
      expect(player.insuranceBet).toBe(0);
      expect(player.hand).toHaveLength(2);
      expect(table.currentPlayer?.id).toBe(player.id);
      expect(serverSocket.io.to(table.id).emit).toHaveBeenCalledWith(
        SocketEmit.ActionMade,
        JSON.stringify(table),
        ActionType.SkipInsurance
      );

      spyInsurance.mockRestore();
    });

    it('should throw an error if user have not enaugh money for action', async () => {
      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');
      const player = table.playingPlayers[table.currentPlayerIndex!];
      const initialBalance = player.parentPlayer!.balance;
      const initialPlayerBet = player.betChipsTotal;

      await mockSocket2.on.mock.calls[5][1](
        ActionType.Double,
        table.id,
        player.id
      );

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error(BaseMessages.NoMoney),
        mockSocket2
      );
      expect(player.parentPlayer!.balance).toBe(initialBalance);
      expect(player.hand.length).toBe(2);
      expect(player.betChipsTotal).toBe(initialPlayerBet);

      spyHandleError.mockRestore();
    });
  });

  describe('Dealer actions', () => {
    let table: Table;
    let dealer: Dealer;

    beforeAll(() => {
      table = Object.values(serverSocket.tables)[0];
      dealer = table.dealer!;
    });
    beforeEach(() => {
      (serverSocket.io.to(table.id).emit as jest.Mock).mockReset();
    });

    it('should run automatically if players rounds are ended', async () => {
      const spyStand = jest.spyOn(table, 'stand');
      const spyHandPush = jest.spyOn(dealer.hand, 'push');
      const spyCountWinnings = jest.spyOn(table, 'countWinnings');
      const spySend = jest.spyOn(serverSocket.io.to(table.id), 'emit');
      const callStack: string[][] = [];
      spySend.mockImplementation(
        (
          eventName: SocketEmit,
          ...args: (string | ActionType | undefined)[]
        ) => {
          const cleanedArgs = args.map((arg) => (arg === undefined ? '' : arg));
          callStack.push(cleanedArgs);
          return jest
            .requireActual('socket.io')(serverSocket.io)
            .to(table.id)
            .emit(eventName, ...cleanedArgs);
        }
      );

      const player = table.playingPlayers[table.currentPlayerIndex!];
      const initialBalance = player.parentPlayer!.balance;
      const initialPlayerBet = player.betChipsTotal;

      await mockSocket2.on.mock.calls[5][1](
        ActionType.Stand,
        table.id,
        player.id
      );

      expect(spyStand).toHaveBeenCalled();
      expect(player.parentPlayer!.balance).toBe(initialBalance);
      expect(player.hand.length).toBe(2);
      expect(player.betChipsTotal).toBe(initialPlayerBet);
      expect(table.currentPlayer).toBeNull();

      expect(spyHandPush).toBeCalledTimes(2);
      expect(dealer.hand).toHaveLength(3);
      expect(dealer.handTotal).toBe(19);
      expect(spyCountWinnings).toBeCalledTimes(1);

      expect(spySend).toHaveBeenCalledWith(
        SocketEmit.ActionMade,
        ...callStack[0]
      );

      expect(spySend).toHaveBeenCalledWith(
        SocketEmit.DealerMadeAction,
        ...callStack[1]
      );

      expect(spySend).toHaveBeenCalledWith(
        SocketEmit.DealerMadeAction,
        ...callStack[2]
      );

      expect(spySend).toHaveBeenCalledWith(
        SocketEmit.WinnersCounted,
        ...callStack[3]
      );
    });
  });

  describe('TopupBalance', () => {
    let table: Table;
    let player: Player;

    beforeAll(() => {
      table = Object.values(serverSocket.tables)[0];
      player = table.allPlayers[0];
      (mockSocket1.emit as jest.Mock).mockReset();
    });

    it('should throw an error if table is not found', async () => {
      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');

      await mockSocket1.on.mock.calls[6][1](0, 'fakeTableId', player.id);

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error(BaseMessages.NoTable),
        mockSocket1
      );
      spyHandleError.mockRestore();
    });

    it('should throw an error if player is not found', async () => {
      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');

      await mockSocket1.on.mock.calls[6][1](0, table.id, 'fakePlayerId');

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error(BaseMessages.PlayerLost),
        mockSocket1
      );
      spyHandleError.mockRestore();
    });

    it('should top up balance', async () => {
      //@ts-ignore
      const spySenf = jest.spyOn(serverSocket, 'handleError');
      const initialBalance = player.balance;
      const amount = 100;

      await mockSocket1.on.mock.calls[6][1](100, table.id, player.id);

      expect(mockSocket1.emit).toHaveBeenCalledWith(
        SocketEmit.BalanceToppedUp,
        JSON.stringify(player)
      );
      expect(player.balance).toBe(initialBalance + amount);
    });
  });

  describe('ChatSendMessage', () => {
    let table: Table;
    let chat: Chat;
    let message: IMessage;
    let spyChat: jest.SpyInstance<IMessage, [message: IMessage], any>;

    beforeAll(() => {
      table = Object.values(serverSocket.tables)[0];
      chat = serverSocket.chats[table.id];
      message = {
        id: 'messageId',
        text: ['HELLO world'],
        playerId: 'playerId',
        playerName: '1',
        time: '',
      };
      (mockSocket1.emit as jest.Mock).mockReset();
      (serverSocket.io.to(table.id).emit as jest.Mock).mockRestore();
      spyChat = jest.spyOn(chat, 'addMessage');
    });

    it('should throw an error if table is not found', async () => {
      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');
      await mockSocket1.on.mock.calls[7][1](
        'fakeTableId',
        JSON.stringify(message)
      );

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error(BaseMessages.NoTable),
        mockSocket1
      );
      spyHandleError.mockRestore();
    });

    it('should throw an error if chat is not found', async () => {
      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');
      const newTable = new Table();
      serverSocket.tables[newTable.id] = newTable;

      await mockSocket1.on.mock.calls[7][1](
        newTable.id,
        JSON.stringify(message)
      );

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error(BaseMessages.ChatLost),
        mockSocket1
      );
      spyHandleError.mockRestore();
    });

    it('should recieve message and add it to the chat', async () => {
      await mockSocket1.on.mock.calls[7][1](table.id, JSON.stringify(message));

      expect(chat.messages).toHaveLength(1);
      expect(chat.messages[0].text).toStrictEqual(message.text);
    });

    it('should add time to message', () => {
      expect(spyChat.mock.results[0].value.time).toMatch(
        /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d.\d{3}Z$/
      );
    });

    it('should send message to the client', () => {
      expect(mockSocket1.broadcast.to(table.id).emit).toBeCalledWith(
        SocketEmit.Message,
        spyChat.mock.results[0].value.text.join('\n'),
        'chat'
      );
      expect(mockSocket1.broadcast.to(table.id).emit).toBeCalledWith(
        SocketEmit.ChatServerMessage,
        JSON.stringify(spyChat.mock.results[0].value)
      );
    });
  });

  describe('EndGame', () => {
    let table: Table;
    let player1: Player;
    let player2: Player;

    beforeAll(() => {
      table = Object.values(serverSocket.tables)[0];
      //@ts-ignore
      player1 = serverSocket.findPlayerById(mockSocket1.id, table)!;
      //@ts-ignore
      player2 = serverSocket.findPlayerById(mockSocket2.id, table)!;
    });

    it('should throw an error if table is not found', async () => {
      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');
      await mockSocket1.on.mock.calls[8][1](
        'fakeTableId',
        player1.id,
        EndGameActions.NewBet
      );

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error(BaseMessages.NoTable),
        mockSocket1
      );

      spyHandleError.mockRestore();
    });

    it('should throw an error if player is not found', async () => {
      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');
      await mockSocket1.on.mock.calls[8][1](
        table.id,
        'fakePlayerId',
        EndGameActions.NewBet
      );

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error(BaseMessages.PlayerLost),
        mockSocket1
      );

      spyHandleError.mockRestore();
    });

    it('should correctly reset on NewBet', async () => {
      const spyRemove = jest.spyOn(table, 'removeFakePlayers');
      await mockSocket1.on.mock.calls[8][1](
        table.id,
        player1.id,
        EndGameActions.NewBet
      );

      expect(spyRemove).toBeCalledWith(player1);
      expect(table.getPlayerBetChipsTotalWithChildren(player1)).toBe(0);
      expect(
        table.playingPlayers.filter(
          (p) =>
            p.parentPlayer?.id === player1.id ||
            p.parentAfterSplitPlayer?.id === player1.id
        )
      ).toHaveLength(0);
      spyRemove.mockRestore();
      expect(player1.roundIsEnded).toBeFalsy();
      expect(player2.roundIsEnded).toBeTruthy();
      expect(table.roundIsStarted).toBeFalsy();
    });

    it('should throw an error and reset if Rebet with small balance', async () => {
      const spyRemove = jest.spyOn(table, 'removeFakePlayers');
      await mockSocket2.on.mock.calls[8][1](
        table.id,
        player2.id,
        EndGameActions.NewBet
      );

      expect(spyRemove).toBeCalledWith(player2);
      expect(table.getPlayerBetChipsTotalWithChildren(player2)).toBe(0);
      expect(
        table.playingPlayers.filter(
          (p) =>
            p.parentPlayer?.id === player1.id ||
            p.parentAfterSplitPlayer?.id === player1.id
        )
      ).toHaveLength(0);

      expect(mockSocket2.emit).toHaveBeenCalledWith(
        SocketEmit.Error,
        BaseMessages.NoMoney
      );
      expect(player2.roundIsEnded).toBeFalsy();
    });

    it('should correctly rebet', async () => {
      //@ts-ignore
      player2.balance = 100;
      //@ts-ignore
      player1.balance = 100;

      await mockSocket1.on.mock.calls[2][1](table.id, 'spot-1', player1.id, 2);
      await mockSocket1.on.mock.calls[2][1](table.id, 'spot-1', player1.id, 2);
      await mockSocket1.on.mock.calls[2][1](table.id, 'spot-2', player2.id, 2);

      table.deal();

      table.playingPlayers.forEach(() => table.stand());

      (serverSocket.io.to(table.id).emit as jest.Mock).mockReset();
      const spyRebet = jest.spyOn(table, 'rebet');
      const initialPlayerBet =
        table.getPlayerBetChipsTotalWithChildren(player1);
      const initialPlayerCount = table.allPlayers.length;

      await mockSocket1.on.mock.calls[8][1](
        table.id,
        player1.id,
        EndGameActions.Rebet
      );

      expect(spyRebet).toBeCalledWith(player1);
      expect(table.getPlayerBetChipsTotalWithChildren(player1)).toBe(
        initialPlayerBet
      );
      expect(table.allPlayers).toHaveLength(initialPlayerCount);
      spyRebet.mockRestore();
      expect(table.roundIsStarted).toBeFalsy();

      expect(serverSocket.io.to(table.id).emit).toHaveBeenCalledWith(
        SocketEmit.GameEnded,
        JSON.stringify(table)
      );
    });
  });

  describe('Disconnect', () => {
    let table: Table;
    let player1: Player;
    let player2: Player;

    beforeAll(() => {
      table = Object.values(serverSocket.tables)[0];
      //@ts-ignore
      player1 = serverSocket.findPlayerById(mockSocket1.id, table)!;
      //@ts-ignore
      player2 = serverSocket.findPlayerById(mockSocket2.id, table)!;
    });

    it('should remove the player on disconnection', async () => {
      const spyPlayerRemove = jest.spyOn(table, 'playerRemove');
      const initialPlayerCount = table.allPlayers.length;
      const playerWithChildrenCount =
        1 +
        table.allPlayers.filter(
          (p) =>
            player1.id === p.parentPlayer?.id ||
            player1.id === p.parentAfterSplitPlayer?.id
        ).length;

      await mockSocket1.on.mock.calls[9][1]();

      expect(table.allPlayers.length).toBe(
        initialPlayerCount - playerWithChildrenCount
      );
      expect(spyPlayerRemove).toBeCalledWith(player1);
    });

    it('should throw an error if table or player is not found', async () => {
      //@ts-ignore
      const spyHandleError = jest.spyOn(serverSocket, 'handleError');
      await mockSocket1.on.mock.calls[9][1]();
      await mockSocket1.on.mock.calls[9][1]();

      expect(spyHandleError).toHaveBeenCalledWith(
        new Error('Problem on disconnection'),
        mockSocket1
      );
      expect(spyHandleError).toHaveBeenCalledTimes(2);

      spyHandleError.mockRestore();
    });

    it('should delete a table if all players disconnected', async () => {
      await mockSocket2.on.mock.calls[9][1]();
      await mockSocket3.on.mock.calls[9][1]();

      expect(serverSocket.tables[table.id]).toBeUndefined();
    });
  });
});
