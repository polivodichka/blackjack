import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import game from "../../store/game";
import { ActionType, SocketEmit, SocketOn } from "../../types.ds";
import { socket } from "../../server/socket";

export const GameActionsComponent = observer(() => {
  const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false);
  const handleAction = useCallback(
    (actionType: ActionType) => () => {
      socket.emit(
        SocketEmit.action,
        actionType,
        game.table?.id,
        game.table?.currentPlayer?.id
      );
      setButtonsDisabled(true);
    },
    []
  );
  useEffect(() => {
    socket.on(SocketOn.actionMade, () => {
      setButtonsDisabled(false);
    });
  });

  return (
    <>
      {(game.table?.currentPlayer?.id === game.player?.id ||
        game.table?.currentPlayer?.parentPlayer?.id === game.player?.id) &&
        game.table!.currentPlayer &&
        (game.table!.currentPlayer.canInsurance ? (
          <>
            <button
              disabled={buttonsDisabled}
              onClick={handleAction(ActionType.insurance)}
            >
              Insurance
            </button>
            <button
              disabled={buttonsDisabled}
              onClick={handleAction(ActionType.skipInsurance)}
            >
              Skip insurance
            </button>
          </>
        ) : (
          <div>
            {game.table!.currentPlayer.canHit && (
              <button
                disabled={buttonsDisabled}
                onClick={handleAction(ActionType.hit)}
              >
                Hit
              </button>
            )}
            <button
              disabled={buttonsDisabled}
              onClick={handleAction(ActionType.stand)}
            >
              Stand
            </button>
            {game.table!.currentPlayer.canSplit && (
              <button
                disabled={buttonsDisabled}
                onClick={handleAction(ActionType.split)}
              >
                Split
              </button>
            )}
            {game.table!.currentPlayer.canDouble && (
              <button
                disabled={buttonsDisabled}
                onClick={handleAction(ActionType.double)}
              >
                Double
              </button>
            )}
          </div>
        ))}
    </>
  );
});
