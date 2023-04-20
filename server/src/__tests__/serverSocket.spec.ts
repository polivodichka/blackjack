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
import { BaseMessages, SocketEmit } from '../types.ds';

describe('ServerSocket', () => {
  let serverSocket: ServerSocket;
  let httpServer: http.Server;
  let mockSocket1: any;
  let mockSocket2: any;

  beforeAll(() => {
    httpServer = http.createServer();
    serverSocket = new ServerSocket(httpServer);
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
    let mockSocket3: any;
    let table: Table;
    let player: Player;
    let chat: Chat;

    beforeAll(() => {
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

      const handleErrorSpy = jest.spyOn(serverSocket, 'handleError');

      await mockSocket3.on.mock.calls[1][1]('fakeId', name, balance);

      expect(handleErrorSpy).toHaveBeenCalledWith(
        new Error(BaseMessages.NoTable),
        mockSocket3
      );
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
      const spotId = 'spot-1';
      const initialPlayerCount = table.allPlayers.length;
      const initialPlayerBalance = player1.balance;

      await mockSocket1.on.mock.calls[2][1](
        table.id,
        spotId,
        player1?.id,
        amount
      );

      const newPlayer = table.allPlayers[initialPlayerCount];

      expect(newPlayer).toBeDefined();
      expect(newPlayer.parentPlayer).toBe(player1);

      expect(table.allPlayers).toHaveLength(initialPlayerCount + 1);
      expect(player1).toBeDefined();
      expect(player1.balance).toBe(initialPlayerBalance - amount);
      expect(newPlayer.betChips).toHaveLength(1);
      expect(newPlayer.betChipsTotal).toBe(amount);
    });

    it('should throw an error if table is not found', async () => {
      const amount = 100;
      const spotId = 'spot-1';
      const handleErrorSpy = jest.spyOn(serverSocket, 'handleError');
      const initialPlayerCount = table.allPlayers.length;
      const initialPlayerBalance = player1.balance;

      await mockSocket1.on.mock.calls[2][1](
        'fakeTableId',
        spotId,
        player1?.id,
        amount
      );

      expect(handleErrorSpy).toHaveBeenCalledWith(
        new Error(BaseMessages.NoTable),
        mockSocket1
      );
      expect(table.allPlayers).toHaveLength(initialPlayerCount);
      expect(player1.balance).toBe(initialPlayerBalance);
    });

    it('should throw an error if player is not found', async () => {
      const amount = 100;
      const spotId = 'spot-1';
      const handleErrorSpy = jest.spyOn(serverSocket, 'handleError');
      const initialPlayerCount = table.allPlayers.length;
      const initialPlayerBalance = player1.balance;

      await mockSocket1.on.mock.calls[2][1](
        table.id,
        spotId,
        'fakePlayerId',
        amount
      );

      expect(handleErrorSpy).toHaveBeenCalledWith(
        new Error(BaseMessages.PlayerLost),
        mockSocket1
      );
      expect(table.allPlayers).toHaveLength(initialPlayerCount);
      expect(player1.balance).toBe(initialPlayerBalance);
    });

    it('should throw an error if bet amount is bigger than balance', async () => {
      const amount = player1.balance + 100;
      const spotId = 'spot-1';
      const handleErrorSpy = jest.spyOn(serverSocket, 'handleError');
      const initialPlayerCount = table.allPlayers.length;
      const initialPlayerBalance = player1.balance;

      await mockSocket1.on.mock.calls[2][1](
        table.id,
        spotId,
        player1.id,
        amount
      );

      expect(handleErrorSpy).toHaveBeenCalledWith(
        new Error(BaseMessages.NoMoney),
        mockSocket1
      );
      expect(table.allPlayers).toHaveLength(initialPlayerCount);
      expect(player1.balance).toBe(initialPlayerBalance);
    });
  });
});
