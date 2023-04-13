import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import game from "../../store/game";
import { socket } from "../../server/socket";

export const EnterForm: React.FC = () => {
  const [tableId, setTableId] = useState("");
  const [joinExistingTable, setJoinExistingTable] = useState(false);
  const navigate = useNavigate();

  const handleJoinTable = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onJoinTable(joinExistingTable ? tableId : undefined);
  };
  const onJoinTable = (tableId?: string) => {
    tableId ? socket.emit("join_table", tableId) : socket.emit("create_table");
  };

  useEffect(() => {
    socket.on("tableCreated", (table, player) => {
      game.onTableCreated(JSON.parse(table), JSON.parse(player));
      navigate(`/table?id=${game.table!.id}`);
      console.log("tableCreated", game.player);
    });
    socket.on("tableJoined", (table, player) => {
      game.onTableJoined(JSON.parse(table));
      console.log("tableJoined", game.player);
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
