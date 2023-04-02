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
