import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import '@fontsource/fira-code';
import '@fontsource/fira-mono';

const FLAG = '\x1b[104m  \x1b[41;30m▒▒\x1b[40m  \x1b[41m                \x1b[0m          Happy Pride\n\x1b[105m  \x1b[104m  \x1b[41;30m▒▒\x1b[40m  \x1b[33;41m░░░░░░░░░░░░░░\n\x1b[47m  \x1b[105m  \x1b[104m  \x1b[41;30m▒▒\x1b[40m  \x1b[43m            \n\x1b[47m  \x1b[105m  \x1b[104m  \x1b[41;30m▒▒\x1b[40m  \x1b[42m            \x1b[0m          Every month is pride month\n\x1b[105m  \x1b[104m  \x1b[41;30m▒▒\x1b[40m  \x1b[44m              \n\x1b[104m  \x1b[41;30m▒▒\x1b[40m  \x1b[45m                ';
console.log(FLAG);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
