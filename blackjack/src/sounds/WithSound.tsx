/* eslint-disable @typescript-eslint/no-floating-promises */
import React from 'react';

import { SoundType } from '../types.ds';
import { game } from '../store/game';

export type WithSoundProps = {
  soundType: SoundType;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export type ButtonWithSoundProps = WithSoundProps &
React.DetailedHTMLProps<
React.ButtonHTMLAttributes<HTMLButtonElement>,
HTMLButtonElement
>;

export function withSound<P extends WithSoundProps>(
  Component: React.FC<P>
): React.FC<P> {
  const ButtonWithSound: React.FC<P> = ({ soundType, onClick, ...props }) => {

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        game.playSound(soundType);

        if (onClick) {
          onClick(event);
        }
      },
      [onClick, soundType]
    );

    return <Component {...(props as P)} onClick={handleClick} />;
  };

  return ButtonWithSound;
}
