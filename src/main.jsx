// Guard against the ResizeObserver error inside YouTrack's widget iframe
if (typeof window !== 'undefined' && window.ResizeObserver) {
  const originalObserve = ResizeObserver.prototype.observe;
  ResizeObserver.prototype.observe = function (element, options) {
    if (element && element instanceof Element) {
      return originalObserve.call(this, element, options);
    }
  };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Register with YTApp, with a 5-second timeout
const getHostPromise = () => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Timeout: YTApp.register() did not respond within 5 seconds."));
    }, 5000);

    let attempts = 0;
    const checkAndRegister = () => {
      const ytApp = window.YTApp || (window.parent && window.parent.YTApp);
      if (ytApp && typeof ytApp.register === 'function') {
        ytApp.register()
          .then((host) => {
            clearTimeout(timer);
            resolve(host);
          })
          .catch((err) => {
            clearTimeout(timer);
            reject(err);
          });
      } else if (attempts < 30) {
        attempts++;
        setTimeout(checkAndRegister, 100);
      } else {
        clearTimeout(timer);
        reject(new Error("Nie znaleziono obiektu YTApp w oknie aplikacji."));
      }
    };

    checkAndRegister();
  });
};

const hostPromise = getHostPromise();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App hostPromise={hostPromise} />
  </React.StrictMode>
);
