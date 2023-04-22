/* eslint-disable @typescript-eslint/no-floating-promises */
import React from 'react';
import { SoundType } from '../types.ds';
import { CLICK_SOUND_ID, CHIP_SOUND_ID } from './SoundsContainer';

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
    const audio = getElement(soundType);

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }

        if (onClick) {
          onClick(event);
        }
        audio?.play();
      },
      [onClick, soundType]
    );

    return <Component {...(props as P)} onClick={handleClick} />;
  };

  return ButtonWithSound;
}

const getElement = (soundType: SoundType): HTMLAudioElement | null => {
  switch (soundType) {
    case SoundType.Click:
      return document.getElementById(CLICK_SOUND_ID) as HTMLAudioElement;
    case SoundType.Chip:
      return document.getElementById(CHIP_SOUND_ID) as HTMLAudioElement;
    default:
      return null;
  }
};
