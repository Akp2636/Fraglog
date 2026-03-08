import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: '',
            duration: 3500,
            style: {
              background: '#13131f',
              color: '#eeeef5',
              border: '1px solid #1e1e35',
              fontFamily: 'Karla, sans-serif',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#08080f' },
              style: { border: '1px solid #22c55e33' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#08080f' },
              style: { border: '1px solid #ef444433' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
