import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { Toaster } from 'sonner'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        className="max-sm:!top-16 max-sm:!right-2 max-sm:!left-2"
        toastOptions={{
          className: 'max-sm:!w-full',
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
