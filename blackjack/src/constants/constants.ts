import { TBet } from '../types.ds';

export enum Color {
  bet2 = '#ADD8E6',
  bet5 = '#87CEEB',
  bet10 = '#1E90FF',
  bet20 = '#6495ED',
  bet40 = '#87CEFA',
  bet60 = '#00CED1',
  bet100 = '#7FB3D5',
  extra1 = '#5DADEC',
  MAIN = '#AED6F1',
  extra2 = '#00BFFF',
}
export const betValuesOptions: {
  value: TBet;
  color: Color;
}[] = [
  { value: 2, color: Color.bet2 },
  { value: 5, color: Color.bet5 },
  { value: 10, color: Color.bet10 },
  { value: 20, color: Color.bet20 },
  { value: 40, color: Color.bet40 },
  { value: 60, color: Color.bet60 },
  { value: 100, color: Color.bet100 },
];
