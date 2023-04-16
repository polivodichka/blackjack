import { observer } from 'mobx-react-lite';
import React from 'react';

import { BalanceForm } from './Modals/BalanceForm';
import { GameEndForm } from './Modals/GameEndForm';
import { Overflow } from './ModalsManager.styled';
import { EnterForm } from './Modals/EnterForm';
import { ModalTypes } from '../../types.ds';
import { game } from '../../store/game';

const MODAL_COMPONENTS = {
  [ModalTypes.CreateOrJoin]: EnterForm,
  [ModalTypes.Balance]: BalanceForm,
  [ModalTypes.GameEnd]: GameEndForm,
};

export const ModalsManager: React.FC = observer(() => {
  const ModalComponent = MODAL_COMPONENTS[game.modal.type];
  const handleHide = () => {
    if (ModalComponent === MODAL_COMPONENTS.Balance) {
      game.modal.hide = true;
    }
  };
  return ModalComponent ? (
    <Overflow className={game.modal.hide ? '' : 'active'} onClick={handleHide}>
      <ModalComponent />
    </Overflow>
  ) : null;
});
