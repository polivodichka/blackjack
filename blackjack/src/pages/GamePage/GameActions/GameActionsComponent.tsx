import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { ButtonsWrapper } from '../../../components/ModalsManager/ModalsManager.styled';
import { ActionType, SocketEmit, SocketOn } from '../../../types.ds';
import { StyledBtn } from '../../../components/App/App.styled';
import { socket } from '../../../server/socket';
import { game } from '../../../store/game';

export const GameActionsComponent: React.FC = observer(() => {
  const { table, player } = game;
  const { currentPlayer } = table ?? {};

  const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false);

  const handleAction = (actionType: ActionType) => () => {
    game.emit[SocketEmit.Action](actionType);
    setButtonsDisabled(true);
  };

  useEffect(() => {
    socket.on(SocketOn.ActionMade, () => {
      setButtonsDisabled(false);
    });
  }, [buttonsDisabled]);

  if (!player?.isTurn) {
    return null;
  }

  const insuranceButtons = currentPlayer?.canInsurance && (
    <ButtonsWrapper>
      <StyledBtn
        disabled={buttonsDisabled}
        onClick={handleAction(ActionType.Insurance)}
      >
        Insurance
      </StyledBtn>
      <StyledBtn
        disabled={buttonsDisabled}
        onClick={handleAction(ActionType.SkipInsurance)}
      >
        Skip insurance
      </StyledBtn>
    </ButtonsWrapper>
  );
  const actionsButtons = !insuranceButtons && (
    <ButtonsWrapper>
      {currentPlayer?.canHit && (
        <StyledBtn
          disabled={buttonsDisabled}
          onClick={handleAction(ActionType.Hit)}
        >
          Hit
        </StyledBtn>
      )}
      <StyledBtn
        disabled={buttonsDisabled}
        onClick={handleAction(ActionType.Stand)}
      >
        Stand
      </StyledBtn>
      {currentPlayer?.canSplit && (
        <StyledBtn
          disabled={buttonsDisabled}
          onClick={handleAction(ActionType.Split)}
        >
          Split
        </StyledBtn>
      )}
      {currentPlayer?.canDouble && (
        <StyledBtn
          disabled={buttonsDisabled}
          onClick={handleAction(ActionType.Double)}
        >
          Double
        </StyledBtn>
      )}
    </ButtonsWrapper>
  );

  return (
    <>
      {insuranceButtons}
      {actionsButtons}
    </>
  );
});
