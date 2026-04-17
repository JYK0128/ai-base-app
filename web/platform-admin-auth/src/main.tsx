import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="auth-app-page">
      <App />
    </div>
  </StrictMode>,
);
