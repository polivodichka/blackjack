import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import gameTable from "../../store/table";

export const GameActionsComponent = observer(() => {
  const hit = useCallback(() => {
    gameTable.hit();
  }, []);

  const stand = useCallback(() => {
    gameTable.stand();
  }, []);

  const double = useCallback(() => {
    gameTable.double();
  }, []);

  const split = useCallback(() => {
    gameTable.split();
  }, []);

  const insurance = useCallback(() => {
    gameTable.insurance();
  }, []);
  return (
    <>
      {gameTable.currentPlayer && (
        <div>
          <button disabled={!gameTable.currentPlayer.canHit} onClick={hit}>
            Hit
          </button>
          <button onClick={stand}>
            Stand
          </button>
          <button disabled={!gameTable.currentPlayer.canSplit} onClick={split}>
            Split
          </button>
          <button
            onClick={double}
            disabled={!gameTable.currentPlayer.canDouble}
          >
            Double
          </button>
          <button disabled={gameTable.needInsurance} onClick={insurance}>
            Insurance
          </button>
        </div>
      )}
    </>
  );
});
