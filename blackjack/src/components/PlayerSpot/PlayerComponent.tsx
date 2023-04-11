import { observer } from "mobx-react-lite";
import React, { FC, useCallback } from "react";
import { betValuesOptions } from "../../constants/constants";
import { Player } from "../../store/player";
import game from "../../store/game";
import { Bet } from "../BetPanel/Bet";
import { CardComponent } from "../Card/CardComponent";
import {
  CardsTotal,
  CardsWrapper,
  ChipsWrapper,
  OnePlayerWrapper,
} from "./Spot.styled";

type PlayerComponentProps = {
  player: Player;
};
export const PlayerComponent: FC<PlayerComponentProps> = observer(
  ({ player }) => {
    const handleRemoveBet = useCallback(
      (index: number) => (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        if (!game.table!.roundIsStarted) {
          player.betDeleteByIndex(index);
        }
      },
      []
    );

    return (
      <>
        <OnePlayerWrapper
          className={
            player.id === game.table!.currentPlayer?.id ? "active" : ""
          }
        >
          <ChipsWrapper>
            {!!player.insuranceBet && (
              <Bet
                value={player.insuranceBet}
                onBetSet={() => {}}
                color="#ccff00"
                size={40}
              />
            )}
          </ChipsWrapper>
          <ChipsWrapper>
            {player.betChips.map((bet, index) => (
              <Bet
                key={`${player}-bet${index}-${bet}`}
                value={bet}
                onBetSet={handleRemoveBet(index)}
                color={
                  betValuesOptions.find((betOption) => betOption.value === bet)
                    ?.color ?? "#fff"
                }
                size={40}
              />
            ))}
          </ChipsWrapper>
          <CardsWrapper>
            {player?.hand.map((card, index) => (
              <CardComponent
                key={index + card.suit + "Card"}
                suit={card.suit}
                rank={card.rank}
              />
            ))}
            {player.handTotal > 0 && (
              <CardsTotal>{player.handTotal}</CardsTotal>
            )}
          </CardsWrapper>
        </OnePlayerWrapper>
      </>
    );
  }
);
