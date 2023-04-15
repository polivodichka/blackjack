import { ToastOptions } from 'react-toastify';
import styled from 'styled-components';
import { Color } from './constants/constants';
import { makeColorDarker } from './utils/makeColorDarker';

export const StyledBtn = styled.button`
  align-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  cursor: pointer;
  border: 2px solid ${Color.MainAccent};
  color: ${Color.MainAccent};
  padding: 10px 20px;
  font-size: 16px;
  text-decoration: none;
  text-transform: uppercase;
  overflow: hidden;
  transition: 0.5s;
  letter-spacing: 4px;
  &:hover {
    background: ${Color.MainAccent};
    color: #fff;
    border-radius: 5px;
    box-shadow: 0 0 5px ${Color.MainAccent}, 0 0 25px ${Color.MainAccent},
      0 0 50px ${Color.MainAccent}, 0 0 100px ${Color.MainAccent};
  }
  &:disabled {
    border: 2px solid ${makeColorDarker(Color.MainAccent, 20)};
    background: ${makeColorDarker(Color.MainAccent, 20)};
    color: #fff;
    border-radius: 5px;
    box-shadow: 0 0 5px ${makeColorDarker(Color.MainAccent, 20)},
      0 0 25px ${makeColorDarker(Color.MainAccent, 20)},
      0 0 50px ${makeColorDarker(Color.MainAccent, 20)},
      0 0 100px ${makeColorDarker(Color.MainAccent, 20)};
  }
`;

export const ButtonWithSvg = styled(StyledBtn)`
  padding: 5px 10px;
  svg {
    fill: transparent;
    stroke: ${Color.MainAccent};
  }
  &:hover svg {
    fill: transparent;
    stroke: #fff;
  }
`;

export const toastSettings: ToastOptions<{}> = {
  position: 'top-right',
  autoClose: 1000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'dark',
};
