import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './app/auth-context';
import { PreferencesProvider } from './app/preferences';
import { App } from './app/App';
import 'antd/dist/reset.css';
import './styles.css';
import project from './app/project.json';
import { dismissBootSplash } from './app/boot-splash';
import './i18n';

document.title = project.displayName;

function ReadyApp() {
  useEffect(dismissBootSplash, []);
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PreferencesProvider>
          <ReadyApp />
        </PreferencesProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
