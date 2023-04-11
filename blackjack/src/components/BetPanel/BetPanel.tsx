import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import { betValuesOptions } from "../../constants/constants";
import game from "../../store/game";
import { Bet } from "./Bet";
import { BetPanelStyled } from "./BetPanel.styled";

export const BetPanel = observer(() => {
  const handleBet = useCallback(
    (value: number) => () => {
      game.table!.setCurrentBetBtnValue(value);
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
          className={
            game.table!.currentBetBtnValue === bet.value ? "active" : ""
          }
        />
      ))}
    </BetPanelStyled>
  );
});
