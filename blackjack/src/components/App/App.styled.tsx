/* eslint-disable @typescript-eslint/ban-types */
import { ToastOptions } from 'react-toastify';
import styled from 'styled-components';

import { makeColorDarker } from '../../utils/makeColorDarker';
import { StyledButtonProps } from '../../styled.ds';
import { Color } from '../../constants/constants';

export const StyledBtn = styled.button.attrs(
  (props: StyledButtonProps) => props
)`
  align-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  cursor: pointer;
  border: 2px solid ${Color.MainAccent};
  border-radius: 5px;
  color: ${Color.MainAccent};
  padding: 10px 20px;
  font-size: 16px;
  text-decoration: none;
  text-transform: uppercase;
  overflow: hidden;
  transition: 0.5s;
  font-family: 'Prompt';
  &:hover {
    background: ${Color.MainAccent};
    color: #fff;
    box-shadow: 0 0 5px ${Color.MainAccent}, 0 0 25px ${Color.MainAccent},
      0 0 50px ${Color.MainAccent}, 0 0 100px ${Color.MainAccent};
  }
  &:disabled {
    pointer-events: none;
    border: 2px solid ${makeColorDarker(Color.MainAccent, 50)};
    color: ${makeColorDarker(Color.MainAccent, 50)};
    border-radius: 5px;
  }
`;

export const ButtonWithSvg = styled(StyledBtn)`
  padding: 5px 10px;
  svg {
    fill: transparent;
    stroke: ${Color.MainAccent};
  }
  &:hover:enabled svg {
    fill: transparent;
    stroke: #fff;
  }
  &:disabled svg {
    stroke: ${makeColorDarker(Color.MainAccent, 30)};
  }
`;

export const toastSettings: ToastOptions<{}> = {
  position: 'top-right',
  autoClose: 800,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  pauseOnFocusLoss: false,
  progress: undefined,
  theme: 'dark',
  rtl: false,
};
