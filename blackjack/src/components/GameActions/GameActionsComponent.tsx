import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import game from "../../store/game";

export const GameActionsComponent = observer(() => {
  const hit = useCallback(() => {
    game.table!.hit();
  }, []);

  const stand = useCallback(() => {
    game.table!.stand();
  }, []);

  const double = useCallback(() => {
    game.table!.double();
  }, []);

  const split = useCallback(() => {
    game.table!.split();
  }, []);

  const insurance = useCallback(() => {
    game.table!.currentPlayer && game.table!.currentPlayer.insurance();
  }, []);
  const skipInsurance = useCallback(() => {
    game.table!.currentPlayer && game.table!.currentPlayer.insurance(0);
  }, []);
  return (
    <>
      {game.table!.currentPlayer &&
        (game.table!.currentPlayer.canInsurance ? (
          <>
            <button onClick={insurance}>Insurance</button>
            <button onClick={skipInsurance}>Skip insurance</button>
          </>
        ) : (
          <div>
            {game.table!.currentPlayer.canHit && (
              <button onClick={hit}>Hit</button>
            )}
            <button onClick={stand}>Stand</button>
            {game.table!.currentPlayer.canSplit && (
              <button onClick={split}>Split</button>
            )}
            {game.table!.currentPlayer.canDouble && (
              <button onClick={double}>Double</button>
            )}
          </div>
        ))}
    </>
  );
});
