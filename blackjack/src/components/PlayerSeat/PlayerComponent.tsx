import { observer } from "mobx-react-lite";
import React, { FC, useCallback } from "react";
import { betValuesOptions } from "../../constants/constants";
import { Player } from "../../store/player";
import gameTable from "../../store/table";
import { Bet } from "../BetPanel/Bet";
import { CardComponent } from "../Card/CardComponent";
import {
  CardsTotal,
  CardsWrapper,
  GameEndComponent,
  OnePlayerWrapper,
} from "./Seat.styled";

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

    const handleRestart = useCallback((e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      player.reset();
    }, []);

    const handleLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      gameTable.playerRemove(player);
    }, []);

    return (
      <>
        {player.roundIsEnded && (
          <GameEndComponent>
            <button onClick={handleRestart}>restart</button>
            <button onClick={handleLeave}>leave</button>
          </GameEndComponent>
        )}
        <OnePlayerWrapper
          className={player.id === gameTable.currentPlayer?.id ? "active" : ""}
        >
          <div>
            {!!player.insuarence.length &&
              player.insuarence.map((bet, index) => (
                <Bet
                  value={bet}
                  onBetSet={handleRemoveBet(index)}
                  color={
                    betValuesOptions.find(
                      (betOption) => betOption.value === bet
                    )?.color ?? "#fff"
                  }
                  size={40}
                />
              ))}
          </div>
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
      </>
    );
  }
);
