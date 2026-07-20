import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import Admin from './Admin.tsx'
import Banner from './Banner.tsx'
import Followups from './Followups.tsx'
import './styles/main.scss'

// Unlinked routes: /admin (analytics) and /followups (contact worksheet) are
// password-gated; /banner is the project-this-at-your-event QR screen.
// Nothing in the app links to any of them.
const path = window.location.pathname.replace(/\/+$/, '')

function page() {
  if (path === '/admin') return <Admin />
  if (path === '/followups') return <Followups />
  if (path === '/banner') return <Banner />
  return <App />
}

createRoot(document.getElementById('root')!).render(<StrictMode>{page()}</StrictMode>)
