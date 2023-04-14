import React from 'react';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useState } from 'react';
import { game } from '../../store/game';
import { ActionType, SocketEmit, SocketOn } from '../../types.ds';
import { socket } from '../../server/socket';

export const GameActionsComponent: React.FC = observer(() => {
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

  const canShowActionsToThisPlayer =
    game.table?.currentPlayer?.id === game.player?.id ||
    game.table?.currentPlayer?.parentPlayer?.id === game.player?.id;
  const currentPlayer = game.table ? game.table.currentPlayer : undefined;

  if (canShowActionsToThisPlayer && currentPlayer) {
    if (currentPlayer.canInsurance) {
      return (
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
      );
    } else {
      return (
        <div>
          {currentPlayer.canHit && (
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
          {currentPlayer.canSplit && (
            <button
              disabled={buttonsDisabled}
              onClick={handleAction(ActionType.split)}
            >
              Split
            </button>
          )}
          {currentPlayer.canDouble && (
            <button
              disabled={buttonsDisabled}
              onClick={handleAction(ActionType.double)}
            >
              Double
            </button>
          )}
        </div>
      );
    }
  } else {
    return <></>;
  }
});
