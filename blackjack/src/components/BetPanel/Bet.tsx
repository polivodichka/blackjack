import React from 'react';
import { ChipStyled } from './BetPanel.styled';

type BetProps = {
  value: number;
  onBetSet?: (e: React.MouseEvent<HTMLElement>) => void;
  color: string;
  size: number;
  className?: string;
};
export const Bet: React.FC<BetProps> = ({
  value,
  onBetSet = () => {},
  color,
  size,
  className,
}) => {
  return (
    <ChipStyled
      className={className ?? ''}
      color={color}
      bet={value}
      onClick={onBetSet}
      size={size}
    />
  );
};
