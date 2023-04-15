import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import React, { useEffect } from 'react';
import { ToastContainer, toast, ToastOptions } from 'react-toastify';

import { GameBoard } from './components/GameBoard/GameBoard';
import { Route, Routes } from 'react-router-dom';
import { EnterForm } from './components/EnterForm/EnterForm';
import { socket } from './server/socket';
import { SocketOn } from './types.ds';
import { toastSettings } from './App.styled';

export const App: React.FC = () => {
  
  useEffect(() => {
    socket.on(SocketOn.error, (message) => toast.error(message, toastSettings));
    socket.on(SocketOn.message, (message) => toast(message, toastSettings));
  });
  return (
    <>
      <Routes>
        <Route path="/" element={<EnterForm />} />
        <Route path="/table" element={<GameBoard />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={true}
        draggable={true}
        pauseOnHover={true}
        theme="colored"
      />
    </>
  );
};
