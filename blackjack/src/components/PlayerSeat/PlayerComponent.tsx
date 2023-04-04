import { observer } from "mobx-react-lite";
import React, { FC, useCallback } from "react";
import { betValuesOptions } from "../../constants/constants";
import { Player } from "../../store/player";
import gameTable from "../../store/table";
import { Bet } from "../BetPanel/Bet";
import { CardComponent } from "../Card/CardComponent";
import { CardsTotal, CardsWrapper, OnePlayerWrapper } from "./Seat.styled";

type PlayerComponentProps = {
  player: Player;
};
export const PlayerComponent: FC<PlayerComponentProps> = observer(
  ({ player }) => {
    const handleRemoveBet = useCallback(
      (index: number) => (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        if (!gameTable.roundIsStarted) {
          player.betDeleteByIndex(index);
        }
      },
      []
    );

    return (
      <OnePlayerWrapper>
        <div>
        {!!player.insuarence.length && player.insuarence.map((bet, index) => (
          <Bet
            value={bet}
            onBetSet={handleRemoveBet(index)}
            color={
              betValuesOptions.find((betOption) => betOption.value === bet)
                ?.color ?? "#fff"
            }
            size={40}
          />
        ))}
        </div>
        {player.currentBet.map((bet, index) => (
          <Bet
            value={bet}
            onBetSet={handleRemoveBet(index)}
            color={
              betValuesOptions.find((betOption) => betOption.value === bet)
                ?.color ?? "#fff"
            }
            size={40}
          />
        ))}
        <CardsWrapper>
          {player?.hand.map((card, index) => (
            <CardComponent
              key={index + card.suit + "Card"}
              suit={card.suit}
              rank={card.rank}
            />
          ))}
        </CardsWrapper>
        <CardsTotal>{player.handTotal > 0 && player.handTotal}</CardsTotal>
      </OnePlayerWrapper>
    );
  }
);
