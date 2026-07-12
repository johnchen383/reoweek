import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import Admin from './Admin.tsx'
import './styles/main.scss'

// Unlinked route: the analytics page lives at /admin and is only reachable by
// knowing the URL — nothing in the app links to it.
const path = window.location.pathname.replace(/\/+$/, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>{path === '/admin' ? <Admin /> : <App />}</StrictMode>,
)
