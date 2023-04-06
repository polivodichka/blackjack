import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import gameTable from "../../store/table";
import { BetPanel } from "../BetPanel/BetPanel";
import { GameActionsComponent } from "../GameActions/GameActionsComponent";
import { DealerSpotComponent } from "../PlayerSpot/DealerSpotComponent";
import { PlayerSpotComponent } from "../PlayerSpot/PlayerSpotComponent";
import { SpotsZone } from "../PlayerSpot/Spot.styled";
import { GameBoardStyled } from "./GameBoard.styled";

export const GameBoard = observer(() => {
  const dealerSpotId = "dealerSpot";
  const spots = [];
  for (let i = 0; i < 5; i++) {
    spots.push(<PlayerSpotComponent key={i} id={`spot-${i}`} />);
  }
  const handlePlayBtn = useCallback(() => {
    gameTable.deal(dealerSpotId);
  }, []);
  return (
    <GameBoardStyled>
      <DealerSpotComponent />
      <>
        <SpotsZone>{spots}</SpotsZone>
        <BetPanel />
      </>
      {gameTable.ableToStartGame && (
        <button onClick={handlePlayBtn}>
          PLAY
        </button>
      )}
      {gameTable.roundIsStarted && <GameActionsComponent />}
    </GameBoardStyled>
  );
});
