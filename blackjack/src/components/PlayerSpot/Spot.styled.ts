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
  &.active {
    animation: pulse 2s ease-in-out infinite;
  }
`;
export const SpotStyled = styled.div`
  display: block;
  height: 30vh;
  width: 16vw;
  border: 3px solid white;
  border-radius: 9px;
  padding: 20px 0;
  position: relative;
  cursor: pointer;
  &.active {
    border: 2px solid red;
  }
  &.empty {
    animation: pulse 2s ease-in-out infinite;
  }
`;

export const SpotsZone = styled.div`
  display: flex;
  gap: 0 20px;
`;

export const CardsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

export const CardsTotal = styled.div`
  height: 20px;
  width: 20px;
  height: min-content;
  color: white;
  background-color: #5dadec;
  text-align: center;
  padding: 3px;
  border-radius: 50%;
  z-index: 2;
`;

export const BalanceStyled = styled.div`
  position: absolute;
  bottom: 0;
  &::after {
    content: "$";
  }
`;
export const ChipsWrapper = styled.div`
  display: flex;
  flex-direction: row;
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
