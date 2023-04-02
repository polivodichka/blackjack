import styled from "styled-components";

export const PlayerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
export const PlayerStyled = styled.div`
  display: block;
  height: 30vh;
  width: 16vw;
  border: 3px solid white;
  position: relative;
  &.active {
    border: 2px solid red;
  }
  & .total {
    position: absolute;
    top: 20px;
    right: 20px;
  }
`;

export const PlayersZone = styled.div`
  display: flex;
  gap: 0 20px;
`;

export const CardsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;
