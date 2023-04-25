import React from 'react';
import { ButtonWithSvg, StyledBtn } from '../components/App/App.styled';
import { ButtonWithSoundProps, withSound } from './WithSound';

export const StyledBtnWithSound: React.FC<ButtonWithSoundProps> = withSound(
  ({ children, ...props }) => {
    return <StyledBtn {...props}>{children}</StyledBtn>;
  }
);

export const SvgBtnWithSound: React.FC<ButtonWithSoundProps> = withSound(
  ({ children, ...props }) => {
    return <ButtonWithSvg {...props}>{children}</ButtonWithSvg>;
  }
);
