import { API_URL } from '../config/api';

/**
 * Obtener estadísticas del usuario
 * @param {string} deviceId - ID del dispositivo
 * @param {string} period - 'week' | 'month' | 'year' | 'all'
 */
export const getUserStats = async (deviceId, period = 'all') => {
  try {
    console.log('📊 Fetching stats for:', deviceId, '| Period:', period);
    
    const response = await fetch(`${API_URL}/stats/${deviceId}?period=${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch stats`);
    }
    
    const data = await response.json();
    console.log('✅ Stats loaded');
    
    return data;
  } catch (error) {
    console.error('❌ Error en getUserStats:', error.message);
    throw error;
  }
};