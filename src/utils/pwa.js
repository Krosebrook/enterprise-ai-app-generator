/**
 * PWA utilities for service worker registration and install prompts
 */

/**
 * Register the service worker
 * @returns {Promise<ServiceWorkerRegistration|null>} Registration object or null if not supported
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('Service Worker registered successfully:', registration.scope);

    // Check for updates periodically (every 30 minutes)
    // This interval balances update responsiveness with battery/network efficiency
    setInterval(() => {
      registration.update();
    }, 30 * 60 * 1000); // 30 minutes

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          // Trigger a custom event that can be handled by the app's notification system
          window.dispatchEvent(new CustomEvent('sw-update-available', {
            detail: { registration, newWorker }
          }));
          
          // Fallback to console log if no handler is registered
          console.log('New service worker available. Refresh to update.');
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister all service workers (useful for development)
 * @returns {Promise<boolean>} True if all workers were unregistered
 */
export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const unregisterPromises = registrations.map(reg => reg.unregister());
    await Promise.all(unregisterPromises);
    console.log('All service workers unregistered');
    return true;
  } catch (error) {
    console.error('Failed to unregister service workers:', error);
    return false;
  }
}

/**
 * Check if the app is running in standalone mode (installed as PWA)
 * @returns {boolean} True if running as installed PWA
 */
export function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Check if the device supports PWA installation
 * @returns {boolean} True if PWA installation is supported
 */
export function isPWASupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Get the install prompt deferral handler
 * Call this to show install prompt later
 */
let deferredPrompt = null;

/**
 * Set up PWA install prompt
 * @param {Function} onInstallPromptAvailable - Callback when install prompt is available
 * @returns {Function} Function to trigger the install prompt
 */
export function setupInstallPrompt(onInstallPromptAvailable) {
  // Check if already installed
  if (isStandalone()) {
    console.log('App is already installed');
    return null;
  }

  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default browser install prompt
    e.preventDefault();
    
    // Store the event for later use
    deferredPrompt = e;
    
    // Notify that install prompt is available
    if (onInstallPromptAvailable) {
      onInstallPromptAvailable(true);
    }

    console.log('Install prompt is available');
  });

  // Listen for successful installation
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed successfully');
    deferredPrompt = null;
    
    if (onInstallPromptAvailable) {
      onInstallPromptAvailable(false);
    }
  });

  // Return function to show the install prompt
  return showInstallPrompt;
}

/**
 * Show the PWA install prompt
 * @returns {Promise<{outcome: string}>} Installation outcome ('accepted' or 'dismissed')
 */
export async function showInstallPrompt() {
  if (!deferredPrompt) {
    console.log('Install prompt not available');
    return { outcome: 'unavailable' };
  }

  try {
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User ${outcome} the install prompt`);
    
    // Clear the deferredPrompt
    deferredPrompt = null;
    
    return { outcome };
  } catch (error) {
    console.error('Error showing install prompt:', error);
    return { outcome: 'error' };
  }
}

/**
 * Clear all caches (useful for debugging)
 * @returns {Promise<boolean>} True if caches were cleared
 */
export async function clearCaches() {
  if (!('caches' in window)) {
    return false;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('All caches cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear caches:', error);
    return false;
  }
}

/**
 * Get cache storage information
 * @returns {Promise<{usage: number, quota: number, percentage: number}>} Cache storage info
 */
export async function getCacheInfo() {
  if (!('storage' in navigator && 'estimate' in navigator.storage)) {
    return { usage: 0, quota: 0, percentage: 0 };
  }

  try {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    const percentage = quota > 0 ? (usage / quota) * 100 : 0;
    
    return {
      usage,
      quota,
      percentage: Math.round(percentage * 100) / 100
    };
  } catch (error) {
    console.error('Failed to get cache info:', error);
    return { usage: 0, quota: 0, percentage: 0 };
  }
}
