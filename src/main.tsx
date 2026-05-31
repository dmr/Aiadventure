import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted variable fonts (bundled by Vite → fully offline, no Google request).
import '@fontsource-variable/manrope'
import '@fontsource-variable/bricolage-grotesque'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
