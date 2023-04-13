import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import game from "../../store/game";
import { socket } from "../../server/socket";
import { SocketEmit, SocketOn } from "../../types.ds";

export const EnterForm: React.FC = () => {
  const [tableId, setTableId] = useState("");
  const [joinExistingTable, setJoinExistingTable] = useState(false);
  const navigate = useNavigate();

  const handleJoinTable = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onJoinTable(joinExistingTable ? tableId : undefined);
  };
  const onJoinTable = (tableId?: string) => {
    tableId
      ? socket.emit(SocketEmit.join_table, tableId)
      : socket.emit(SocketEmit.create_table);
  };

  useEffect(() => {
    socket.on(SocketOn.tableCreated, (table, player) => {
      game.onTableCreated(JSON.parse(table), JSON.parse(player));
      navigate(`/table?id=${game.table!.id}`);
    });
    socket.on(SocketOn.tableJoined, (table) => {
      game.onTableJoined(JSON.parse(table));
    });
  });

  const handleToggleJoinExistingTable = () => {
    setJoinExistingTable((prev) => !prev);
  };

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
            <input
              type="text"
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
            />
          </label>
        </div>
      )}
      <button type="submit">Join</button>
    </form>
  );
};

export default EnterForm;
