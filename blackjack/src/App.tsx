import './App.css';
import React from 'react';

import { GameBoard } from './components/GameBoard/GameBoard';
import { Route, Routes } from 'react-router-dom';
import { EnterForm } from './components/EnterForm/EnterForm';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<EnterForm />} />
      <Route path="/table" element={<GameBoard />} />
    </Routes>
  );
};
