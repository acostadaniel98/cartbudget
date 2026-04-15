/**
 * Hook para verificar y mantener estado offline
 * Especialmente optimizado para móviles
 */

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

export const useOfflineDetection = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [wasOffline, setWasOffline] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Inicializar estado online
        if (typeof window !== 'undefined') {
            setIsOnline(navigator.onLine);
            console.log('[OfflineDetection] Initial online state:', navigator.onLine);
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Manejador para cuando se va online
        const handleOnline = () => {
            console.log('[OfflineDetection] Going online');
            setIsOnline(true);
            setWasOffline(true);

            // Limpiar timeout si existe
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Sincronizar datos si es necesario
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'SYNC_DATA',
                });
            }

            // Recargar página después de 2 segundos para sincronizar
            timeoutRef.current = setTimeout(() => {
                // Enviar evento de sincronización a otros clientes
                broadcastEvent('app-online');
            }, 2000);
        };

        // Manejador para cuando se va offline
        const handleOffline = () => {
            console.log('[OfflineDetection] Going offline');
            setIsOnline(false);
            setWasOffline(false);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            broadcastEvent('app-offline');
        };

        // En iOS/Android, también escuchar cambios de conexión
        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.log('[OfflineDetection] App hidden');
            } else {
                console.log('[OfflineDetection] App visible - checking online status');
                setIsOnline(navigator.onLine);
            }
        };

        // Hacer ping cada 10 segundos para verificar conectividad real
        const pingInterval = setInterval(() => {
            if (navigator.onLine) {
                // Intentar traer un archivo muy pequeño para verificar conexión real
                fetch('/manifest.json', { method: 'HEAD', cache: 'no-store' })
                    .then(() => {
                        if (!isOnline) {
                            console.log('[OfflineDetection] Ping successful, going online');
                            setIsOnline(true);
                        }
                    })
                    .catch(() => {
                        if (isOnline) {
                            console.log('[OfflineDetection] Ping failed, going offline');
                            setIsOnline(false);
                        }
                    });
            }
        }, 10000);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(pingInterval);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [isOnline]);

    return { isOnline, wasOffline };
};

/**
 * Broadcast event a otros tabs/ventanas
 */
function broadcastEvent(eventName: string) {
    try {
        // Usar BroadcastChannel si está disponible
        if ('BroadcastChannel' in window) {
            const channel = new (window as any).BroadcastChannel('cartbudget');
            channel.postMessage({ type: eventName });
            channel.close();
        }
    } catch (err) {
        console.log('[OfflineDetection] BroadcastChannel error:', err);
    }
}
