import React from 'react';

import { ChipStyled } from './BetPanel.styled';

type BetProps = {
  value: number;
  onBetSet?: (e: React.MouseEvent<HTMLElement>) => void;
  color: string;
  size: number;
  active: boolean;
};
export const Bet: React.FC<BetProps> = ({
  value,
  onBetSet = () => {},
  color,
  size,
  active,
}) => {
  return (
    <ChipStyled
      className={active ? 'active' : ''}
      color={color}
      bet={value}
      onClick={onBetSet}
      size={size}
    />
  );
};
