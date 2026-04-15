/**
 * Hook para registrar Service Worker
 * Maneja instalación de PWA y actualizaciones
 */

'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerRegistration {
  isSupported: boolean;
  isInstallPromptReady: boolean;
  isInstalled: boolean;
}

export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerRegistration>({
    isSupported: typeof window !== 'undefined' && 'serviceWorker' in navigator,
    isInstallPromptReady: false,
    isInstalled: false,
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // No ejecutar en SSR
    if (typeof window === 'undefined') {
      return;
    }

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', {
          scope: '/',
        })
        .then((registration) => {
          console.log('[App] Service Worker registered:', registration);

          // Escuchar actualizaciones disponibles
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[App] New Service Worker available');
                  // Notificar al usuario que hay actualización disponible
                  window.dispatchEvent(
                    new CustomEvent('sw-update-available', {
                      detail: { registration },
                    })
                  );
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[App] Service Worker registration failed:', error);
        });
    }

    // Detectar install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      const installPrompt = e as any;
      installPrompt.preventDefault();
      setDeferredPrompt(installPrompt);
      setState((prev) => ({ ...prev, isInstallPromptReady: true }));
      console.log('[App] Install prompt ready');
    };

    // Detectar cuando app se instala
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setState((prev) => ({ ...prev, isInstallPromptReady: false, isInstalled: true }));
      console.log('[App] App installed');
    };

    // Escuchar cambios de conectividad
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
      console.log('[App] Back online');
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
      console.log('[App] Gone offline');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detectar si ya está instalada
    const nav = window.navigator as any;
    if (nav.standalone === true) {
      setState((prev) => ({ ...prev, isInstalled: true }));
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[App] User response to install prompt: ${outcome}`);

    setDeferredPrompt(null);
  };

  const skipServiceWorkerUpdate = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const clearCache = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    }
  };

  return {
    ...state,
    installApp,
    skipServiceWorkerUpdate,
    clearCache,
    deferredPrompt,
  };
};
