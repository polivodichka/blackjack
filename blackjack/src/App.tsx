import { useEffect, useState } from "react";
import "./App.css";
import { GameBoard } from "./components/GameBoard/GameBoard";
import { nanoid } from "nanoid";

function App() {
  const [surrentPlayer, setCurrentPlayer] = useState<string>("");
  useEffect(() => {
    setCurrentPlayer(nanoid());
  }, []);
  return <GameBoard />;
}

export default App;
