// URL backend
const API_URL = 'http://192.168.1.68:3003/api';

/**
 * Obtener progreso de una rutina
 * @param {string} deviceId - ID del dispositivo
 * @param {string} routineId - ID de la rutina
 */
export const getSessionProgress = async (deviceId, routineId) => {
  try {
    console.log('📊 Fetching session progress for:', deviceId, routineId);
    
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
    console.log('✅ Session progress loaded:', {
      currentSession: data.currentSession,
      completed: data.completedSessions.length,
      skipped: data.skippedSessions.length
    });
    
    return data;
  } catch (error) {
    console.error('❌ Error en getSessionProgress:', error.message);
    throw error;
  }
};

/**
 * Completar una sesión
 * @param {string} deviceId - ID del dispositivo
 * @param {string} routineId - ID de la rutina
 * @param {number} sessionNumber - Número de sesión a completar
 */
export const completeSession = async (deviceId, routineId, sessionNumber) => {
  try {
    console.log('✅ Completing session:', sessionNumber);
    
    const response = await fetch(`${API_URL}/session-progress/complete`, {
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
      throw new Error(errorData.error || 'Failed to complete session');
    }
    
    const data = await response.json();
    console.log('✅ Session completed. New current session:', data.currentSession);
    
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
    console.log('⏭️ Skipping session:', sessionNumber);
    
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
    console.log('⏭️ Session skipped. New current session:', data.currentSession);
    
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
    console.log('🔄 Syncing session progress');
    
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
    console.log('✅ Session progress synced');
    
    return data;
  } catch (error) {
    console.error('❌ Error en syncSessionProgress:', error.message);
    throw error;
  }
};