import React from 'react';
import { SoundType } from '../types.ds';

// @ts-ignore to avoid ts error of unknown module
import click from './sounds/bet.mp3';
// @ts-ignore to avoid ts error of unknown module
import chip from './sounds/CHIP2.mp3';
// @ts-ignore to avoid ts error of unknown module
import flip from './sounds/flip.mp3';
// @ts-ignore to avoid ts error of unknown module
import balance from './sounds/coin.wav';
// @ts-ignore to avoid ts error of unknown module
import background from './sounds/background.mp3';
import { game } from '../store/game';
import { observer } from 'mobx-react-lite';

export const CLICK_SOUND_ID = `${SoundType.Click}-sound`;
export const CHIP_SOUND_ID = `${SoundType.Chip}-sound`;
export const FLIP_SOUND_ID = `${SoundType.Flip}-sound`;
export const BALANCE_SOUND_ID = `${SoundType.Balance}-sound`;
export const BG_SOUND_ID = `${SoundType.Background}-sound`;

export const SoundsContainer: React.FC = observer(() => {
  return (
    <div style={{ position: 'fixed', top: -100, left: -100 }}>
      <audio
        preload="auto"
        className="sound"
        muted={game.music?.soundsMuted}
        id={CLICK_SOUND_ID}
        src={click as string}
      />
      <audio
        preload="auto"
        className="sound"
        muted={game.music?.soundsMuted}
        id={CHIP_SOUND_ID}
        src={chip as string}
      />
      <audio
        preload="auto"
        className="sound"
        muted={game.music?.soundsMuted}
        // volume={game.music?.soundsVolume}
        id={FLIP_SOUND_ID}
        src={flip as string}
      />
      <audio
        preload="auto"
        className="sound"
        muted={game.music?.soundsMuted}
        // volume={game.music?.soundsVolume}
        id={BALANCE_SOUND_ID}
        src={balance as string}
      />
      <audio
        loop={true}
        muted={game.music?.musicMuted}
        id={BG_SOUND_ID}
        src={background as string}
      />
    </div>
  );
});
