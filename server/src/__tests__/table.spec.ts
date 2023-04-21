/* eslint-disable @typescript-eslint/dot-notation */
import { Card } from '../models/card';
import { Dealer } from '../models/dealer';
import { Player } from '../models/player';
import { Table } from '../models/table';
import { PlayerGameState, PlayerType } from '../types.ds';
import { Rank } from '../types.ds';
import { Suit } from '../types.ds';
import { mockedDeck } from './mockedDeck';

describe('Table', () => {
  let table: Table;
  let player1: Player;
  let player2: Player;
  let player3: Player;
  let dealer: Dealer;
  let card1: Card;
  let card2: Card;
  let card3: Card;

  beforeEach(() => {
    table = new Table();
    player1 = new Player('Player 1', table.id);
    player2 = new Player('Player 2', table.id);
    player3 = new Player('Player 3', table.id);
    dealer = new Dealer(table.id);
    card1 = new Card('Spades', Rank.Ace, 11);
    card2 = new Card('Clubs', Rank.King, 10);
    card3 = new Card('Hearts', Rank.Queen, 10);
  });

  describe('players', () => {
    it('should return an empty array if no players have been added', () => {
      expect(table.players).toEqual([]);
    });

    it('should return an array of players that are not the parent player', () => {
      player1.parentPlayer = player3;
      player2.parentPlayer = player3;
      const players = [player1, player2, player3];
      table.allPlayers = players;
      expect(table.players).toEqual([player1, player2]);
    });
  });

  describe('playingPlayers', () => {
    it('should return an empty array if no players are playing', () => {
      expect(table.playingPlayers).toEqual([]);
    });

    it('should return an array of players that have a non-empty hand', () => {
      player1.hand = [card1, card2];
      player2.hand = [card3];
      const players = [player1, player2];
      table.allPlayers = players;
      expect(table.playingPlayers).toEqual([player1, player2]);
    });
  });

  describe('handsEmpty', () => {
    it('should return true if all players have empty hands', () => {
      const players = [player1, player2];
      player1.parentPlayer = player2;
      table.allPlayers = players;
      const handsEmpty = table['handsEmpty'];
      expect(handsEmpty).toBe(true);
    });

    it('should return false if any player has a non-empty hand', () => {
      player1.hand = [card1];
      player1.parentPlayer = player2;
      const players = [player1, player2];
      table.allPlayers = players;
      const handsEmpty = table['handsEmpty'];
      expect(handsEmpty).toBe(false);
    });
  });

  describe('currentPlayer', () => {
    it('should return the current player object if currentPlayerIndex is a number', () => {
      player1.parentPlayer = player3;
      player2.parentPlayer = player3;
      const players = [player1, player2, player3];
      table.allPlayers = players;
      table.currentPlayerIndex = 1;

      expect(table.currentPlayer).toBe(player2);
    });

    it('should return null if currentPlayerIndex is null', () => {
      player1.parentPlayer = player3;
      player2.parentPlayer = player3;
      const players = [player1, player2, player3];
      table.allPlayers = players;
      table.currentPlayerIndex = null;

      expect(table.currentPlayer).toBe(null);
    });
  });

  describe('spots', () => {
    it('should group players by spotId', () => {
      const child1 = new Player('Alice', table.id, '1', 'spot1');
      child1.parentPlayer = player1;
      const child2 = new Player('Bob', table.id, '2', 'spot1');
      child2.parentPlayer = player1;
      const child3 = new Player('Charlie', table.id, '3', 'spot2');
      child3.parentPlayer = player2;
      table.allPlayers = [player1, player2, child1, child2, child3];

      expect(table.spots).toEqual({
        spot1: [child1, child2],
        spot2: [child3],
      });
    });

    it('should return an empty object if no players have a spotId', () => {
      const child1 = new Player('Alice', table.id, '1');
      child1.parentPlayer = player1;
      const child2 = new Player('Bob', table.id, '2');
      child2.parentPlayer = player1;
      const child3 = new Player('Charlie', table.id, '3');
      child3.parentPlayer = player2;
      table.allPlayers = [player1, player2, child1, child2, child3];

      expect(table.spots).toEqual({});
    });
  });

  describe('addPlayer', () => {
    it('should add a new player to the table if the spot is empty', () => {
      table.allPlayers = [player1];
      expect(table.players).toHaveLength(0);

      const player = table.addPlayer(
        'John',
        'spot1',
        100,
        undefined,
        player1.id
      );
      expect(table.players).toContain(player);
    });

    it('should return an existing player if the spot is already taken', () => {
      table.allPlayers = [player1, player2];
      player1.parentPlayer = player2;
      player1.spotId = 'spot1';
      expect(table.players).toHaveLength(1);

      const player = table.addPlayer(
        'John',
        'spot1',
        100,
        undefined,
        player1.id
      );
      expect(player).toBe(player1);
    });
  });

  describe('playerRemove', () => {
    it('should remove player from allPlayers', () => {
      table.allPlayers = [player2, player1, player3];
      table.playerRemove(player1);
      expect(table.allPlayers).not.toContain(player1);
      expect(table.allPlayers).toContain(player2);
      expect(table.allPlayers).toContain(player3);
    });

    it('should set dealer to null if all hands are empty', () => {
      table.allPlayers = [player2, player1, player3];
      player1.hand = [card1, card2];
      table.playerRemove(player1);
      table.dealer = dealer;

      table.playerRemove(player1);
      expect(table.dealer).toBeNull();
    });
  });

  describe('removeFakePlayers', () => {
    it('should remove all fake players with given parent player', () => {
      table.allPlayers = [player1, player2, player3];
      player2.parentPlayer = player1;
      player3.parentAfterSplitPlayer = player1;
      table.removeFakePlayers(player1);
      expect(table.allPlayers).not.toContain(player2);
      expect(table.allPlayers).not.toContain(player3);
    });

    it('should set roundIsEnded of parent player to false', () => {
      table.allPlayers = [player1, player2, player3];
      player1.roundIsEnded = true;
      player2.parentPlayer = player1;
      player3.parentAfterSplitPlayer = player1;
      table.removeFakePlayers(player1);
      expect(table.allPlayers).not.toContain(player2);
      expect(table.allPlayers).not.toContain(player3);
    });
  });

  describe('rebet', () => {
    beforeEach(() => {
      table.allPlayers = [player1, player2, player3];
      player2.parentPlayer = player1;
      player2.hand = [card1, card2];
      player2.betChips = [5, 10];
      player3.parentAfterSplitPlayer = player1;
      player3.parentPlayer = player1;
      player3.hand = [card1, card2];
      player3.betChips = [40];
      player3.insuranceBet = 20;
    });
    it('removes split players and resets hands and insurance bets of parent players', () => {
      table.rebet(player1);

      expect(table.allPlayers).toHaveLength(2);
      expect(player2.hand).toHaveLength(0);
      expect(player2.insuranceBet).toBeNull();
      expect(player2.parentAfterSplitPlayer).toBeNull();
      expect(table.allPlayers).not.toContain(player3);
    });

    it('sets roundIsEnded of parent to false and sets dealer to null if all players have empty hands', () => {
      table.dealer = dealer;
      player1.roundIsEnded = true;

      table.rebet(player1);

      expect(player1.roundIsEnded).toBe(false);
      expect(table.dealer).toBeNull();
    });
  });

  describe('countWinnings', () => {
    it('should correctly calculate winnings for a dealler natural blackjack', () => {
      player2.balance = 70; // including deductions
      player1.hand = [card2, card2];
      player1.parentPlayer = player2;
      player1.spotId = 'spot1';
      player1.betChips = [20];
      player1.insuranceBet = 10;

      dealer.hand = [card1, card2];

      table.allPlayers = [player1, player2];
      table.dealer = dealer;

      table.countWinnings();

      expect(player2.balance).toBe(90);
    });

    it('should correctly calculate winnings for a player natural blackjack', () => {
      player2.balance = 80; // including deductions
      player1.hand = [card1, card2];
      player1.parentPlayer = player2;
      player1.spotId = 'spot1';
      player1.betChips = [20];

      dealer.hand = [card2, card2];

      table.allPlayers = [player1, player2];
      table.dealer = dealer;

      table.countWinnings();

      expect(player2.balance).toBe(130);
    });
    it('should correctly calculate winnings if player and dealer have natural blackjack', () => {
      player2.balance = 80; // including deductions
      player1.hand = [card1, card2];
      player1.parentPlayer = player2;
      player1.spotId = 'spot1';
      player1.betChips = [20];

      dealer.hand = [card1, card2];

      table.allPlayers = [player1, player2];
      table.dealer = dealer;

      table.countWinnings();

      expect(player2.balance).toBe(100);
    });
    it('should correctly calculate winnings for a player blackjack', () => {
      player2.balance = 80; // including deductions
      player1.hand = [
        card1,
        new Card('Spades', Rank.Five, 5),
        new Card('Spades', Rank.Five, 5),
      ];
      player1.parentPlayer = player2;
      player1.spotId = 'spot1';
      player1.betChips = [20];

      dealer.hand = [card2, card2];

      table.allPlayers = [player1, player2];
      table.dealer = dealer;

      table.countWinnings();

      expect(player2.balance).toBe(120);
    });
    it('should correctly calculate winnings for a player bust', () => {
      player2.balance = 80; // including deductions
      player1.hand = [card2, card2, card2];
      player1.parentPlayer = player2;
      player1.spotId = 'spot1';
      player1.betChips = [20];

      dealer.hand = [card2, card2];

      table.allPlayers = [player1, player2];
      table.dealer = dealer;

      table.countWinnings();

      expect(player2.balance).toBe(80);
    });
    it('should correctly calculate winnings for a dealer bust', () => {
      player2.balance = 80; // including deductions
      player1.hand = [card2, card2];
      player1.parentPlayer = player2;
      player1.spotId = 'spot1';
      player1.betChips = [20];

      dealer.hand = [card2, card2, card2];

      table.allPlayers = [player1, player2];
      table.dealer = dealer;

      table.countWinnings();

      expect(player2.balance).toBe(120);
    });

    it('should correctly calculate winnings if dealer and player hands are equal', () => {
      player2.balance = 80; // including deductions
      player1.hand = [card2, card2];
      player1.parentPlayer = player2;
      player1.spotId = 'spot1';
      player1.betChips = [20];

      dealer.hand = [card2, card2];

      table.allPlayers = [player1, player2];
      table.dealer = dealer;

      table.countWinnings();

      expect(player2.balance).toBe(100);
    });
  });

  describe('getPlayerState', () => {
    beforeEach(() => {
      table.allPlayers = [player1];
    });
    it('should return PlayerGameState.Bust when hand total is greater than 21', () => {
      player1.hand = [
        { suit: 'Clubs', rank: Rank.Ten, value: 10 },
        { suit: 'Diamonds', rank: Rank.Ten, value: 10 },
        { suit: 'Clubs', rank: Rank.Ten, value: 10 },
        { suit: 'Hearts', rank: Rank.Ten, value: 10 },
      ];
      expect(table.getPlayerState(player1)).toBe(PlayerGameState.Bust);
    });

    it('should return PlayerGameState.NaturalBlackjack when hand total is 21 and round is not started and not splitted', () => {
      player1.hand = [
        { suit: 'Clubs', rank: Rank.Ace, value: 11 },
        { suit: 'Clubs', rank: Rank.Ten, value: 10 },
      ];
      player1.parentAfterSplitPlayer = null;
      expect(table.getPlayerState(player1)).toBe(
        PlayerGameState.NaturalBlackjack
      );
    });

    it('should return PlayerGameState.Blackjack when hand total is 21 and not a natural blackjack', () => {
      player1.hand = [
        { suit: 'Clubs', rank: Rank.Seven, value: 7 },
        { suit: 'Clubs', rank: Rank.Ace, value: 11 },
        { suit: 'Clubs', rank: Rank.Three, value: 3 },
      ];
      expect(table.getPlayerState(player1)).toBe(PlayerGameState.Blackjack);
    });

    it('should return PlayerGameState.Active when hand total is less than 21 and greater than 0', () => {
      player1.hand = [
        { suit: 'Clubs', rank: Rank.Ten, value: 10 },
        { suit: 'Diamonds', rank: Rank.Seven, value: 7 },
      ];
      expect(table.getPlayerState(player1)).toBe(PlayerGameState.Active);
    });

    it('should return PlayerGameState.Error when hand total is less than or equal to 0', () => {
      player1.hand = [];
      expect(table.getPlayerState(player1)).toBe(PlayerGameState.Error);
    });
  });
});
