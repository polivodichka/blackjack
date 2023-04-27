import { observer } from 'mobx-react-lite';
import React from 'react';

import { SoundSettingsForm } from './Modals/SoundSettingsForm';
import { ModalTypes, SoundType } from '../../types.ds';
import { BalanceForm } from './Modals/BalanceForm';
import { GameEndForm } from './Modals/GameEndForm';
import { Overflow } from './ModalsManager.styled';
import { EnterForm } from './Modals/EnterForm';
import { game } from '../../store/game';
import { Chat } from './Chat/Chat';

const MODAL_COMPONENTS = {
  [ModalTypes.CreateOrJoin]: EnterForm,
  [ModalTypes.Balance]: BalanceForm,
  [ModalTypes.GameEnd]: GameEndForm,
  [ModalTypes.Chat]: Chat,
  [ModalTypes.Sounds]: SoundSettingsForm,
};

export const ModalsManager: React.FC = observer(() => {
  const ModalComponent = MODAL_COMPONENTS[game.modal.type];
  const handleHide = () => {
    if (
      ModalComponent === MODAL_COMPONENTS.Balance ||
      ModalComponent === MODAL_COMPONENTS.Chat ||
      ModalComponent === MODAL_COMPONENTS.Sounds
    ) {
      game.playSound(SoundType.Click);
      game.modalUpdate(true);
    }
  };
  return ModalComponent ? (
    <Overflow className={game.modal.hide ? '' : 'active'} onClick={handleHide}>
      <ModalComponent />
    </Overflow>
  ) : null;
});
