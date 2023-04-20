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
import { Dealer } from '../models/dealer';

describe('ServerSocket', () => {
  let serverSocket: ServerSocket;
  let httpServer: http.Server;
  let mockSocket1: any;
  let mockSocket2: any;
  let mockSocket3: any;

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
      const amount2 = 50;
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
      const amount = 50;
      const initialPlayerCount = table.allPlayers.length;
      const initialPlayerBalance = parent.balance;

      await mockSocket2.on.mock.calls[3][1](table.id, fakePlayer2.id, 0);

      expect(parent.balance).toBe(initialPlayerBalance + amount);
      expect(table.allPlayers).toHaveLength(initialPlayerCount - 1);
      expect(
        table.allPlayers.find((player) => player.id === fakePlayer2.id)
      ).toBeUndefined();
    });

    it('should throw an error if table is not found', async () => {
      const amount = 100;
      const spotId = 'spot-1';
      const handleErrorSpy = jest.spyOn(serverSocket, 'handleError');
      const initialPlayerCount = table.allPlayers.length;
      const initialPlayerBalance = fakePlayer1.parentPlayer!.balance;

      await mockSocket2.on.mock.calls[3][1]('fakeTableId', fakePlayer1.id, 0);

      expect(handleErrorSpy).toHaveBeenCalledWith(
        new Error(BaseMessages.NoTable),
        mockSocket1
      );
      expect(table.allPlayers).toHaveLength(initialPlayerCount);
      expect(fakePlayer1.parentPlayer!.balance).toBe(initialPlayerBalance);
    });

    it('should throw an error if player is not found', async () => {
      const handleErrorSpy = jest.spyOn(serverSocket, 'handleError');
      const initialPlayerCount = table.allPlayers.length;
      const initialPlayerBalance = fakePlayer1.parentPlayer!.balance;

      await mockSocket1.on.mock.calls[3][1](table.id, 'fakePlayerId', 0);

      expect(handleErrorSpy).toHaveBeenCalledWith(
        new Error(BaseMessages.PlayerLost),
        mockSocket1
      );
      expect(table.allPlayers).toHaveLength(initialPlayerCount);
      expect(fakePlayer1.parentPlayer!.balance).toBe(initialPlayerBalance);
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
      const handleErrorSpy = jest.spyOn(serverSocket, 'handleError');
      jest.spyOn(table, 'spots', 'get').mockReturnValueOnce({});

      await mockSocket2.on.mock.calls[4][1](table.id);

      expect(handleErrorSpy).toHaveBeenCalledWith(
        new Error(BaseMessages.ProhibitedAction),
        mockSocket2
      );
    });

    it('should not deal if table is not found', async () => {
      await mockSocket2.on.mock.calls[4][1]('fakeTableId');

      expect(dealer).toBeNull();
      expect(fakePlayer1.hand).toHaveLength(0);
      expect(fakePlayer2.hand).toHaveLength(0);
    });

    it('should throw an error if table is not found', async () => {
      const handleErrorSpy = jest.spyOn(serverSocket, 'handleError');

      await mockSocket2.on.mock.calls[4][1]('fakeTableId');

      expect(handleErrorSpy).toHaveBeenCalledWith(
        new Error(BaseMessages.NoTable),
        mockSocket2
      );
    });

    it('should deal cards to players with bets and dealer', async () => {
      const initialPlayerCount = table.allPlayers.length;

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
  });
});
