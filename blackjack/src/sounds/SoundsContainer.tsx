import React from 'react';

// @ts-ignore to avoid ts error of unknown module
import click from './sounds/button-click.mp3';
// @ts-ignore to avoid ts error of unknown module
import chip from './sounds/chip.wav';


export const CLICK_SOUND_ID = 'click-sound';
export const CHIP_SOUND_ID = 'chip-sound';

export const SoundsContainer: React.FC = () => {
  return (
    <div style={{ position: 'fixed', top: -100, left: -100 }}>
      <audio id={CLICK_SOUND_ID} src={click as string} />
      <audio id={CHIP_SOUND_ID} src={chip as string} />
    </div>
  );
};
