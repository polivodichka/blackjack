import styled from "styled-components";

export const PlayersWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 15px;
`;
export const OnePlayerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
`;
export const SeatStyled = styled.div`
  display: block;
  height: 30vh;
  width: 16vw;
  border: 3px solid white;
  position: relative;
  &.active {
    border: 2px solid red;
  }
`;

export const SeatsZone = styled.div`
  display: flex;
  gap: 0 20px;
`;

export const CardsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

export const CardsTotal = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 2 ;
`;
