/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/indent */
import styled from 'styled-components';
import React from 'react';

import { makeColorDarker } from '../../../utils/makeColorDarker';

export const BetPanelStyled = styled.div.attrs(
  (props: { size: number; }) => props
)`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${(props) => props.size * 0.35}px;
  width: 100%;
`;
type ChipStyledProps = {
  color: string;
  bet: number;
  size: number;
} & React.HTMLProps<HTMLButtonElement>;
export const ChipStyled = styled.button.attrs(
  (
    props: ChipStyledProps
  ) => props
)`
  cursor: pointer;
  position: relative;
  display: inline-block;
  width: ${(props) => props.size}px;
  max-width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  max-height: ${(props) => props.size}px;
  //box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.5), 0 0 3px 0 rgba(0, 0, 0, 0.4) inset;
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
    transform 0.7s ease-in-out;
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

    border: ${(props) => props.size! * 0.05}px solid ${(props) => props.color};
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
    font: bold ${(props) => props.size! * 0.35}px /
      ${(props) => props.size! * 0.75}px Arial;
    white-space: pre;
    width: 75%;
    height: 75%;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-shadow: ${(props) => {
          const size = props.size! * 0.015;
          return `${-size}px ${-size}px`;
        }}
        0px rgba(0, 0, 0, 0.3),
      ${(props) => {
          const size = props.size! * 0.015;
          return `${size}px ${size}px`;
        }}
        0px rgba(255, 255, 255, 0.2),
      ${(props) => {
          const size = props.size! * 0.007;
          return `${size}px ${size}px`;
        }}
        0px rgba(0, 0, 0, 0.3);

    background: ${(props) => props.color};
    color: ${(props) => makeColorDarker(props.color!, 5)};
  }
  &:hover,
  &.active {
    &::after {
      color: #fff;
      text-shadow: none;
      text-shadow: ${(props) => {
            const size = props.size! * 0.015;
            return `${-size}px ${-size}px`;
          }}
          0px rgba(255, 255, 255, 0.3),
        ${(props) => {
            const size = props.size! * 0.015;
            return `${size}px ${size}px`;
          }}
          0px rgba(0, 0, 0, 0.2),
        ${(props) => {
            const size = props.size! * 0.007;
            return `${size}px ${size}px`;
          }}
          0px rgba(255, 255, 255, 0.3);
    }
  }
  &:hover {
    transform: scale(1.3);
    box-shadow: 0 0 5px ${(props) => props.color},
      0 0 25px ${(props) => props.color}, 0 0 50px ${(props) => props.color},
      0 0 100px ${(props) => props.color};
  }
  &.active {
    -webkit-animation: 10s rotate-right linear infinite;
    animation: 10s rotate-right linear infinite;
    box-shadow: 0 0 5px ${(props) => props.color},
      0 0 25px ${(props) => props.color}, 0 0 50px ${(props) => props.color},
      0 0 100px ${(props) => props.color};
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
export const BetBtnStyled = styled.div`
  width: 60px;
  height: 60px;
  border: 2px solid red;
  border-radius: 50%;
`;
