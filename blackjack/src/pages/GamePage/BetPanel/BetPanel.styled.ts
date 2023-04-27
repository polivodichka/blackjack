/* eslint-disable @typescript-eslint/no-non-null-assertion */
import styled from 'styled-components';

import { makeColorDarker } from '../../../utils/makeColorDarker';
import { BetPanelStyledProps } from '../../../styled.ds';
import { ChipStyledProps } from '../../../styled.ds';

/* eslint-disable @typescript-eslint/indent */



export const BetPanelStyled = styled.div.attrs(
  (props: BetPanelStyledProps) => props
)`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${(props) => props.size * 0.35}vmin;
  width: 100%;
`;

export const ChipStyled = styled.button.attrs(
  (props: ChipStyledProps) => props
)`
  cursor: pointer;
  position: relative;
  display: inline-block;
  width: ${(props) => props.size}vmin;
  max-width: ${(props) => props.size}vmin;
  height: ${(props) => props.size}vmin;
  max-height: ${(props) => props.size}vmin;
  z-index: 4;
  border: none;
  border-radius: 50%;
  background-position: center center;
  background-image: linear-gradient(
      0deg,
      transparent 0,
      transparent 45%,
      #fff 45%,
      #fff 55%,
      transparent 55%,
      transparent 100%
    ),
    linear-gradient(
      60deg,
      transparent 46%,
      #fff 46%,
      #fff 54%,
      transparent 54%,
      transparent 100%
    ),
    linear-gradient(
      120deg,
      ${(props) => props.color} 0,
      ${(props) => props.color} 46%,
      #fff 46%,
      #fff 54%,
      ${(props) => props.color} 54%,
      ${(props) => props.color} 100%
    );

  transition: color 0.3s ease-in-out, box-shadow 0.3s ease-in-out,
    transform 0.3s ease-in-out;
  &:before {
    position: absolute;
    content: '';
    z-index: 1;
    max-width: 80%;
    width: 80%;
    max-height: 80%;
    height: 80%;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-position: center center;

    border: ${(props) => props.size! * 0.05}vmin solid ${(props) => props.color};
    background-image: linear-gradient(
        0deg,
        transparent 0,
        transparent 45%,
        #ebebeb 45%,
        #ebebeb 55%,
        transparent 55%,
        transparent 100%
      ),
      linear-gradient(
        30deg,
        transparent 0,
        transparent 46%,
        #ebebeb 46%,
        #ebebeb 54%,
        transparent 54%,
        transparent 100%
      ),
      linear-gradient(
        60deg,
        transparent 0,
        transparent 46%,
        #ebebeb 46%,
        #ebebeb 54%,
        transparent 54%,
        transparent 100%
      ),
      linear-gradient(
        90deg,
        transparent 0,
        transparent 45%,
        #ebebeb 45%,
        #ebebeb 55%,
        transparent 55%,
        transparent 100%
      ),
      linear-gradient(
        120deg,
        transparent 0,
        transparent 46%,
        #ebebeb 46%,
        #ebebeb 54%,
        transparent 54%,
        transparent 100%
      ),
      linear-gradient(
        150deg,
        ${(props) => makeColorDarker(props.color!, 20)} 0,
        ${(props) => makeColorDarker(props.color!, 20)} 46%,
        #ebebeb 46%,
        #ebebeb 54%,
        ${(props) => makeColorDarker(props.color!, 20)} 54%,
        ${(props) => makeColorDarker(props.color!, 20)} 100%
      );
  }

  &:after {
    transition: color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
    z-index: 2;
    position: absolute;
    content: '${(props) => props.bet}';
    text-align: center;
    font: bold ${(props) => props.size! * 0.35}vmin /
      ${(props) => props.size! * 0.75}vmin Arial;
    white-space: pre;
    width: 75%;
    height: 75%;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-shadow: ${(props) => {
          const size = props.size! * 0.015;
          return `${-size}vmin ${-size}vmin`;
        }}
        0vmin rgba(0, 0, 0, 0.3),
      ${(props) => {
          const size = props.size! * 0.015;
          return `${size}vmin ${size}vmin`;
        }}
        0vmin rgba(255, 255, 255, 0.2),
      ${(props) => {
          const size = props.size! * 0.007;
          return `${size}vmin ${size}vmin`;
        }}
        0vmin rgba(0, 0, 0, 0.3);

    background: ${(props) => props.color};
    color: ${(props) => makeColorDarker(props.color!, 5)};
  }
  &:hover,
  &.active,
  &:disabled {
    &::after {
      color: #fff;
      text-shadow: none;
      text-shadow: ${(props) => {
            const size = props.size! * 0.015;
            return `${-size}vmin ${-size}vmin`;
          }}
          0vmin rgba(255, 255, 255, 0.3),
        ${(props) => {
            const size = props.size! * 0.015;
            return `${size}vmin ${size}vmin`;
          }}
          0vmin rgba(0, 0, 0, 0.2),
        ${(props) => {
            const size = props.size! * 0.007;
            return `${size}vmin ${size}vmin`;
          }}
          0vmin rgba(255, 255, 255, 0.3);
    }
  }
  &:hover {
    transform: scale(1.3);
    box-shadow: 0 0 5vmin ${(props) => props.color},
      0 0 25vmin ${(props) => props.color}, 0 0 50vmin ${(props) => props.color},
      0 0 100vmin ${(props) => props.color};
  }
  &:disabled{
    box-shadow: -2vmin 2vmin 5vmin #000;
  }
  &.active {
    -webkit-animation: 10s rotate-right linear infinite;
    animation: 10s rotate-right linear infinite;
    box-shadow: 0 0 5vmin ${(props) => props.color},
      0 0 25vmin ${(props) => props.color}, 0 0 50vmin ${(props) => props.color},
      0 0 100vmin ${(props) => props.color};
  }
  @-webkit-keyframes rotate-right {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg) scale(1.3);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg) scale(1.3);
    }
  }

  @keyframes rotate-right {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg) scale(1.3);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg) scale(1.3);
    }
  }
`;
