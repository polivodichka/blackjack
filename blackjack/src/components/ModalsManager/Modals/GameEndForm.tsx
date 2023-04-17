import React from 'react';

import { EndGameActions, SocketEmit } from '../../../types.ds';
import { ButtonsWrapper, Form } from '../ModalsManager.styled';
import { StyledBtn } from '../../App/App.styled';
import { socket } from '../../../server/socket';
import { game } from '../../../store/game';

export const GameEndForm: React.FC = () => {
  const handleEndGame = (action: EndGameActions) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const { table, player } = game;
    socket.emit(SocketEmit.end_game, table?.id, player?.id, action);
    game.modalUpdate(true);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <Form onSubmit={handleFormSubmit}>
      <ButtonsWrapper>
        <StyledBtn onClick={handleEndGame(EndGameActions.rebet)}>rebet</StyledBtn>
        <StyledBtn onClick={handleEndGame(EndGameActions.newBet)}>new bet</StyledBtn>
      </ButtonsWrapper>
    </Form>
  );
};
