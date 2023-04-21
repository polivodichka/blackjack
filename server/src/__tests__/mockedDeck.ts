import { Card } from '../models/card';
import { Rank } from '../types.ds';

export const mockedDeck: Card[] = [
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
