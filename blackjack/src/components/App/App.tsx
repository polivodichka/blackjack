import { toast, ToastContainer } from 'react-toastify';
import { Route, Routes } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect } from 'react';

import { ModalsManager } from '../ModalsManager/ModalsManager';
import { EnterPage } from '../../pages/EnterPage/EnterPage';
import { GamePage } from '../../pages/GamePage/GamePage';
import { socket } from '../../server/socket';
import { toastSettings } from './App.styled';
import { SocketOn } from '../../types.ds';

export const App: React.FC = () => {
  useEffect(() => {
    socket.on(SocketOn.error, (message) => toast.error(message, toastSettings));
    socket.on(SocketOn.message, (message) => toast(message, toastSettings));
  });
  return (
    <>
      <Routes>
        <Route path="/" element={<EnterPage />} />
        <Route path="/table" element={<GamePage />} />
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
      <ModalsManager />
    </>
  );
};
