import styled from 'styled-components';
import { Color } from '../../../constants/constants';

export const CardWrap = styled.div`
  --width: 4vw;
  --height: 6.4vw;
  width: var(--width);
  height: var(--height);
  font-size: 1.6em;
  font-family: 'Prompt';
  position: relative;
  margin-left: 0;
  z-index: 1;
  cursor: pointer;
  display: block;
  user-select: none;
  &:not(:first-child) {
    position: relative;
    margin-left: -2.9vw;
    z-index: 2;
  }
  &:hover {
    .face {
      transform: rotateY(180deg);
    }
    .back {
      transform: rotateY(360deg);
    }
  }
`;
export const CardStyled = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  backface-visibility: hidden;
  padding: 0.5em;
  border-radius: 0.4em;
  transition: transform 1s ease-in-out ;
  &.Spades,
  &.Clubs {
    color: black;
  }

  &.Hearts,
  &.Diamonds {
    color: red;
  }

  &.face {
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.5);
    background: #fff;
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
  }

  &.back {
    transform: rotateY(180deg);
    background: linear-gradient(-90deg, ${Color.MainDark}, ${Color.Main});
    background-position: center center;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.5);

    &::before {
      font-size: 0.4em;
      content: 'evolution';
      color: white;
      position: absolute;
      top: 0px;
      left: 0px;
    }
    &::after {
      font-size: 0.4em;

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
  }

  &.deck {
    position: absolute;

    --width: 4vw;
    --height: 6.4vw;
    width: var(--width);
    height: var(--height);
    &::before,
    &::after {
      font-size: 0.6em;
    }
  }
  &.deck:first-child {
    animation: shadow 3s ease-in-out infinite;
  }

  @keyframes shadow {
    0%,
    100% {
      filter: drop-shadow(-3.2vw 2vw 1vw rgba(0, 0, 0, 0.514));
    }
    50% {
      filter: drop-shadow(calc(-3.2vw + 20px) 2vw 0.2vw rgba(0, 0, 0, 0.514));
    }
  }

`;
