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
      console.log('📱 Device ID:', id);
      
      // Cargar progreso del cache
      if (id && routineId) {
        const cached = await getProgressFromCache(id, routineId);
        if (cached) {
          setCachedProgress(cached);
          console.log('📦 Usando datos del cache mientras carga del servidor');
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
      console.log('☁️ Cargando progreso del servidor...');
      const data = await getSessionProgress(deviceId, routineId);
      
      // Mergear con cache si existe
      let finalData = data;
      if (cachedProgress) {
        const merged = mergeProgressData(cachedProgress, data);
        
        // Si hay diferencias, sincronizar con servidor
        if (JSON.stringify(merged) !== JSON.stringify(data)) {
          console.log('🔄 Sincronizando diferencias con servidor');
          try {
            finalData = await syncSessionProgress(deviceId, routineId, merged);
          } catch (error) {
            console.error('❌ Error sincronizando:', error);
            finalData = merged; // Usar merged aunque falle el sync
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

  // Mutation para completar sesión
  const completeMutation = useMutation({
    mutationFn: async ({ sessionNumber }) => {
      console.log('✅ Completando sesión:', sessionNumber);
      
      // Guardar primero en cache (optimistic update)
      if (progress) {
        const optimisticProgress = {
          ...progress,
          currentSession: sessionNumber + 1,
          completedSessions: [...(progress.completedSessions || []), sessionNumber].sort((a, b) => a - b),
          skippedSessions: (progress.skippedSessions || []).filter(s => s !== sessionNumber),
        };
        
        await saveProgressToCache(deviceId, routineId, optimisticProgress);
        console.log('💾 Progreso guardado en cache (optimistic)');
        
        // Actualizar cache de React Query inmediatamente
        queryClient.setQueryData(['sessionProgress', deviceId, routineId], optimisticProgress);
      }
      
      // Luego sincronizar con servidor
      const serverData = await completeSession(deviceId, routineId, sessionNumber);
      
      // Guardar respuesta del servidor en cache
      await saveProgressToCache(deviceId, routineId, serverData);
      
      return serverData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessionProgress'] });
      console.log('✅ Session completed successfully');
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
      console.log('⏭️ Saltando sesión:', sessionNumber);
      
      // Guardar primero en cache (optimistic update)
      if (progress) {
        const optimisticProgress = {
          ...progress,
          currentSession: sessionNumber + 1,
          completedSessions: (progress.completedSessions || []).filter(s => s !== sessionNumber),
          skippedSessions: [...(progress.skippedSessions || []), sessionNumber].sort((a, b) => a - b),
        };
        
        await saveProgressToCache(deviceId, routineId, optimisticProgress);
        console.log('💾 Progreso guardado en cache (optimistic)');
        
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
      console.log('⏭️ Session skipped successfully');
    },
    onError: (error) => {
      console.error('❌ Error skipping session:', error.message);
      // Revertir cache en caso de error
      refetch();
    }
  });

  // Función helper para completar la sesión actual
  const completeCurrentSession = async () => {
    if (!progress?.currentSession) {
      console.error('No current session to complete');
      return;
    }
    
    return completeMutation.mutateAsync({ 
      sessionNumber: progress.currentSession 
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
    return progress?.completedSessions?.includes(sessionNumber) || false;
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
    isLoading: isLoadingCache || (isLoadingServer && !cachedProgress), // Solo loading si no hay cache
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