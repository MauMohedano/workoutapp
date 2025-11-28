import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getMeasurements, 
  getLatestMeasurement,
  getMeasurementStats,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement 
} from '../api/measurementApi';

/**
 * Hook para obtener todas las mediciones del usuario
 * @param {string} deviceId - ID del dispositivo
 */
export const useMeasurements = (deviceId) => {
  return useQuery({
    queryKey: ['measurements', deviceId],
    queryFn: () => getMeasurements(deviceId),
    enabled: !!deviceId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para obtener la última medición del usuario
 * @param {string} deviceId - ID del dispositivo
 */
export const useLatestMeasurement = (deviceId) => {
  return useQuery({
    queryKey: ['latestMeasurement', deviceId],
    queryFn: () => getLatestMeasurement(deviceId),
    enabled: !!deviceId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para obtener estadísticas de mediciones
 * @param {string} deviceId - ID del dispositivo
 */
export const useMeasurementStats = (deviceId) => {
  return useQuery({
    queryKey: ['measurementStats', deviceId],
    queryFn: () => getMeasurementStats(deviceId),
    enabled: !!deviceId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para crear una nueva medición
 */
export const useCreateMeasurement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMeasurement,
    onSuccess: (data) => {
      // Invalidar todas las queries relacionadas con mediciones
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      queryClient.invalidateQueries({ queryKey: ['latestMeasurement'] });
      queryClient.invalidateQueries({ queryKey: ['measurementStats'] });
      console.log('✅ Measurement created successfully');
    },
    onError: (error) => {
      console.error('❌ Error creating measurement:', error.message);
    }
  });
};

/**
 * Hook para actualizar una medición existente
 */
export const useUpdateMeasurement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => updateMeasurement(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      queryClient.invalidateQueries({ queryKey: ['latestMeasurement'] });
      queryClient.invalidateQueries({ queryKey: ['measurementStats'] });
      console.log('✅ Measurement updated successfully');
    },
    onError: (error) => {
      console.error('❌ Error updating measurement:', error.message);
    }
  });
};

/**
 * Hook para eliminar una medición
 */
export const useDeleteMeasurement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, deviceId }) => deleteMeasurement(id, deviceId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      queryClient.invalidateQueries({ queryKey: ['latestMeasurement'] });
      queryClient.invalidateQueries({ queryKey: ['measurementStats'] });
      console.log('✅ Measurement deleted successfully');
    },
    onError: (error) => {
      console.error('❌ Error deleting measurement:', error.message);
    }
  });
};