import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { HandySvg } from 'handy-svg';

import {
  RangeBarContainer,
  CheckboxLabel,
  RangeBarInput,
  Form,
} from '../ModalsManager.styled';
import { SvgBtnWithSound } from '../../../sounds/StyledBtnWithSound';
import soundIcon from '../../../assets/sound.svg';
import muteIcon from '../../../assets/mute.svg';
import { SoundType } from '../../../types.ds';
import { game } from '../../../store/game';

export const SoundSettingsForm = observer(() => {
  const [musicVolume, setMusicVolume] = useState(game.music?.bg?.volume ?? 0);
  const [soundVolume, setSoundVolume] = useState(
    game.music?.sounds[SoundType.Click]?.volume ?? 0
  );
  const handleMusicMute = () => {
    game.music?.toggleMuteMusic();
  };

  const handleSoundMute = () => {
    game.music?.toggleMuteSound();
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = +e.currentTarget.value / 100;
    if (game.music) {
      setMusicVolume(value);
      game.music.setMusicVolume(value);
      if (game.music.musicMuted) {
        game.music.toggleMuteMusic();
      }
    }
  };

  const handleSoundVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = +e.currentTarget.value / 100;
    if (game.music) {
      setSoundVolume(value);
      game.music.setSoundVolume(value);
      if (game.music.soundsMuted) {
        game.music.toggleMuteSound();
      }
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };
  const handleFormClick = (event: React.MouseEvent<HTMLFormElement>) => {
    event.stopPropagation();
  };

  return (
    <Form onSubmit={handleFormSubmit} onClick={handleFormClick}>
      <CheckboxLabel>Music</CheckboxLabel>
      <RangeBarContainer>
        <RangeBarInput
          type="range"
          value={musicVolume * 100}
          onChange={handleMusicVolumeChange}
          step={5}
          min={0}
          max={100}
        />
        <SvgBtnWithSound
          soundType={SoundType.Click}
          onClick={handleMusicMute}
          disabled={!game.music}
        >
          <HandySvg
            src={game.music?.musicMuted ? muteIcon : soundIcon}
            width="17"
            height="17"
          />
        </SvgBtnWithSound>
      </RangeBarContainer>

      <CheckboxLabel>Sounds</CheckboxLabel>
      <RangeBarContainer>
        <RangeBarInput
          type="range"
          value={soundVolume * 100}
          onChange={handleSoundVolumeChange}
          step={5}
          min={0}
          max={100}
        />
        <SvgBtnWithSound
          soundType={SoundType.Click}
          onClick={handleSoundMute}
          disabled={!game.music}
        >
          <HandySvg
            src={game.music?.soundsMuted ? muteIcon : soundIcon}
            width="17"
            height="17"
          />
        </SvgBtnWithSound>
      </RangeBarContainer>
    </Form>
  );
});
