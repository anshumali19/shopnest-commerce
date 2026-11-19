import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { DBProvider } from './kit/db';
import { ToastProvider } from './kit/ui';
import { seed } from './seed';
import Storefront from './storefront/Storefront';
import AdminApp from './admin/AdminApp';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <DBProvider storageKey="shopnest" seed={seed}>
          <Routes>
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="/*" element={<Storefront />} />
          </Routes>
        </DBProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
