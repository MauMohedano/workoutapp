import { useQuery } from '@tanstack/react-query';
import { getUserStats } from '../api/statsApi';

/**
 * Hook para obtener estadísticas del usuario
 * @param {string} deviceId - ID del dispositivo
 * @param {string} period - 'week' | 'month' | 'year' | 'all'
 */
export const useWorkoutStats = (deviceId, period = 'all') => {
  return useQuery({
    queryKey: ['workoutStats', deviceId, period],
    queryFn: () => getUserStats(deviceId, period),
    enabled: !!deviceId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    placeholderData: (previousData) => previousData,  // 👈 AGREGAR ESTO
  });
};