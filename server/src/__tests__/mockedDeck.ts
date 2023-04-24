import { Card } from '../models/card';
import { Rank } from '../types.ds';

export const mockedDeck: Card[] = [
  { suit: 'Hearts', rank: Rank.Two, value: 2, id: '', isNew: true },
  { suit: 'Diamonds', rank: Rank.Two, value: 2, id: '', isNew: true },
  { suit: 'Clubs', rank: Rank.Two, value: 2, id: '', isNew: true },
  { suit: 'Spades', rank: Rank.Two, value: 2, id: '', isNew: true },
  { suit: 'Hearts', rank: Rank.Ace, value: 11, id: '', isNew: true },
  { suit: 'Diamonds', rank: Rank.Three, value: 3, id: '', isNew: true },
  { suit: 'Clubs', rank: Rank.Three, value: 3, id: '', isNew: true },
  { suit: 'Spades', rank: Rank.Three, value: 3, id: '', isNew: true },
  { suit: 'Diamonds', rank: Rank.Queen, value: 10, id: '', isNew: true },
  { suit: 'Hearts', rank: Rank.Four, value: 4, id: '', isNew: true },
  { suit: 'Diamonds', rank: Rank.Four, value: 4, id: '', isNew: true },
  { suit: 'Clubs', rank: Rank.Four, value: 4, id: '', isNew: true },
  { suit: 'Spades', rank: Rank.Four, value: 4, id: '', isNew: true },
];
