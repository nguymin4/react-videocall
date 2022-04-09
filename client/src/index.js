import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './js/App';
import './css/app.scss';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
