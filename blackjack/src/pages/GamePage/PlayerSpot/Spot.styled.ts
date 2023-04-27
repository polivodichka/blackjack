import styled from 'styled-components';

import { Color } from '../../../constants/constants';
import { SpotStyledProps } from '../../../styled.ds';

export const PlayersWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
`;
export const OnePlayerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  .bet {
    z-index: 8;
  }
  &.loose {
    transition: filter 0.3s ease-in 0.9s;
    filter: drop-shadow(0px 0px 20px ${Color.Fail});
  }
  &.win {
    transition: filter 0.3s ease-in 0.9s;
    filter: drop-shadow(0px 0px 20px ${Color.Success});
  }
`;
export const PlayerComponentWrapper = styled(OnePlayerWrapper)`
  gap: 5px;
  &.active {
    z-index: 7;
    animation: pulse 2s ease-in-out infinite;
  }
`;
export const SpotWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  &.active {
    animation: pulse 2s ease-in-out infinite;
  }
`;
export const SpotStyled = styled.div.attrs((props: SpotStyledProps) => props)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 15vmax;
  width: 16vmax;
  border: 3px solid white;
  border-radius: 9px;
  padding: 20px 0;
  position: relative;
  cursor: pointer;
  transition: box-shadow 0.5s ease-in-out, border 0.5s ease-in-out;

  &.active {
    transition: box-shadow 0.5s ease-in-out 0.2s, border 0.5s ease-in-out 0.2s;
    border: 2px solid ${Color.MainAccent};
    box-shadow: 0 0 5vmax ${Color.MainAccent} inset;
  }
  &.empty {
    animation: pulseColor 2s ease-in-out infinite;
  }
  &.dealer {
    border-color: transparent;
  }
  &.disabled {
    pointer-events: none;
  }

  @keyframes pulseColor {
    0%,
    100% {
      box-shadow: 0 0 5vmax ${Color.MainAccent} inset;
    }

    50% {
      box-shadow: 0 0 2vmax #fff inset;
    }
  }
`;
export const Name = styled.div`
  position: absolute;
  font-size: 1.9vmin;
  top: 0;
`;

export const SpotsZone = styled.div`
  display: flex;
  width: 94%;
  justify-content: space-between;
  .spot {
    transform: rotate(calc(90deg - 45deg * var(--i)));
    &:nth-child(1) {
      --i: 1.5;
      top: -5.75vw;
    }
    &:nth-child(2) {
      --i: 1.75;
    }
    &:nth-child(3) {
      --i: 2;
      top: 2vw;
    }
    &:nth-child(4) {
      --i: 2.25;
    }
    &:nth-child(5) {
      --i: 2.5;
      top: -5.75vw;
    }
  }
`;

export const CardsWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  gap: -2.3vmin;
  box-sizing: border-box;
  min-height: 6.4vmin;
`;

export const CardsTotal = styled.div`
  padding-top: 100%;
  font-size: 1.9vmin;
  margin-left: 4vmin;
  width: 3.5vmin;
  height: min-content;
  color: white;
  border: 0.23vmin solid #fff;
  text-align: center;
  padding: 0.35vmin;
  border-radius: 0.7vmin;
  z-index: 2;
  &.bust {
    border-color: ${Color.Fail};
    color: ${Color.Fail};
  }
  &.bj {
    border-color: ${Color.Success};
    color: ${Color.Success};
  }
`;

export const ChipsWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;
