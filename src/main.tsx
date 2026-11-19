import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { z } from 'zod';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-600.css';
import '@fontsource/space-grotesk/latin-700.css';
import './styles/tokens.css';
import './styles/app.css';
import { App } from './App';

// Sin compilación con `new Function`: la CSP no permite 'unsafe-eval' (docs/02 §6).
z.config({ jitless: true });

const raiz = document.getElementById('root');
if (!raiz) throw new Error('Falta el elemento #root');

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
