import React from 'react';
import { GameTextStyled } from './GameText.styled';

export const GameText: React.FC = () => {
  return (
    <GameTextStyled>
      <h2>Blackjack</h2>
      <p>pays 3 to 2</p>
      <p>Dealer must draw to 16 and stand on all 17s</p>
      <p>Insurance pays 2 to 1</p>
      <p>No mid-shoe entry</p>
    </GameTextStyled>
  );
};
