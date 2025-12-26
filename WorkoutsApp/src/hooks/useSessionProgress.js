import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSessionProgress, completeSession, skipSession, syncSessionProgress } from '../api/sessionProgressApi';
import { getDeviceId } from '../utils/deviceId';
import { useState, useEffect } from 'react';
import {
  saveProgressToCache,
  getProgressFromCache,
  mergeProgressData,
  isCacheStale
} from '../utils/sessionProgressCache';

/**
 * Hook para manejar el progreso de sesiones con cache AsyncStorage
 * @param {string} routineId - ID de la rutina
 */
export const useSessionProgress = (routineId) => {
  const queryClient = useQueryClient();
  const [deviceId, setDeviceId] = useState(null);
  const [cachedProgress, setCachedProgress] = useState(null);
  const [isLoadingCache, setIsLoadingCache] = useState(true);

  // Obtener deviceId y cargar cache al montar
  useEffect(() => {
    const initialize = async () => {
      const id = await getDeviceId();
      setDeviceId(id);
      
      // Cargar progreso del cache
      if (id && routineId) {
        const cached = await getProgressFromCache(id, routineId);
        if (cached) {
          setCachedProgress(cached);
        }
      }
      
      setIsLoadingCache(false);
    };
    
    initialize();
  }, [routineId]);

  // Query para obtener el progreso del servidor
  const {
    data: serverProgress,
    isLoading: isLoadingServer,
    error,
    refetch
  } = useQuery({
    queryKey: ['sessionProgress', deviceId, routineId],
    queryFn: async () => {
      const data = await getSessionProgress(deviceId, routineId);
      
      // Mergear con cache si existe
      let finalData = data;
      if (cachedProgress) {
        const merged = mergeProgressData(cachedProgress, data);
        
        // Si hay diferencias, sincronizar con servidor
        if (JSON.stringify(merged) !== JSON.stringify(data)) {
          try {
            finalData = await syncSessionProgress(deviceId, routineId, merged);
          } catch (error) {
            console.error('❌ Error sincronizando:', error);
            finalData = merged;
          }
        }
      }
      
      // Guardar en cache
      await saveProgressToCache(deviceId, routineId, finalData);
      
      return finalData;
    },
    enabled: !!deviceId && !!routineId && !isLoadingCache,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Usar datos del cache si está disponible, sino del servidor
  const progress = serverProgress || cachedProgress;

  // ✨ Mutation para completar sesión (ACTUALIZADO con duration)
  const completeMutation = useMutation({
    mutationFn: async ({ sessionNumber, duration }) => {
      console.log('🎯 Completando sesión:', { sessionNumber, duration });
      
      // Crear objeto de sesión completada
      const completedSession = {
        sessionNumber,
        duration: duration || null,
        completedAt: new Date().toISOString()
      };
      
      // Guardar primero en cache (optimistic update)
      if (progress) {
        const optimisticProgress = {
          ...progress,
          currentSession: sessionNumber + 1,
          completedSessions: [
            ...(progress.completedSessions || []).filter(s => {
              const num = typeof s === 'number' ? s : s.sessionNumber;
              return num !== sessionNumber;
            }),
            completedSession
          ].sort((a, b) => {
            const aNum = typeof a === 'number' ? a : a.sessionNumber;
            const bNum = typeof b === 'number' ? b : b.sessionNumber;
            return aNum - bNum;
          }),
          skippedSessions: (progress.skippedSessions || []).filter(s => s !== sessionNumber),
        };
        
        await saveProgressToCache(deviceId, routineId, optimisticProgress);
        
        // Actualizar cache de React Query inmediatamente
        queryClient.setQueryData(['sessionProgress', deviceId, routineId], optimisticProgress);
      }
      
      // Luego sincronizar con servidor (pasando duration)
      const serverData = await completeSession(deviceId, routineId, sessionNumber, duration);
      
      // Guardar respuesta del servidor en cache
      await saveProgressToCache(deviceId, routineId, serverData);
      
      return serverData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessionProgress'] });
      console.log('✅ Sesión completada y sincronizada');
    },
    onError: (error) => {
      console.error('❌ Error completing session:', error.message);
      // Revertir cache en caso de error
      refetch();
    }
  });

  // Mutation para saltar sesión
  const skipMutation = useMutation({
    mutationFn: async ({ sessionNumber }) => {
      // Guardar primero en cache (optimistic update)
      if (progress) {
        const optimisticProgress = {
          ...progress,
          currentSession: sessionNumber + 1,
          completedSessions: (progress.completedSessions || []).filter(s => {
            const num = typeof s === 'number' ? s : s.sessionNumber;
            return num !== sessionNumber;
          }),
          skippedSessions: [...(progress.skippedSessions || []), sessionNumber].sort((a, b) => a - b),
        };
        
        await saveProgressToCache(deviceId, routineId, optimisticProgress);
        
        // Actualizar cache de React Query inmediatamente
        queryClient.setQueryData(['sessionProgress', deviceId, routineId], optimisticProgress);
      }
      
      // Luego sincronizar con servidor
      const serverData = await skipSession(deviceId, routineId, sessionNumber);
      
      // Guardar respuesta del servidor en cache
      await saveProgressToCache(deviceId, routineId, serverData);
      
      return serverData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessionProgress'] });
    },
    onError: (error) => {
      console.error('❌ Error skipping session:', error.message);
      // Revertir cache en caso de error
      refetch();
    }
  });

  // ✨ Función helper para completar la sesión actual (ACTUALIZADO con duration)
  const completeCurrentSession = async (duration = null) => {
    if (!progress?.currentSession) {
      console.error('No current session to complete');
      return;
    }
    
    return completeMutation.mutateAsync({ 
      sessionNumber: progress.currentSession,
      duration  // ✨ NUEVO: Pasar duration
    });
  };

  // Función helper para saltar la sesión actual
  const skipCurrentSession = async () => {
    if (!progress?.currentSession) {
      console.error('No current session to skip');
      return;
    }
    
    return skipMutation.mutateAsync({ 
      sessionNumber: progress.currentSession 
    });
  };

  // Verificar si una sesión está completada
  const isSessionCompleted = (sessionNumber) => {
    if (!progress?.completedSessions) return false;
    return progress.completedSessions.some(s => {
      const num = typeof s === 'number' ? s : s.sessionNumber;
      return num === sessionNumber;
    });
  };

  // Verificar si una sesión está saltada
  const isSessionSkipped = (sessionNumber) => {
    return progress?.skippedSessions?.includes(sessionNumber) || false;
  };

  // Verificar si una sesión se puede hacer (es la actual o siguiente)
  const canDoSession = (sessionNumber) => {
    if (!progress) return false;
    return sessionNumber === progress.currentSession || 
           sessionNumber === progress.currentSession + 1;
  };

  return {
    // Datos
    progress,
    currentSession: progress?.currentSession || 1,
    completedSessions: progress?.completedSessions || [],
    skippedSessions: progress?.skippedSessions || [],
    deviceId,
    
    // Estados
    isLoading: isLoadingCache || (isLoadingServer && !cachedProgress),
    error,
    isCompleting: completeMutation.isPending,
    isSkipping: skipMutation.isPending,
    hasCache: !!cachedProgress,
    
    // Funciones
    completeCurrentSession,
    skipCurrentSession,
    refetch,
    
    // Helpers
    isSessionCompleted,
    isSessionSkipped,
    canDoSession,
  };
};