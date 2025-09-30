import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { LocationProvider } from './contexts/LocationContext'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <LocationProvider>
    <App />
  </LocationProvider>
);
