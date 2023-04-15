import React from 'react';
import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { betValuesOptions } from '../../constants/constants';
import { game } from '../../store/game';
import { Bet } from './Bet';
import { BetPanelStyled } from './BetPanel.styled';
import { TBet } from '../../types.ds';

export const BetPanel: React.FC = observer(() => {
  const handleBet = useCallback(
    (value: TBet) => () => {
      if (game.table) {
        game.table.setCurrentBetBtnValue(value);
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
              className={
                game.table && game.table.currentBetBtnValue === bet.value
                  ? 'active'
                  : ''
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
