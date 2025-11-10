import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { registerServiceWorker, initPWAInstaller } from './utils/pwaInstaller'

registerServiceWorker();
initPWAInstaller();

createRoot(document.getElementById("root")!).render(<App />);