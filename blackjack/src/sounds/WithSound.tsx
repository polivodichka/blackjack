/* eslint-disable @typescript-eslint/no-floating-promises */
import React from 'react';
import { game } from '../store/game';
import { SoundType } from '../types.ds';

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
    const audio = game.music?.sounds[soundType];

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
        audio?.play();

        if (onClick) {
          onClick(event);
        }
      },
      [audio, onClick]
    );

    return <Component {...(props as P)} onClick={handleClick} />;
  };

  return ButtonWithSound;
}
