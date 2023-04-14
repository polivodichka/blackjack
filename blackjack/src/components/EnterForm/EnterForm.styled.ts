import styled from 'styled-components';

export const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;
  font-family: sans-serif;
  background: linear-gradient(#141e30, #243b55);
`;
export const Form = styled.form`
  width: 400px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.5);
  box-sizing: border-box;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
  border-radius: 10px;
`;
export const Input = styled.input`
  font-size: 18px;
  padding: 10px 10px 10px 5px;
  -webkit-appearance: none;
  display: block;
  background: transparent;
  color: #fff;
  width: 100%;
  border: none;
  border-radius: 0;
  border-bottom: 1px solid #fff;
  &:focus ~ .highlight {
    animation: inputHighlighter 0.3s ease;
  }
  &:focus {
    outline: none;
  }
  &:focus ~ label,
  &.filled ~ label {
    top: -20px;
    transform: scale(0.75);
    left: -2px;
    color: #03e9f4;
  }
  &:focus ~ .bar:before,
  &:focus ~ .bar:after {
    width: 50%;
  }
`;
export const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 25px;
`;
export const Label = styled.label`
  color: #fff;
  font-size: 18px;
  font-weight: normal;
  position: absolute;
  pointer-events: none;
  left: 5px;
  top: 10px;
  transition: all 0.2s ease;
`;

export const ErrorMsg = styled.p`
  position: absolute;
  color: red;
  font-size: small;
  bottom: -30px;
`;
export const SubmitBtn = styled.button`
  align-self: center;
  background: none;
  cursor: pointer;
  border: 2px solid #03e9f4;
  color: #03e9f4;
  padding: 10px 20px;
  font-size: 16px;
  text-decoration: none;
  text-transform: uppercase;
  overflow: hidden;
  transition: 0.5s;
  letter-spacing: 4px;
  &:hover {
    background: #03e9f4;
    color: #fff;
    border-radius: 5px;
    box-shadow: 0 0 5px #03e9f4, 0 0 25px #03e9f4, 0 0 50px #03e9f4,
      0 0 100px #03e9f4;
  }
`;
export const CheckboxInputWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 28px;
  margin-bottom: 20px; /* add margin bottom */

  .checkbox-label {
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

  .checkbox-label:after {
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

  input[type='checkbox'] {
    visibility: hidden;
  }

  input[type='checkbox']:checked + label {
    background-color: #03e9f4;
    border-color: #03e9f4;
    box-shadow: 0 0 5px #03e9f4, 0 0 25px #03e9f4, 0 0 50px #03e9f4,
      0 0 100px #03e9f4;
  }

  input[type='checkbox']:checked + label:after {
    opacity: 1;
  }
`;

export const CheckboxLabel = styled.label`
  color: #fff;
  padding-left: 28px;
  font-size: 18px;
  font-weight: normal;
  pointer-events: none;
  width: max-content;
`;
