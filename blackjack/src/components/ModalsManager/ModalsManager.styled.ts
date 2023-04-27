import styled from 'styled-components';

import { Color } from '../../constants/constants';

export const Overflow = styled.div`
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;
  background-color: rgba(0, 0, 0, 0.4);
  transform: translateY(-100%);
  opacity: 0;
  z-index: 10;
  &.active {
    transform: translateY(0);
    opacity: 1;
  }
  &.light {
    background: transparent;
  }
  transition: transform 0.7s ease-in-out, opacity 0.4s ease-in-out 0.15s;
`;
export const Form = styled.form`
  width: 400px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  background: rgba(13, 19, 30, 0.9);
  box-sizing: border-box;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
  border-radius: 10px;
`;
export const Input = styled.input`
  font-size: 1.9vmin;
  padding: 5px;
  -webkit-appearance: none;
  display: block;
  background: transparent;
  color: #fff;
  width: 100%;
  border: none;
  border-radius: 0;
  border-bottom: 1px solid #fff;

  &:focus {
    outline: none;
  }
  &:focus ~ label,
  &.filled ~ label {
    top: -2.3vmin;
    transform: scale(0.75);
    left: -2px;
    color: ${Color.MainAccent};
  }
  &:focus ~ .bar:before,
  &:focus ~ .bar:after {
    width: 50%;
  }
`;
export const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 4vmin;
`;
export const Label = styled.label`
  color: #fff;
  font-size: 1.9vmin;
  font-weight: normal;
  position: absolute;
  pointer-events: none;
  left: 5px;
  top: 5px;
  transition: all 0.2s ease;
`;

export const ErrorMsg = styled.p`
  position: absolute;
  color: red;
  font-size: small;
  bottom: -30px;
`;

export const CheckboxInputWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 3.4vmin;
  margin-bottom: 3.5vmin;
`;

export const ChecboxInput = styled.input`
  &[type='checkbox'] {
    visibility: hidden;
    &:checked + label {
      background-color: ${Color.MainAccent};
      border-color: ${Color.MainAccent};
      box-shadow: 0 0 5px ${Color.MainAccent}, 0 0 25px ${Color.MainAccent},
        0 0 50px ${Color.MainAccent}, 0 0 100px ${Color.MainAccent};
    }
    &:checked + label:after {
      opacity: 1;
    }
    & ~ .fake-check {
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 50%;
      cursor: pointer;
      height: 28px;
      left: 0;
      position: absolute;
      top: 0;
      width: 28px;
    }

    & ~ .fake-check:after {
      border: 2px solid #fff;
      border-top: none;
      border-right: none;
      content: '';
      height: 6px;
      left: 7px;
      opacity: 0;
      position: absolute;
      top: 8px;
      transform: rotate(-45deg);
      width: 12px;
    }
  }
`;

export const CheckboxLabel = styled.label`
  color: #fff;
  padding-left: 28px;
  font-size: 1.9vmin;
  font-weight: normal;
  pointer-events: none;
  width: max-content;
`;
export const ButtonsWrapper = styled.div`
  display: flex;
  align-self: center;
  gap: 5px;
`;
export const RangeBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  gap: 5px;
`;
export const RangeBarInput = styled.input`
  -webkit-appearance: none !important; 
  width: 100%;
  height: 1.9vmin;
  background-color: ${Color.MainDark};
  border: 1px solid ${Color.MainAccent};
  border-radius: 10px;
  margin: auto;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background-color: ${Color.Main};
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none !important ;
    width: 20px;
    height: 20px;
    background-color: ${Color.Main};
    border-radius: 30px;
    box-shadow: 0px 0px 3px ${Color.MainAccent};
    transition: all 0.5s ease;

    &:hover {
      background-color: ${Color.MainAccent};
    cursor: pointer;
    }
  }
`;
