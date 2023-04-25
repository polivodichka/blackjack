import { TBet } from '../types.ds';

export enum Color {
  Bet2 = '#ADD8E6',
  Bet5 = '#87CEEB',
  Bet10 = '#1E90FF',
  Bet20 = '#6495ED',
  Bet40 = '#87CEFA',
  Bet60 = '#00CED1',
  Bet100 = '#7FB3D5',
  MainAccent = '#03e9f4',
  MainDark = '#141e30',
  Main = '#243b55',
  MainSemitransparent = '#243b5588',
  Success = '#71a869',
  Fail = 'red',
}

type BetValueOptionType = {
  value: TBet;
  color: Color;
};

export const betValuesOptions: BetValueOptionType[] = [
  { value: 2, color: Color.Bet2 },
  { value: 5, color: Color.Bet5 },
  { value: 10, color: Color.Bet10 },
  { value: 20, color: Color.Bet20 },
  { value: 40, color: Color.Bet40 },
  { value: 60, color: Color.Bet60 },
  { value: 100, color: Color.Bet100 },
];
