import styled from 'styled-components';

export const CardStyled = styled.div`
  font-size: 16px;
  position: relative;
  cursor: pointer;
  display: block;
  width: 3vw;
  height: 4.8vw;
  transform-style: preserve-3d;
  backface-visibility: visible;
  perspective: 100px;
  user-select: none;

  &.Spades,
  &.Clubs {
    color: black;
  }

  &.Hearts,
  &.Diamonds {
    color: red;
  }

  &.face,
  &.back {
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
    border-radius: 0.4em;
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.5);
    transition: box-shadow 600ms ease-out;
  }

  &.back {
    transform: rotate3d(0, 1, 0, 0deg);
    background-color: black;
    background-image: repeating-linear-gradient(
        45deg,
        rgba(0, 0, 0, 0.3),
        rgba(0, 0, 0, 0.3) 10%,
        transparent 0%,
        transparent 20%
      ),
      repeating-linear-gradient(
        -45deg,
        rgba(0, 0, 0, 0.3),
        rgba(0, 0, 0, 0.3) 10%,
        transparent 0%,
        transparent 20%
      );
    background-position: center center;
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
