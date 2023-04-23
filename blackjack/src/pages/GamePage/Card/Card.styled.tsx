import styled from 'styled-components';
import { Color } from '../../../constants/constants';

export const CardStyled = styled.div`
  --width: 4vw;
  --height: 6.4vw;
  font-size: 1.6em;
  font-family: 'Prompt';
  position: relative;
  margin-left: 0;
  z-index: 1;
  cursor: pointer;
  display: block;
  width: var(--width);
  height: var(--height);
  transform-style: preserve-3d;
  backface-visibility: visible;
  user-select: none;

  &.Spades,
  &.Clubs {
    color: black;
  }

  &.Hearts,
  &.Diamonds {
    color: red;
  }

  &.deck {
    position: absolute;
  }
  &.face {
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
    border-radius: 0.4em;
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.5);
    transition: box-shadow 600ms ease-out;

    &:not(:first-child) {
      position: relative;
      margin-left: -2.9vw;
      z-index: 2;
    }
  }

  &.back {
    --width: 10vw;
    --height: 16vw;
    transform: rotate3d(0, 1, 0, 0deg);

    background: linear-gradient(-90deg, ${Color.MainDark}, ${Color.Main});
    background-position: center center;
    position: absolute;
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.5);
    font-size: 1.2em;

    &::before {
      content: 'evolution';
      color: white;
    }
    &::after {
      content: 'evolution';
      color: white;
      position: absolute;
      bottom: 0px;
      right: 0px;
      padding: 0.2em;
      display: flex;
      flex-flow: column;
      -webkit-box-align: center;
      align-items: center;
      transform: scale(-1);
      line-height: 1;
    }
    &:first-child {
      animation: shadow 3s ease-in-out infinite;
    }

    @keyframes shadow {
      0%,
      100% {
        filter: drop-shadow(-6.4vw 4vw 3vw rgba(0, 0, 0, 0.514));
      }
      50% {
        filter: drop-shadow(calc(-6.4vw + 20px) 4vw 1vw rgba(0, 0, 0, 0.514));
      }
    }
  }

  &.face {
    padding: 0.5em;
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    background: #fff;
  }

  & .suit {
    font-size: 2.5em;
    font-weight: 100;
  }

  & .rank {
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 0.2em;
    display: flex;
    flex-flow: column;
    align-items: center;
    transform: scale(-1);
    line-height: 1;

    &:first-of-type {
      bottom: auto;
      right: auto;
      top: 0;
      left: 0;
      transform: none;
    }

    &::after {
      font-size: 0.7em;
      content: attr(data-suit);
    }
  }
`;
