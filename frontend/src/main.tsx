import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './lib/i18n';
import './index.css';
import App from './App.tsx';
import { initializeTheme } from './lib/theme';

initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
