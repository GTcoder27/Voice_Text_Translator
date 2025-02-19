import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css'
import App from './App.jsx'
import { BrowserRouter} from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain="dev-kmar8k3bdxdykbdi.us.auth0.com"
    clientId="gDSaFaBuT83PcnheZQVvINzp5WXDZdD5"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>  
    </StrictMode>
  </Auth0Provider>,
)
