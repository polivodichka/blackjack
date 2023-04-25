import React from 'react';

import { ButtonsWrapper, Form } from '../ModalsManager.styled';
import { EndGameActions, SocketEmit, SoundType } from '../../../types.ds';
import { game } from '../../../store/game';
import { StyledBtnWithSound } from '../../../sounds/StyledBtnWithSound';

export const GameEndForm: React.FC = () => {
  const handleEndGame =
    (action: EndGameActions) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      game.emit[SocketEmit.EndGame](action);
      game.modalUpdate(true);
    };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <Form onSubmit={handleFormSubmit}>
      <ButtonsWrapper>
        <StyledBtnWithSound
          soundType={SoundType.Chip}
          onClick={handleEndGame(EndGameActions.Rebet)}
        >
          rebet
        </StyledBtnWithSound>
        <StyledBtnWithSound
          soundType={SoundType.Click}
          onClick={handleEndGame(EndGameActions.NewBet)}
        >
          new bet
        </StyledBtnWithSound>
      </ButtonsWrapper>
    </Form>
  );
};
