import React from 'react';
import ReactDOM from 'react-dom/client';
import * as lucide from 'lucide-react';
import App from './App';
import './index.css';

// Compatibility layer for generated components
(window as any).React = React;
(window as any).lucide = lucide;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);