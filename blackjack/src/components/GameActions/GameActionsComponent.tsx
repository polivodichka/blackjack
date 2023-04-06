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
    gameTable.currentPlayer && gameTable.currentPlayer.insurance();
  }, []);
  const skipInsurance = useCallback(() => {
    gameTable.currentPlayer && gameTable.currentPlayer.insurance(0);
  }, []);
  return (
    <>
      {gameTable.currentPlayer &&
        (gameTable.currentPlayer.canInsurance ? (
          <>
            <button onClick={insurance}>Insurance</button>
            <button onClick={skipInsurance}>Skip insurance</button>
          </>
        ) : (
          <div>
            {gameTable.currentPlayer.canHit && (
              <button onClick={hit}>Hit</button>
            )}
            <button onClick={stand}>Stand</button>
            {gameTable.currentPlayer.canSplit && (
              <button onClick={split}>Split</button>
            )}
            {gameTable.currentPlayer.canDouble && (
              <button onClick={double}>Double</button>
            )}
          </div>
        ))}
    </>
  );
});
