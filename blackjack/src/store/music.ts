/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BALANCE_SOUND_ID } from '../sounds/SoundsContainer';
import { BG_SOUND_ID } from '../sounds/SoundsContainer';
import { CHIP_SOUND_ID } from '../sounds/SoundsContainer';
import { CLICK_SOUND_ID } from '../sounds/SoundsContainer';
import { CONNECT_SOUND_ID } from '../sounds/SoundsContainer';
import { DISCONNECT_SOUND_ID } from '../sounds/SoundsContainer';
import { FLIP_SOUND_ID } from '../sounds/SoundsContainer';
import { MESSAGE_SOUND_ID } from '../sounds/SoundsContainer';
import { SoundSettings } from '../styled.ds';
import { SoundType } from '../types.ds';

import { action } from 'mobx';
import { makeObservable } from 'mobx';
import { observable } from 'mobx';

export class Music {
  @observable public bg: HTMLAudioElement | null = document.getElementById(
    BG_SOUND_ID
  ) as HTMLAudioElement;

  @observable public sounds: Record<SoundType, HTMLAudioElement | null> = {
    [SoundType.Click]: document.getElementById(
      CLICK_SOUND_ID
    ) as HTMLAudioElement,
    [SoundType.Chip]: document.getElementById(
      CHIP_SOUND_ID
    ) as HTMLAudioElement,
    [SoundType.Flip]: document.getElementById(
      FLIP_SOUND_ID
    ) as HTMLAudioElement,
    [SoundType.Balance]: null,
    [SoundType.Background]: null,
    [SoundType.PlayerConnected]: null,
    [SoundType.PlayerDisconnected]: null,
    [SoundType.Message]: null,
  };

  @observable public notifications: Record<SoundType, HTMLAudioElement | null> =
    {
      [SoundType.Click]: null,
      [SoundType.Chip]: null,
      [SoundType.Flip]: null,
      [SoundType.Balance]: document.getElementById(
        BALANCE_SOUND_ID
      ) as HTMLAudioElement,
      [SoundType.Background]: null,
      [SoundType.PlayerConnected]: document.getElementById(
        CONNECT_SOUND_ID
      ) as HTMLAudioElement,
      [SoundType.PlayerDisconnected]: document.getElementById(
        DISCONNECT_SOUND_ID
      ) as HTMLAudioElement,
      [SoundType.Message]: document.getElementById(
        MESSAGE_SOUND_ID
      ) as HTMLAudioElement,
    };

  @observable public musicMuted =
    this.getLoacaleSettings()?.musicMuted ?? false;

  @observable public soundsMuted =
    this.getLoacaleSettings()?.soundsMuted ?? false;

  @observable public notificationsMuted =
    this.getLoacaleSettings()?.notificationsMuted ?? false;

  public constructor() {
    makeObservable(this);
  }

  @action.bound public toggleMuteSound(): void {
    this.soundsMuted = !this.soundsMuted;
    this.setLocaleSettings();
  }

  @action.bound public toggleMuteMusic(): void {
    this.musicMuted = !this.musicMuted;
    this.setLocaleSettings();
  }

  @action.bound public toggleMuteNotifications(): void {
    this.notificationsMuted = !this.notificationsMuted;
    this.setLocaleSettings();
  }

  @action.bound public setMusicVolume(value: number): void {
    if (this.bg) {
      this.bg.volume = value;
      this.setLocaleSettings();
    }
  }

  @action.bound public setSoundVolume(value: number): void {
    Object.keys(this.sounds).forEach((sound) => {
      if (this.sounds[sound as SoundType]) {
        (this.sounds[sound as SoundType] as HTMLAudioElement).volume = value;
      }
      this.setLocaleSettings();
    });
  }

  @action.bound public setNotificationVolume(value: number): void {
    Object.keys(this.notifications).forEach((notification) => {
      if (this.notifications[notification as SoundType]) {
        (
          this.notifications[notification as SoundType] as HTMLAudioElement
        ).volume = value;
      }
      this.setLocaleSettings();
    });
  }

  public getLoacaleSettings(): SoundSettings | null {
    const soundSettingsStr = localStorage.getItem('soundSettings');

    if (soundSettingsStr) {
      const settings = JSON.parse(soundSettingsStr) as SoundSettings;
      return settings;
    }
    return null;
  }

  private setLocaleSettings() {
    localStorage.setItem(
      'soundSettings',
      JSON.stringify({
        musicVolume: this.bg?.volume ?? 0,
        soundsVolume: this.sounds[SoundType.Click]?.volume ?? 0,
        notificationsVolume:
          this.notifications[SoundType.PlayerDisconnected]?.volume ?? 0,
        musicMuted: this.musicMuted,
        soundsMuted: this.soundsMuted,
        notificationsMuted: this.notificationsMuted,
      } as SoundSettings)
    );
  }
}
