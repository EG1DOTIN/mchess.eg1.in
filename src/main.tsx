import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { DataCache } from 'eg-web-core';

// Register application-specific cache and storage prefix
DataCache.registerStoragePrefix('mchess_');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
