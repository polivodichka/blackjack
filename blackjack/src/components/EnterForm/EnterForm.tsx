import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { game } from '../../store/game';
import { socket } from '../../server/socket';
import { SocketEmit, SocketOn } from '../../types.ds';
import {
  ErrorMsg,
  Wrapper,
  Input,
  Label,
  Form,
  InputWrapper,
  SubmitBtn,
  CheckboxInputWrapper,
  CheckboxLabel,
} from './EnterForm.styled';

interface FormValues {
  name: string;
  balance: number;
  joinExistingTable: boolean;
  tableId?: string;
}

export const EnterForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>();
  const navigate = useNavigate();

  const onSubmit = (data: FormValues) => {
    const { name, balance, joinExistingTable, tableId } = data;
    if (joinExistingTable && !tableId) {
      return;
    }
    onJoinTable(joinExistingTable ? tableId : undefined, name, balance);
  };

  const onJoinTable = (id?: string, name?: string, balance?: number) => {
    id
      ? socket.emit(SocketEmit.join_table, id, name ?? '', balance ?? 0)
      : socket.emit(SocketEmit.create_table, name ?? '', balance ?? 0);
  };

  useEffect(() => {
    socket.on(SocketOn.tableCreated, (table, player) => {
      game.onTableCreated(JSON.parse(table), JSON.parse(player));
      if (game.table && game.player) {
        navigate(`/table?id=${game.table.id}&player=${game.player.id}`);
      }
    });
    socket.on(SocketOn.tableJoined, (table) => {
      game.onTableJoined(JSON.parse(table));
    });
  });

  return (
    <Wrapper>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <InputWrapper>
          {errors.name && <ErrorMsg>{errors.name.message}</ErrorMsg>}
          <Input
            autoComplete="off"
            className={`${watch('name') ? 'filled' : ''}`}
            type="text"
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 3,
                message: 'Name should be at least 3 characters',
              },
              maxLength: {
                value: 25,
                message: 'Name should not exceed 25 characters',
              },
            })}
          />
          <Label>Name:</Label>
        </InputWrapper>
        <InputWrapper>
          {errors.balance && <ErrorMsg>{errors.balance.message}</ErrorMsg>}
          <Input
            autoComplete="off"
            className={`${watch('balance') ? 'filled' : ''}`}
            type="number"
            {...register('balance', {
              required: 'Balance is required',
              min: {
                value: 2,
                message: 'Minimum balance should be 2',
              },
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message:
                  'Invalid balance format. Enter a number with maximum of 2 decimal places',
              },
            })}
          />
          <Label>Balance:</Label>
        </InputWrapper>
        <CheckboxInputWrapper>
          <input
            id="checkbox"
            type="checkbox"
            className="checkbox-input"
            {...register('joinExistingTable')}
          />
          <label className="checkbox-label" htmlFor="checkbox"></label>

          <CheckboxLabel>Join existing table</CheckboxLabel>
        </CheckboxInputWrapper>
        {watch('joinExistingTable') && (
          <InputWrapper>
            {errors.tableId && <ErrorMsg>{errors.tableId.message}</ErrorMsg>}
            <Input
              autoComplete="off"
              className={`${watch('tableId') ? 'filled' : ''}`}
              type="text"
              {...register('tableId', {
                required: 'Table ID is required',
              })}
            />
            <Label>Table id:</Label>
          </InputWrapper>
        )}
        <SubmitBtn type="submit" className="button buttonBlue">
          {watch('joinExistingTable') ? 'Join table' : 'Create table'}
        </SubmitBtn>
      </Form>
    </Wrapper>
  );
};
