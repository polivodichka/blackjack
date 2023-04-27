import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  ButtonsWrapper,
  InputWrapper,
  ErrorMsg,
  Input,
  Label,
  Form,
} from '../ModalsManager.styled';
import { StyledBtnWithSound } from '../../../sounds/StyledBtnWithSound';
import { SocketEmit, SocketOn, SoundType } from '../../../types.ds';
import { socket } from '../../../server/socket';
import { game } from '../../../store/game';

interface FormValues {
  balance: number;
}

export const BalanceForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormValues>();
  const [disabled, setDisabled] = useState<boolean>(false);

  const onSubmit = (data: FormValues) => {
    setDisabled(true);
    const { balance } = data;

    game.emit[SocketEmit.TopupBalance](balance);
  };
  const onCancel = () => {
    reset();
    game.modalUpdate(true);
  };

  useEffect(() => {
    const handleTopUp = () => {
      reset();
      setDisabled(false);
      game.modalUpdate(true);
    };

    socket.on(SocketOn.BalanceToppedUp, handleTopUp);

    return () => {
      socket.off(SocketOn.BalanceToppedUp, handleTopUp);
    };
  }, [reset]);

  return (
    <Form
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(onSubmit)}
      onClick={(e) => e.stopPropagation()}
    >
      <InputWrapper>
        {errors.balance && <ErrorMsg>{errors.balance.message}</ErrorMsg>}
        <Input
          autoComplete="off"
          className={`${watch('balance') ? 'filled' : ''}`}
          type="number"
          step={0.01}
          onKeyPress={(event) => {
            if (event.key === '+' || event.key === '-') {
              event.preventDefault();
            }
          }}
          {...register('balance', {
            required: 'Amount is required',
            min: {
              value: 1,
              message: 'Minimum balance should be 1',
            },
            pattern: {
              value: /^\d+(\.\d{1,2})?$/,
              message:
                'Invalid amount format. Enter a number with maximum of 2 decimal places',
            },
          })}
        />
        <Label>Top-up amount:</Label>
      </InputWrapper>
      <ButtonsWrapper>
        <StyledBtnWithSound
          soundType={SoundType.Click}
          type="submit"
          className="button buttonBlue"
          disabled={disabled}
        >
          Top up
        </StyledBtnWithSound>
        <StyledBtnWithSound
          soundType={SoundType.Click}
          type="button"
          className="button buttonRed"
          onClick={onCancel}
        >
          Cancel
        </StyledBtnWithSound>
      </ButtonsWrapper>
    </Form>
  );
};
