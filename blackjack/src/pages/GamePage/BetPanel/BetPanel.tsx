import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { betValuesOptions } from '../../../constants/constants';
import { BetPanelStyled } from './BetPanel.styled';
import { game } from '../../../store/game';
import { TBet } from '../../../types.ds';
import { Bet } from './Bet';

export const BetPanel: React.FC = observer(() => {
  const betSize = 7;
  const { table } = game;

  const handleBet = useCallback(
    (value: TBet) => () => {
      if (table) {
        table.currentBetBtnValue = value;
      }
    },
    [table]
  );

  if (table?.roundIsStarted) {
    return null;
  }

  return (
    <BetPanelStyled size={betSize}>
      {betValuesOptions.map((bet) => (
        <Bet
          key={`bet-${bet.value}`}
          value={bet.value}
          onBetSet={handleBet(bet.value)}
          color={bet.color}
          size={betSize}
          active={table?.currentBetBtnValue === bet.value}
        />
      ))}
    </BetPanelStyled>
  );
});
