// URL backend
import { API_URL } from '../config/api';

/**
 * Obtener progreso de una rutina
 * @param {string} deviceId - ID del dispositivo
 * @param {string} routineId - ID de la rutina
 */
export const getSessionProgress = async (deviceId, routineId) => {
  try {
    const response = await fetch(`${API_URL}/session-progress/${deviceId}/${routineId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch session progress`);
    }
    
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Error en getSessionProgress:', error.message);
    throw error;
  }
};

/**
 * ✨ Completar una sesión (ACTUALIZADO con duration)
 * @param {string} deviceId - ID del dispositivo
 * @param {string} routineId - ID de la rutina
 * @param {number} sessionNumber - Número de sesión a completar
 * @param {number|null} duration - Duración en segundos (opcional)
 */
export const completeSession = async (deviceId, routineId, sessionNumber, duration = null) => {
  try {
    console.log('📤 API: Completando sesión con duration:', { 
      sessionNumber, 
      duration: duration ? `${duration}s (${Math.floor(duration / 60)}m)` : 'N/A' 
    });
    
    const response = await fetch(`${API_URL}/session-progress/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId,
        routineId,
        sessionNumber: Number(sessionNumber),
        duration: duration ? Number(duration) : null  // ✨ NUEVO
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to complete session');
    }
    
    const data = await response.json();
    
    console.log('✅ Sesión completada en servidor');
    
    return data;
  } catch (error) {
    console.error('❌ Error en completeSession:', error.message);
    throw error;
  }
};

/**
 * Saltar una sesión
 * @param {string} deviceId - ID del dispositivo
 * @param {string} routineId - ID de la rutina
 * @param {number} sessionNumber - Número de sesión a saltar
 */
export const skipSession = async (deviceId, routineId, sessionNumber) => {
  try {
    const response = await fetch(`${API_URL}/session-progress/skip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId,
        routineId,
        sessionNumber: Number(sessionNumber)
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to skip session');
    }
    
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Error en skipSession:', error.message);
    throw error;
  }
};

/**
 * Sincronizar progreso desde AsyncStorage
 * @param {string} deviceId - ID del dispositivo
 * @param {string} routineId - ID de la rutina
 * @param {Object} progressData - Datos de progreso a sincronizar
 */
export const syncSessionProgress = async (deviceId, routineId, progressData) => {
  try {
    const response = await fetch(`${API_URL}/session-progress/sync`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId,
        routineId,
        ...progressData
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync session progress');
    }
    
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Error en syncSessionProgress:', error.message);
    throw error;
  }
};