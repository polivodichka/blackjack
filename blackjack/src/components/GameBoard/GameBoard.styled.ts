import styled from "styled-components";
import { COLOR } from "../../constants/constants";

export const GameBoardStyled = styled.div`
  background-color: ${COLOR.MAIN};
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
`;

export const BalanceStyled = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  &::after {
    content: "$";
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
