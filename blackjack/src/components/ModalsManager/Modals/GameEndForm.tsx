import React from 'react';

import { ButtonsWrapper, Form } from '../ModalsManager.styled';
import { EndGameActions, SocketEmit } from '../../../types.ds';
import { StyledBtn } from '../../App/App.styled';
import { game } from '../../../store/game';

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
        <StyledBtn onClick={handleEndGame(EndGameActions.Rebet)}>
          rebet
        </StyledBtn>
        <StyledBtn onClick={handleEndGame(EndGameActions.NewBet)}>
          new bet
        </StyledBtn>
      </ButtonsWrapper>
    </Form>
  );
};
