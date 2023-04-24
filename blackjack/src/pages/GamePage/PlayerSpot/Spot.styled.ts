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
  &.loose {
    filter: drop-shadow(0px 0px 20px red);
  }
  &.win {
    filter: drop-shadow(0px 0px 20px green);
  }
`;
export const PlayerComponentWrapper = styled(OnePlayerWrapper)`
  &.active {
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
  height: 30vh;
  width: 16vw;
  border: 3px solid white;
  border-radius: 9px;
  padding: 20px 0;
  position: relative;
  cursor: pointer;

  &.active {
    border: 2px solid ${Color.MainAccent};
    box-shadow: 0 0 40px ${Color.MainAccent} inset;
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
      box-shadow: 0 0 40px ${Color.MainAccent} inset;
    }

    50% {
      box-shadow: 0 0 20px #fff inset;
    }
  }
`;
export const Name = styled.div`
  position: absolute;
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
      top: -75px;
    }
    &:nth-child(2) {
      --i: 1.75;
    }
    &:nth-child(3) {
      --i: 2;
      top: 25px;
    }
    &:nth-child(4) {
      --i: 2.25;
    }
    &:nth-child(5) {
      --i: 2.5;
      top: -75px;
    }
  }
`;

export const CardsWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  gap: -20px;
  box-sizing: border-box;
  min-height: 6.4vw;
`;

export const CardsTotal = styled.div`
  height: 20px;
  width: 20px;
  height: min-content;
  color: white;
  background-color: #5dadec;
  text-align: center;
  padding: 3px;
  border-radius: 50%;
  z-index: 2;
`;

export const ChipsWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;
