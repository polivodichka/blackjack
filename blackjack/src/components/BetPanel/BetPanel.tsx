import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import React from 'react';

import { BetPanelStyled } from '../../pages/GamePage/BetPanel/BetPanel.styled';
import { betValuesOptions } from '../../constants/constants';
import { Bet } from '../../pages/GamePage/BetPanel/Bet';
import { game } from '../../store/game';
import { TBet } from '../../types.ds';

export const BetPanel: React.FC = observer(() => {
  const handleBet = useCallback(
    (value: TBet) => () => {
      if (game.table) {
        game.table.currentBetBtnValue = value;
      }
    },
    []
  );
  return (
    <>
      {!game.table?.roundIsStarted ? (
        <BetPanelStyled>
          {betValuesOptions.map((bet, i) => (
            <Bet
              key={`${bet}bet${i}`}
              value={bet.value}
              onBetSet={handleBet(bet.value)}
              color={bet.color}
              size={70}
              active={
                (game.table && game.table.currentBetBtnValue === bet.value) ??
              false
              }
            />
          ))}
        </BetPanelStyled>
      ) : (
        React.Fragment
      )}
    </>
  );
});
