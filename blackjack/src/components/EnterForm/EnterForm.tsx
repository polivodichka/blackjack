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
    console.log(tableId);
    socket.emit("create_table");
    //game.startGame();
  };
  useEffect(() => {
    socket.on("tableCreated", (table, player) => {
      game.set(player, table);
      console.log("Table created", tableId);
      console.log("Player added to table:", player);
      navigate("/table");
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
