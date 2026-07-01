import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import './sentry'
import './firebase'
import { prefetchTrendingData } from './utils/apiCache'

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        if (import.meta.env.DEV) {
          console.log('Service Worker registered: ', registration)
        }
      },
      (error) => {
        if (import.meta.env.DEV) {
          console.log('Service Worker registration failed: ', error)
        }
      }
    )
  })
}

// Prefetch trending data in the background for faster navigation
prefetchTrendingData()
void import('./pages/Trending')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
