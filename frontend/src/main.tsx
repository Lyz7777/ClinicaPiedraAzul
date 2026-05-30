import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import { Auth0Provider } from '@auth0/auth0-react';
import { auth0Config } from './auth/auth0-config';
import { ToastProvider } from './components/UI';
import App from './app';

console.log('✅ Iniciando aplicación frontend');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider {...auth0Config}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </Auth0Provider>
  </React.StrictMode>
);