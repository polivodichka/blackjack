import React, { useCallback } from "react";
import { Bet } from "./Bet";
import { BetPanelStyled } from "./BetPanel.styled";
import game from "../../store/table";
import { observer } from "mobx-react-lite";
import { getRandomBrightColor } from "../../utils/makeColorDarker";
import { betValuesOptions } from "../../constants/constants";

export const BetPanel = observer(() => {
  const handleBet = useCallback(
    (value: number) => () => {
      game.setCurrentBetBtnValue(value);
    },
    []
  );
  return (
    <BetPanelStyled>
      {betValuesOptions.map((bet, index) => (
        <Bet
          key={index + "bet"}
          value={bet.value}
          onBetSet={handleBet(bet.value)}
          color={bet.color}
          size={70}
          className={game.currentBetBtnValue === bet.value ? "active" : ""}
        />
      ))}
    </BetPanelStyled>
  );
});
