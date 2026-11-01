import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import RemotePage from './RemotePage';

function Standalone() {
  useEffect(() => {
    const splash = document.getElementById('boot-splash');
    splash?.classList.add('is-exiting');
    window.setTimeout(() => splash?.remove(), 240);
  }, []);
  return (
    <div className="remote-standalone">
      <RemotePage />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Standalone />
  </React.StrictMode>
);
