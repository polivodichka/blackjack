import styled from 'styled-components';

export const Wrapper = styled.div`
  position: relative;
  background: linear-gradient(#141e30, #243b55);
  color: white;
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-rows: 4fr 1fr;
  
  .buttons {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
  }
`;

export const GameWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  gap: 50px 0;
  width: 100%;
  transform: perspective(1000px) translateZ(-300px) rotateX(30deg);
`;

export const BalanceStyled = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  gap: 5px;
  top: 20px;
  left: 20px;
  div::after {
    content: '$';
  }
`;

export const GameEndComponent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  height: 100%;
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
`;

export const OptionsPanel = styled.div`
  position: absolute;
  right: 20px;
  top: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
`;
