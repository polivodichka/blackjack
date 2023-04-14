import { betValuesOptions } from '../constants/constants';
import { TBet } from '../types.ds';

export const getBetColor = (bet: TBet): string => {
  return (
    betValuesOptions.find((betOption) => betOption.value === bet)?.color ??
    '#fff'
  );
};
