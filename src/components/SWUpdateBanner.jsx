import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

/**
 * Service Worker Update Banner component
 * Shows a notification when a new version of the app is available
 * Provides user control over when to apply the update
 * @returns {JSX.Element|null} Update banner or null if no update available
 */
export default function SWUpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [newWorker, setNewWorker] = useState(null);

  useEffect(() => {
    // Listen for service worker updates
    const handleUpdate = (event) => {
      setRegistration(event.detail.registration);
      setNewWorker(event.detail.newWorker);
      setShowUpdate(true);
    };

    window.addEventListener('sw-update-available', handleUpdate);

    return () => {
      window.removeEventListener('sw-update-available', handleUpdate);
    };
  }, []);

  const handleUpdate = () => {
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-down">
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-400 rounded-xl flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold mb-1">
              Update Available
            </h3>
            <p className="text-slate-300 text-sm mb-3">
              A new version of the app is ready. Update now for the latest features and improvements.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-medium rounded-lg transition-all"
              >
                Update Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium rounded-lg hover:bg-slate-800/50 transition-all"
              >
                Later
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
