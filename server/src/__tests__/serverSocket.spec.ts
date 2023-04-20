/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import http from 'http';
import { Table } from '../models/table';
import { Chat } from '../models/chat';
import { Player } from '../models/player';
import { ServerSocket } from '../serverSocket';
import {
  ActionType,
  BaseMessages,
  SocketEmit,
  SuitCard,
  Rank,
} from '../types.ds';
import { Dealer } from '../models/dealer';
import { Card } from '../models/card';

describe('ServerSocket', () => {
  let serverSocket: ServerSocket;
  let httpServer: http.Server;
  let mockSocket1: any;
  let mockSocket2: any;
  let mockSocket3: any;

  beforeAll(() => {
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
      serverSocket.StartListeners(mockSocket1);
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
      serverSocket.StartListeners(mockSocket1);
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
      serverSocket.StartListeners(mockSocket2);

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
      serverSocket.StartListeners(mockSocket3);

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
      player1 = serverSocket.findPlayerById(mockSocket1.id, table)!;
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

      player1 = serverSocket.findPlayerById(mockSocket1.id, table)!;
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
        table['deck'] = mockDeck;
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

    it("should throw an error if player doesn't exist", async () => {
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
        JSON.stringify(table)
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
        JSON.stringify(table)
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
        JSON.stringify(table)
      );

      spyHit.mockRestore();
    });

    it('should stand if bust', async () => {
      const player = table.playingPlayers[table.currentPlayerIndex!];
      const spyStand = jest.spyOn(table, 'stand');
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

      expect(player.isBust).toBeTruthy();
      expect(spyStand).toHaveBeenCalledTimes(1);
      expect(spyHit).toHaveBeenCalledTimes(2);
      expect(player.hand).toHaveLength(5);
      expect(player.handTotal).toBe(22);
      expect(player.hand.map((card) => card.value)).toEqual(
        expect.arrayContaining([2, 3, 3, 10, 4])
      );
      expect(table.currentPlayer?.id).not.toBe(player.id);
      expect(serverSocket.io.to(table.id).emit).toHaveBeenCalledWith(
        SocketEmit.ActionMade,
        JSON.stringify(table)
      );

      spyHit.mockRestore();
      spyStand.mockRestore();
    });

    it('should double and stand after double', async () => {
      const player = table.playingPlayers[table.currentPlayerIndex!];
      const spyStand = jest.spyOn(table, 'stand');
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
        JSON.stringify(table)
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
        JSON.stringify(table)
      );

      spyInsurance.mockRestore();
    });

    it('should throw an error if user have not enaugh money for action', async () => {
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
      spySend.mockImplementation((eventName: SocketEmit, ...args: string[]) => {
        callStack.push(args);
        return jest
          .requireActual('socket.io')(serverSocket.io)
          .to(table.id)
          .emit(eventName, ...args);
      });

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
      console.log((serverSocket.io.to(table.id).emit as jest.Mock).mock.calls);

      expect(serverSocket.io.to(table.id).emit).toHaveBeenCalledWith(
        SocketEmit.ActionMade,
        ...callStack[0]
      );

      expect(serverSocket.io.to(table.id).emit).toHaveBeenCalledWith(
        SocketEmit.DealerMadeAction,
        ...callStack[1]
      );

      expect(serverSocket.io.to(table.id).emit).toHaveBeenCalledWith(
        SocketEmit.DealerMadeAction,
        ...callStack[2]
      );

      expect(serverSocket.io.to(table.id).emit).toHaveBeenCalledWith(
        SocketEmit.WinnersCounted,
        ...callStack[3]
      );
    });
  });

});

const mockDeck: Card[] = [
  { suit: 'Hearts', rank: Rank.Two, value: 2 },
  { suit: 'Diamonds', rank: Rank.Two, value: 2 },
  { suit: 'Clubs', rank: Rank.Two, value: 2 },
  { suit: 'Spades', rank: Rank.Two, value: 2 },
  { suit: 'Hearts', rank: Rank.Ace, value: 11 },
  { suit: 'Diamonds', rank: Rank.Three, value: 3 },
  { suit: 'Clubs', rank: Rank.Three, value: 3 },
  { suit: 'Spades', rank: Rank.Three, value: 3 },
  { suit: 'Diamonds', rank: Rank.Queen, value: 10 },
  { suit: 'Hearts', rank: Rank.Four, value: 4 },
  { suit: 'Diamonds', rank: Rank.Four, value: 4 },
  { suit: 'Clubs', rank: Rank.Four, value: 4 },
  { suit: 'Spades', rank: Rank.Four, value: 4 },
];
