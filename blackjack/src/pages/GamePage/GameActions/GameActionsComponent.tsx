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
    socket.emit(
      SocketEmit.action,
      actionType,
      table?.id,
      table?.currentPlayer?.id
    );
    setButtonsDisabled(true);
  };

  useEffect(() => {
    socket.on(SocketOn.actionMade, () => {
      setButtonsDisabled(false);
    });
  }, [buttonsDisabled]);

  if (!player?.isTurn) {
    return <></>;
  }

  const insuranceButtons = currentPlayer?.canInsurance && (
    <ButtonsWrapper>
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
    </ButtonsWrapper>
  );
  const actionsButtons = !insuranceButtons && (
    <ButtonsWrapper>
      {currentPlayer?.canHit && (
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
      {currentPlayer?.canSplit && (
        <StyledBtn
          disabled={buttonsDisabled}
          onClick={handleAction(ActionType.split)}
        >
          Split
        </StyledBtn>
      )}
      {currentPlayer?.canDouble && (
        <StyledBtn
          disabled={buttonsDisabled}
          onClick={handleAction(ActionType.double)}
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
