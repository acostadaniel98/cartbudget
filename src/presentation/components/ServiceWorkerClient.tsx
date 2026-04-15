/**
 * ServiceWorkerClient - Componente cliente para PWA features
 * Maneja instalación, actualizaciones y estado offline
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useServiceWorker } from '@/presentation/hooks/useServiceWorker';
import { useOfflineDetection } from '@/presentation/hooks/useOfflineDetection';

export const ServiceWorkerClient: React.FC = () => {
  const swState = useServiceWorker();
  const offlineState = useOfflineDetection();
  const isOnline = offlineState.isOnline;
  const { isInstallPromptReady, installApp, skipServiceWorkerUpdate } = swState;
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Escuchar actualizaciones de Service Worker
    const handleSWUpdate = () => {
      setShowUpdatePrompt(true);
    };

    window.addEventListener('sw-update-available', handleSWUpdate);

    return () => {
      window.removeEventListener('sw-update-available', handleSWUpdate);
    };
  }, []);

  useEffect(() => {
    // Mostrar prompt de instalación después de 10 segundos
    if (isInstallPromptReady) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isInstallPromptReady]);

  const handleInstall = async () => {
    await installApp();
    setShowInstallPrompt(false);
  };

  const handleSkipUpdate = () => {
    setShowUpdatePrompt(false);
  };

  const handleApplyUpdate = () => {
    skipServiceWorkerUpdate();
    // Recargar después de que el nuevo SW se active
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <>
      {/* Notificación de actualización disponible */}
      {showUpdatePrompt && (
        <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-sm">Actualización disponible</p>
            <p className="text-xs opacity-90">Hay una nueva versión de CartBudget</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleSkipUpdate}
              className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-400 rounded transition-colors"
            >
              Después
            </button>
            <button
              onClick={handleApplyUpdate}
              className="px-3 py-1 text-xs bg-blue-700 hover:bg-blue-800 rounded font-semibold transition-colors"
            >
              Actualizar
            </button>
          </div>
        </div>
      )}

      {/* Notificación de instalación */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 bg-green-600 text-white rounded-lg shadow-lg p-4 z-50 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-sm">Instalar CartBudget</p>
            <p className="text-xs opacity-90">Acceso rápido desde tu home</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="px-3 py-1 text-xs bg-green-500 hover:bg-green-400 rounded transition-colors"
            >
              No
            </button>
            <button
              onClick={handleInstall}
              className="px-3 py-1 text-xs bg-green-700 hover:bg-green-800 rounded font-semibold transition-colors"
            >
              Instalar
            </button>
          </div>
        </div>
      )}

      {/* Indicador de estado offline */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 text-sm font-medium z-50">
          Modo offline - Los cambios se sincronizarán cuando regreses online
        </div>
      )}
    </>
  );
};
