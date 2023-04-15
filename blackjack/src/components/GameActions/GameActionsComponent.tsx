import React from 'react';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { game } from '../../store/game';
import { ActionType, SocketEmit, SocketOn } from '../../types.ds';
import { socket } from '../../server/socket';
import { StyledBtn } from '../../App.styled';

export const GameActionsComponent: React.FC = observer(() => {
  const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false);
  const handleAction = (actionType: ActionType) => () => {
    socket.emit(
      SocketEmit.action,
      actionType,
      game.table?.id,
      game.table?.currentPlayer?.id
    );
    setButtonsDisabled(true);
  };
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
          <StyledBtn
            disabled={buttonsDisabled}
            onClick={handleAction(ActionType.insurance)}
          >
            Insurance
          </StyledBtn>
          <StyledBtn
            disabled={buttonsDisabled}
            onClick={handleAction(ActionType.skipInsurance)}
          >
            Skip insurance
          </StyledBtn>
        </>
      );
    } else {
      return (
        <div>
          {currentPlayer.canHit && (
            <StyledBtn
              disabled={buttonsDisabled}
              onClick={handleAction(ActionType.hit)}
            >
              Hit
            </StyledBtn>
          )}
          <StyledBtn
            disabled={buttonsDisabled}
            onClick={handleAction(ActionType.stand)}
          >
            Stand
          </StyledBtn>
          {currentPlayer.canSplit && (
            <StyledBtn
              disabled={buttonsDisabled}
              onClick={handleAction(ActionType.split)}
            >
              Split
            </StyledBtn>
          )}
          {currentPlayer.canDouble && (
            <StyledBtn
              disabled={buttonsDisabled}
              onClick={handleAction(ActionType.double)}
            >
              Double
            </StyledBtn>
          )}
        </div>
      );
    }
  } else {
    return <></>;
  }
});
