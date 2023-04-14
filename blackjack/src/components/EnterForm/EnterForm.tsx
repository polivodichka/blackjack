import React, { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { game } from '../../store/game';
import { socket } from '../../server/socket';
import { SocketEmit, SocketOn } from '../../types.ds';

export const EnterForm: React.FC = () => {
  const [tableId, setTableId] = useState('');
  const [joinExistingTable, setJoinExistingTable] = useState(false);
  const navigate = useNavigate();

  const handleJoinTable = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onJoinTable(joinExistingTable ? tableId : undefined);
  };
  const onJoinTable = (id?: string) => {
    id
      ? socket.emit(SocketEmit.join_table, id)
      : socket.emit(SocketEmit.create_table);
  };

  const handleToggleJoinExistingTable = () => {
    setJoinExistingTable((prev) => !prev);
  };
  const handleInputTableId = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTableId(e.target.value);

  useEffect(() => {
    socket.on(SocketOn.tableCreated, (table, player) => {
      game.onTableCreated(JSON.parse(table), JSON.parse(player));
      if (game.table) {
        navigate(`/table?id=${game.table.id}`);
      }
    });
    socket.on(SocketOn.tableJoined, (table) => {
      game.onTableJoined(JSON.parse(table));
    });
  });

  return (
    <form onSubmit={handleJoinTable}>
      <div>
        <label>
          <input
            type="checkbox"
            checked={joinExistingTable}
            onChange={handleToggleJoinExistingTable}
          />
          Join existing table
        </label>
      </div>
      {joinExistingTable && (
        <div>
          <label>
            Table ID:
            <input type="text" value={tableId} onChange={handleInputTableId} />
          </label>
        </div>
      )}
      <button type="submit">Join</button>
    </form>
  );
};
