import React from 'react';
import { SoundType } from '../types.ds';

// @ts-ignore to avoid ts error of unknown module
import click from '../assets/sounds/click.wav';
// @ts-ignore to avoid ts error of unknown module
import chip from '../assets/sounds/chip.wav';
// @ts-ignore to avoid ts error of unknown module
import flip from '../assets/sounds/flip.mp3';
// @ts-ignore to avoid ts error of unknown module
import balance from '../assets/sounds/coin.mp3';
// @ts-ignore to avoid ts error of unknown module
import background from '../assets/sounds/background.mp3';
// @ts-ignore to avoid ts error of unknown module
import connected from '../assets/sounds/userConnected.mp3';
// @ts-ignore to avoid ts error of unknown module
import disconnected from '../assets/sounds/userLeft.mp3';
// @ts-ignore to avoid ts error of unknown module
import message from '../assets/sounds/message.mp3';

import { game } from '../store/game';
import { observer } from 'mobx-react-lite';

export const CLICK_SOUND_ID = `${SoundType.Click}-sound`;
export const CHIP_SOUND_ID = `${SoundType.Chip}-sound`;
export const FLIP_SOUND_ID = `${SoundType.Flip}-sound`;
export const BALANCE_SOUND_ID = `${SoundType.Balance}-sound`;
export const BG_SOUND_ID = `${SoundType.Background}-sound`;
export const CONNECT_SOUND_ID = `${SoundType.PlayerConnected}-sound`;
export const DISCONNECT_SOUND_ID = `${SoundType.PlayerDisconnected}-sound`;
export const MESSAGE_SOUND_ID = `${SoundType.Message}-sound`;

export const SoundsContainer: React.FC = observer(() => {
  return (
    <div style={{ position: 'fixed', top: -100, left: -100 }}>
      <audio
        preload="auto"
        muted={game.music?.soundsMuted}
        id={CLICK_SOUND_ID}
        src={click as string}
      />
      <audio
        preload="auto"
        muted={game.music?.soundsMuted}
        id={CHIP_SOUND_ID}
        src={chip as string}
      />
      <audio
        preload="auto"
        muted={game.music?.soundsMuted}
        id={FLIP_SOUND_ID}
        src={flip as string}
      />
      <audio
        preload="auto"
        muted={game.music?.soundsMuted}
        id={BALANCE_SOUND_ID}
        src={balance as string}
      />
      <audio
        preload="auto"
        muted={game.music?.notificationsMuted}
        id={CONNECT_SOUND_ID}
        src={connected as string}
      />
      <audio
        preload="auto"
        muted={game.music?.notificationsMuted}
        id={DISCONNECT_SOUND_ID}
        src={disconnected as string}
      />
      <audio
        preload="auto"
        muted={game.music?.notificationsMuted}
        id={MESSAGE_SOUND_ID}
        src={message as string}
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
