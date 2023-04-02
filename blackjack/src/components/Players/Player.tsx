import { observer } from "mobx-react-lite";
import { FC, MouseEventHandler, useCallback, useEffect, useState } from "react";
import { CardsWrapper, PlayerStyled } from "./Player.styled";
import game from "../../store/table";
import { CardComponent } from "../Card/CardComponent";
import { Player } from "../../store/player";
import { Bet } from "../BetPanel/Bet";
import { betValuesOptions } from "../../constants/constants";

type PlayerProps = {
  id: string;
};

export const PlayerComponent: FC<PlayerProps> = observer(({ id }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const players = game.players;

  const handleSetNewBet = useCallback(() => {
    if (!game.roundIsStarted) {
      game.addPlayer(id);
      const player = players.find((player) => player.seatId === id);
      player?.bet(game.currentBetBtnValue);
      setPlayer(player || null);
    }
  }, []);

  const handleRemoveBet = useCallback(
    (index: number) => (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      if (!game.roundIsStarted) {
        const player = players.find((player) => player.seatId === id);
        player?.betDeleteByIndex(index);
      }
    },
    []
  );

  useEffect(() => {
    setPlayer(players.find((player) => player.seatId === id) || null);
  }, [players, game]);

  return (
    <>
      <PlayerStyled
        className={
          game.currentPlayer && player && game.currentPlayer.id === player.id
            ? "active"
            : ""
        }
        onClick={handleSetNewBet}
      >
        <div className="total">
          {player && player.handTotal > 0 && player.handTotal}
        </div>
        {player &&
          player.currentBet.map((bet, index) => (
            <Bet
              value={bet}
              onBetSet={handleRemoveBet(index)}
              color={
                betValuesOptions.find((betOption) => betOption.value === bet)
                  ?.color ?? "#fff"
              }
              size={30}
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
      </PlayerStyled>
    </>
  );
});
