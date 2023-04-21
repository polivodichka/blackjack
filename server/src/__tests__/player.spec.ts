import { Player } from '../models/player';
import { PlayerGameState, PlayerType, TBet } from '../types.ds';

describe('Player', () => {
  let player: Player;

  beforeEach(() => {
    player = new Player('Jack', 'table1');
  });

  describe('constructor', () => {
    it('should create a new player with default values', () => {
      expect(player).toBeDefined();
      expect(player.id).toBeDefined();
      expect(player.spotId).toBeNull();
      expect(player.name).toBe('Jack');
      expect(player.balance).toBe(100);
      expect(player.hand).toHaveLength(0);
      expect(player.betChips).toHaveLength(0);
      expect(player.insuranceBet).toBeNull();
      expect(player.parentAfterSplitPlayer).toBeNull();
      expect(player.parentPlayer).toBeNull();
      expect(player.roundIsEnded).toBe(false);
    });
  });

  describe('playerType', () => {
    it('returns PlayerType.Player if parentPlayer is not null', () => {
      const parentPlayer = new Player('Parent', 'table123');
      player.parentPlayer = parentPlayer;
      expect(player.playerType).toBe(PlayerType.Player);
    });

    it('returns PlayerType.Subplayer if parentAfterSplitPlayer is not null', () => {
      const parentPlayer = new Player('Parent', 'table123');
      player.parentAfterSplitPlayer = parentPlayer;
      expect(player.playerType).toBe(PlayerType.Subplayer);
    });

    it('returns PlayerType.Parent if both parentPlayer and parentAfterSplitPlayer are null', () => {
      expect(player.playerType).toBe(PlayerType.Parent);
    });
  });

  describe('isSubplayer', () => {
    it('returns true if the player has a parentAfterSplitPlayer', () => {
      const parentPlayer = new Player('Parent', 'table1');
      player.parentAfterSplitPlayer = parentPlayer;
      expect(player.isSubplayer).toBe(true);
    });

    it('returns false if the player does not have a parentAfterSplitPlayer', () => {
      expect(player.isSubplayer).toBe(false);
    });
  });

  describe('betChipsTotal', () => {
    it('should return 0 if betChips is empty', () => {
      expect(player.betChipsTotal).toBe(0);
    });

    it('should return the sum of the chips if betChips is not empty', () => {
      player.betChips = [5, 10, 20];
      expect(player.betChipsTotal).toBe(35);
    });
  });

  describe('balance getter and setter', () => {
    const tableId = 'tableId';

    it('should get balance', () => {
      expect(player.balance).toBe(100); // default balance is 100
    });

    it('should set balance', () => {
      player.balance = 50;
      expect(player.balance).toBe(50);
    });

    it('should get balance for subplayer', () => {
      const parentPlayer = new Player('parent player', tableId);
      parentPlayer.balance = 100;
      player.parentAfterSplitPlayer = parentPlayer;

      expect(player.playerType).toBe(PlayerType.Subplayer);
      expect(player.balance).toBe(parentPlayer.balance);
    });
  });

  describe('name', () => {
    it('should capitalize the first letter of the name', () => {
      expect(player.name).toBe('Jack');
      player.name = 'bob';
      expect(player.name).toBe('Bob');
    });

    it('should lowercase the rest of the name', () => {
      player.name = 'JACK';
      expect(player.name).toBe('Jack');
      player.name = 'bOB';
      expect(player.name).toBe('Bob');
    });
  });

  describe('increaseBalance and decreaseBalance methods', () => {
    it('should increase the player balance', () => {
      player.increaseBalance(50);
      expect(player.balance).toBe(150);
    });

    it('should decrease the player balance', () => {
      player.decreaseBalance(50);
      expect(player.balance).toBe(50);
    });

    it('should increase the parent player balance if there is one', () => {
      const parentPlayer = new Player(
        'Mary',
        'table1',
        'player2',
        'spot2',
        500
      );
      player.parentPlayer = parentPlayer;

      player.increaseBalance(50);
      expect(parentPlayer.balance).toBe(550);
    });

    it('should decrease the parent player balance if there is one', () => {
      const parentPlayer = new Player(
        'Mary',
        'table1',
        'player2',
        'spot2',
        500
      );
      player.parentPlayer = parentPlayer;

      player.decreaseBalance(50);
      expect(parentPlayer.balance).toBe(450);
    });
  });

  describe('Player bet', () => {
    it('should add bet amount to betChips and decrease balance', () => {
      player.bet(10);
      expect(player.betChips).toEqual([10]);
      expect(player.balance).toBe(90);
    });

    it('should not add bet if amount exceeds balance', () => {
      player.bet(200 as TBet);
      expect(player.betChips).toEqual([]);
      expect(player.balance).toBe(100);
    });
  });
  describe('Player insurance', () => {
    it('should not allow insurance greater than available balance', () => {
      player.balance = 12;
      player.bet(10);
      player.insurance();
      expect(player.insuranceBet).toBe(null);
      expect(player.balance).toBe(2);
    });

    it('should allow insurance equal to available balance', () => {
      player.balance = 15;
      player.bet(10);
      player.insurance();
      expect(player.insuranceBet).toBe(5);
      expect(player.balance).toBe(0);
    });

    it('should allow insurance less than available balance', () => {
      player.balance = 10;
      player.bet(5);
      player.insurance();
      expect(player.insuranceBet).toBe(2.5);
      expect(player.balance).toBe(2.5);
    });
  });
});
