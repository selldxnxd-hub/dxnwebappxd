import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FirebaseProvider } from './providers/FirebaseProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { SettingsProvider } from './providers/SettingsProvider';
import { CartProvider } from './providers/CartProvider';
import { NotificationProvider } from './providers/NotificationProvider';
import { RealtimeDataProvider } from './providers/RealtimeDataProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseProvider>
      <ThemeProvider>
        <SettingsProvider>
          <CartProvider>
            <NotificationProvider>
              <RealtimeDataProvider>
                <App />
              </RealtimeDataProvider>
            </NotificationProvider>
          </CartProvider>
        </SettingsProvider>
      </ThemeProvider>
    </FirebaseProvider>
  </StrictMode>,
);

