import { useEffect, useState } from "react";
import "./App.css";
import { GameBoard } from "./components/GameBoard/GameBoard";
import { nanoid } from "nanoid";
import { Route, Routes } from "react-router-dom";
import EnterForm from "./components/EnterForm/EnterForm";

function App() {
  return (
    <Routes>
      <Route path="/" element={<EnterForm />} />
      <Route path="/table" element={<GameBoard />} />
    </Routes>
  );
}

export default App;
