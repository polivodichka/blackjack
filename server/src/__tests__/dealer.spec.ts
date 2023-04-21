import { Card } from '../models/card';
import { Dealer } from '../models/dealer';
import { PlayerGameState, Rank, SuitCard } from '../types.ds';

describe('Dealer', () => {
  let dealer: Dealer;

  beforeEach(() => {
    dealer = new Dealer('table1');
  });

  it('should create a Dealer with an ID', () => {
    expect(dealer.id).toBeTruthy();
  });

  it('should create a Dealer with a table ID', () => {
    expect(dealer.tableId).toEqual('table1');
  });

  it('should have an empty hand when created', () => {
    expect(dealer.hand).toHaveLength(0);
  });

  it('should have a spot ID when created', () => {
    expect(dealer.spotId).not.toBeNull();
  });

  describe('roundIsStarted', () => {
    it('should return false when the dealer hand is empty or 1', () => {
      expect(dealer.roundIsStarted).toBe(false);
      dealer.hand.push(new Card('Hearts', Rank.Two, 2));
      expect(dealer.roundIsStarted).toBe(false);
    });

    it('should return true when the dealer has at least 3 cards', () => {
      dealer.hand.push(new Card('Hearts', Rank.Two, 2));
      dealer.hand.push(new Card('Hearts', Rank.Three, 3));
      dealer.hand.push(new Card('Hearts', Rank.Three, 3));
      expect(dealer.roundIsStarted).toBe(true);
    });
  });

  describe('handTotal', () => {
    it('should return the correct total for a hand with no Aces', () => {
      dealer.hand.push(new Card('Hearts', Rank.Two, 2));
      dealer.hand.push(new Card('Spades', Rank.Three, 3));
      dealer.hand.push(new Card('Clubs', Rank.Five, 5));
      expect(dealer.handTotal).toBe(10);
    });

    it('should return the correct total for a hand with Aces', () => {
      dealer.hand.push(new Card('Hearts', Rank.Ace, 11));
      dealer.hand.push(new Card('Spades', Rank.Two, 2));
      dealer.hand.push(new Card('Clubs', Rank.Ace, 11));
      expect(dealer.handTotal).toBe(14);
    });

    it('should handle multiple Aces correctly', () => {
      dealer.hand.push(new Card('Hearts', Rank.Ace, 11));
      dealer.hand.push(new Card('Spades', Rank.Ace, 11));
      dealer.hand.push(new Card('Clubs', Rank.Ace, 11));
      expect(dealer.handTotal).toBe(13);
    });

    it('should adjust the total when necessary for Aces', () => {
      dealer.hand.push(new Card('Hearts', Rank.Ace, 11));
      dealer.hand.push(new Card('Spades', Rank.Ten, 10));
      expect(dealer.handTotal).toBe(21);
      dealer.hand.push(new Card('Clubs', Rank.Ten, 10));
      expect(dealer.handTotal).toBe(21);
    });
  });

  describe('canHit', () => {
    it('should return true if hand total is less than 17', () => {
      dealer.hand = [
        new Card('Hearts', Rank.Six, 6),
        new Card('Clubs', Rank.Five, 5),
      ];
      expect(dealer.canHit).toBe(true);
    });

    it('should return false if hand total is 17 or more', () => {
      dealer.hand = [
        new Card('Hearts', Rank.Ten, 10),
        new Card('Clubs', Rank.Seven, 7),
      ];
      expect(dealer.canHit).toBe(false);
    });

    it('should return true if hand contains an ace that can be used as 11 without going over 21', () => {
      dealer.hand = [
        new Card('Hearts', Rank.Ace, 11),
        new Card('Clubs', Rank.Five, 5),
      ];
      expect(dealer.canHit).toBe(true);
    });

    it('should return false if hand contains only face cards and aces', () => {
      dealer.hand = [
        new Card('Hearts', Rank.Ace, 11),
        new Card('Clubs', Rank.King, 10),
        new Card('Diamonds', Rank.Jack, 10),
      ];
      expect(dealer.canHit).toBe(false);
    });
  });

  describe('state', () => {
    it('should return PlayerGameState.Bust when hand total is greater than 21', () => {
      dealer.hand = [
        { suit: 'Clubs', rank: Rank.Ten, value: 10 },
        { suit: 'Diamonds', rank: Rank.Ten, value: 10 },
        { suit: 'Clubs', rank: Rank.Ten, value: 10 },
      ];
      expect(dealer.state).toEqual(PlayerGameState.Bust);
    });
    it('should return PlayerGameState.Blackjack when hand total is 21 and round is started', () => {
      dealer.hand = [
        { suit: 'Diamonds', rank: Rank.Ten, value: 5 },
        { suit: 'Hearts', rank: Rank.Ten, value: 5 },
        { suit: 'Clubs', rank: Rank.Ace, value: 11 },
      ];
      expect(dealer.state).toEqual(PlayerGameState.Blackjack);
    });

    it('should return PlayerGameState.NaturalBlackjack when hand total is 21 and round is not started', () => {
      dealer.hand = [
        { suit: 'Clubs', rank: Rank.Ace, value: 11 },
        { suit: 'Clubs', rank: Rank.Ten, value: 10 },
      ];
      expect(dealer.state).toEqual(PlayerGameState.NaturalBlackjack);
    });

    it('should return PlayerGameState.Active when hand total is less than 21 and greater than 0', () => {
      dealer.hand = [
        { suit: 'Hearts', rank: Rank.Ten, value: 10 },
        { suit: 'Clubs', rank: Rank.Nine, value: 9 },
      ];
      expect(dealer.state).toEqual(PlayerGameState.Active);
    });

    it('should return PlayerGameState.Error when hand total is less than or equal to 0', () => {
      dealer.hand = [];
      expect(dealer.state).toEqual(PlayerGameState.Error);
    });
  });
});
