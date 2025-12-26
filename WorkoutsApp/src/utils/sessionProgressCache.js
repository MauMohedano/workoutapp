import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_PREFIX = '@workouts_session_progress_';

/**
 * Guardar progreso en AsyncStorage
 * @param {string} deviceId - ID del dispositivo
 * @param {string} routineId - ID de la rutina
 * @param {Object} progress - Datos de progreso
 */
export const saveProgressToCache = async (deviceId, routineId, progress) => {
  try {
    const key = `${CACHE_KEY_PREFIX}${deviceId}_${routineId}`;
    const data = {
      ...progress,
      lastCachedAt: new Date().toISOString()
    };
    
    await AsyncStorage.setItem(key, JSON.stringify(data));
    
    
    return true;
  } catch (error) {
    console.error('❌ Error guardando en cache:', error);
    return false;
  }
};

/**
 * Obtener progreso de AsyncStorage
 * @param {string} deviceId - ID del dispositivo
 * @param {string} routineId - ID de la rutina
 * @returns {Object|null} Progreso o null si no existe
 */
export const getProgressFromCache = async (deviceId, routineId) => {
  try {
    const key = `${CACHE_KEY_PREFIX}${deviceId}_${routineId}`;
    const data = await AsyncStorage.getItem(key);
    
    if (!data) {
      
      return null;
    }
    
    const progress = JSON.parse(data);
    
    
    return progress;
  } catch (error) {
    console.error('❌ Error leyendo cache:', error);
    return null;
  }
};

/**
 * Eliminar progreso de cache (útil para testing)
 * @param {string} deviceId - ID del dispositivo
 * @param {string} routineId - ID de la rutina
 */
export const clearProgressCache = async (deviceId, routineId) => {
  try {
    const key = `${CACHE_KEY_PREFIX}${deviceId}_${routineId}`;
    await AsyncStorage.removeItem(key);
    
    return true;
  } catch (error) {
    console.error('❌ Error limpiando cache:', error);
    return false;
  }
};

/**
 * Verificar si el cache está desactualizado
 * @param {Object} cachedProgress - Progreso del cache
 * @param {number} maxAgeMinutes - Edad máxima en minutos (default: 60)
 * @returns {boolean} true si está desactualizado
 */
export const isCacheStale = (cachedProgress, maxAgeMinutes = 60) => {
  if (!cachedProgress?.lastCachedAt) return true;
  
  const cachedTime = new Date(cachedProgress.lastCachedAt).getTime();
  const now = new Date().getTime();
  const ageMinutes = (now - cachedTime) / (1000 * 60);
  
  return ageMinutes > maxAgeMinutes;
};

/**
 * Merge de datos (cache vs servidor)
 * Prioriza el currentSession más alto y combina arrays
 * @param {Object} cachedData - Datos del cache
 * @param {Object} serverData - Datos del servidor
 * @returns {Object} Datos mergeados
 */
export const mergeProgressData = (cachedData, serverData) => {
  if (!cachedData) return serverData;
  if (!serverData) return cachedData;
  
  console.log('🔄 Mergeando datos:', {
    cached: cachedData.currentSession,
    server: serverData.currentSession
  });
  
  return {
    ...serverData,
    // Tomar el currentSession más alto
    currentSession: Math.max(
      cachedData.currentSession || 1,
      serverData.currentSession || 1
    ),
    // Merge arrays sin duplicados
    completedSessions: [...new Set([
      ...(cachedData.completedSessions || []),
      ...(serverData.completedSessions || [])
    ])].sort((a, b) => a - b),
    skippedSessions: [...new Set([
      ...(cachedData.skippedSessions || []),
      ...(serverData.skippedSessions || [])
    ])].sort((a, b) => a - b),
  };
};