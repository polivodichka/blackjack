/* eslint-disable @typescript-eslint/member-delimiter-style */
export type ChipStyledProps = {
  color: string;
  bet: number;
  size: number;
} & React.HTMLProps<HTMLButtonElement>;

export type SpotStyledProps = React.HTMLProps<HTMLDivElement>;

export type BetPanelStyledProps = { size: number };

export type StyledButtonProps = React.HTMLProps<HTMLDivElement>;

export type SoundSettings = {
  musicVolume: number;
  musicMuted: boolean;
  soundsVolume: number;
  soundsMuted: boolean;
  notificationsVolume: number;
  notificationsMuted: boolean;
};
