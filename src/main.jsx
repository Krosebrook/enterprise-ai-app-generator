import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { registerServiceWorker } from '@/utils/pwa'

// Register service worker for PWA functionality
if (import.meta.env.PROD) {
  registerServiceWorker().catch(error => {
    console.error('Failed to register service worker:', error);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
