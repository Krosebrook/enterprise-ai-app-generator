import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { setupInstallPrompt, showInstallPrompt, isStandalone } from '@/utils/pwa';

// Configuration constant for dismissal period
const DISMISSAL_PERIOD_DAYS = 7;

/**
 * PWA Install Banner component
 * Shows a banner prompting users to install the app as a PWA
 * Automatically handles install prompt availability and dismissal
 * @param {Object} props - Component props
 * @param {number} [props.dismissalDays=7] - Days before showing banner again after dismissal
 * @returns {JSX.Element|null} Install banner or null if not available
 */
export default function PWAInstallBanner({ dismissalDays = DISMISSAL_PERIOD_DAYS }) {
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isStandalone()) {
      return;
    }

    // Check if user previously dismissed the banner
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Show again after configured dismissal period
      if (daysSinceDismissed < dismissalDays) {
        return;
      }
    }

    // Set up the install prompt
    setupInstallPrompt((available) => {
      setShowBanner(available);
    });
  }, [dismissalDays]); // Re-run if dismissalDays changes

  const handleInstall = async () => {
    setIsInstalling(true);
    
    try {
      const { outcome } = await showInstallPrompt();
      
      if (outcome === 'accepted') {
        setShowBanner(false);
        localStorage.removeItem('pwa-install-dismissed');
      } else {
        setIsInstalling(false);
      }
    } catch (error) {
      console.error('Install failed:', error);
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold mb-1">
              Install VibeCode
            </h3>
            <p className="text-slate-300 text-sm mb-3">
              Install our app for faster access and offline support
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInstalling ? 'Installing...' : 'Install'}
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
