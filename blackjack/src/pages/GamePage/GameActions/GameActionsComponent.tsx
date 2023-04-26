import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { ButtonsWrapper } from '../../../components/ModalsManager/ModalsManager.styled';
import { ActionType, SocketEmit, SocketOn, SoundType } from '../../../types.ds';
import { StyledBtn } from '../../../components/App/App.styled';
import { socket } from '../../../server/socket';
import { game } from '../../../store/game';
import { StyledBtnWithSound } from '../../../sounds/StyledBtnWithSound';

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
        soundType={SoundType.Click}
        disabled={buttonsDisabled}
        onClick={handleAction(ActionType.Insurance)}
      >
        Insurance
      </StyledBtn>
      <StyledBtnWithSound
        soundType={SoundType.Click}
        disabled={buttonsDisabled}
        onClick={handleAction(ActionType.SkipInsurance)}
      >
        Skip insurance
      </StyledBtnWithSound>
    </ButtonsWrapper>
  );
  const actionsButtons = !insuranceButtons && (
    <ButtonsWrapper>
      {currentPlayer?.canHit && (
        <StyledBtn
          soundType={SoundType.Click}
          disabled={buttonsDisabled}
          onClick={handleAction(ActionType.Hit)}
        >
          Hit
        </StyledBtn>
      )}
      {currentPlayer?.canHit && (
        <StyledBtnWithSound
          soundType={SoundType.Click}
          disabled={buttonsDisabled}
          onClick={handleAction(ActionType.Stand)}
        >
          Stand
        </StyledBtnWithSound>
      )}

      {currentPlayer?.canSplit && (
        <StyledBtn
          soundType={SoundType.Click}
          disabled={buttonsDisabled}
          onClick={handleAction(ActionType.Split)}
        >
          Split
        </StyledBtn>
      )}
      {currentPlayer?.canDouble && (
        <StyledBtn
          soundType={SoundType.Click}
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
