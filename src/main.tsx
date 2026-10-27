import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { DesignSystemPage } from './app/DesignSystemPage'

const root = document.getElementById('root')
if (!root) throw new Error('#root missing in index.html')

createRoot(root).render(
  <StrictMode>
    <DesignSystemPage />
  </StrictMode>,
)
