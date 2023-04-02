import { observer } from "mobx-react-lite";
import game from "../../store/table";
import { useCallback } from "react";

export const GameActionsComponent = observer(() => {
  const hit = useCallback(() => {
    game.hit();
  }, []);
  const stand = useCallback(() => {
    game.stand();
  }, []);
  const double = useCallback(() => {
    game.double();
  }, []);
  return (
    <>
      {game.currentPlayer && (
        <div>
          <button disabled={!game.currentPlayer.canHit ?? false} onClick={hit}>
            Hit
          </button>
          <button onClick={stand}>Stand</button>
          <button disabled={!game.currentPlayer.canSplit}>Split</button>
          <button onClick={double}>Double</button>
          <button>Insuarense</button>
        </div>
      )}
    </>
  );
});
