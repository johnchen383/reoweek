import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import Admin from './Admin.tsx'
import Banner from './Banner.tsx'
import './styles/main.scss'

// Unlinked routes: /admin (analytics, password-gated) and /banner (the
// project-this-at-your-event QR screen) — nothing in the app links to them.
const path = window.location.pathname.replace(/\/+$/, '')

function page() {
  if (path === '/admin') return <Admin />
  if (path === '/banner') return <Banner />
  return <App />
}

createRoot(document.getElementById('root')!).render(<StrictMode>{page()}</StrictMode>)
