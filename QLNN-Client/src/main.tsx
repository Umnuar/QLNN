import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppProvider } from './AppContext';
import { ModalProvider } from './hooks/useModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <ModalProvider>
          <App />
        </ModalProvider>
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
