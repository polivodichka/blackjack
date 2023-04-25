import React from 'react';
import { ButtonWithSoundProps, withSound } from '../../../sounds/WithSound';
import { game } from '../../../store/game';
import { SoundType } from '../../../types.ds';

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
  const ref = React.useRef<HTMLButtonElement>(null);

  const ButtonWithSound: React.FC<ButtonWithSoundProps> = withSound(
    ({ children, ...props }) => {
      return (
        <ChipStyled
          ref={ref as React.LegacyRef<HTMLButtonElement>}
          className={active ? 'active bet' : 'bet'}
          color={color}
          bet={value}
          size={size}
          {...props}
        >
          {children}
        </ChipStyled>
      );
    }
  );
  return (
    <>
      <ButtonWithSound
        type="submit"
        soundType={SoundType.Chip}
        onClick={onBetSet}
        disabled={game.table?.roundIsStarted}
      >
        {value}
      </ButtonWithSound>
    </>
  );
};
