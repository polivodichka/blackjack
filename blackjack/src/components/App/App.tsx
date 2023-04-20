import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';

import { ModalsManager } from '../ModalsManager/ModalsManager';
import { EnterPage } from '../../pages/EnterPage/EnterPage';
import { GamePage } from '../../pages/GamePage/GamePage';

export const App: React.FC = () => {
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
