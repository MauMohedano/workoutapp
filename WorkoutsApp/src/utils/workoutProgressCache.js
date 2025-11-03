import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKOUT_PROGRESS_PREFIX = '@workout_progress_';

/**
 * Estructura del progreso de workout:
 * {
 *   routineId: string,
 *   sessionNumber: number,
 *   exerciseIndex: number,
 *   dayId: string,
 *   dayName: string,
 *   totalExercises: number,
 *   lastUpdatedAt: ISO string
 * }
 */

/**
 * Guardar progreso de la sesión actual
 */
export const saveWorkoutProgress = async (deviceId, routineId, sessionNumber, progressData) => {
  try {
    const key = `${WORKOUT_PROGRESS_PREFIX}${deviceId}_${routineId}_${sessionNumber}`;
    
    const data = {
      ...progressData,
      routineId,
      sessionNumber,
      lastUpdatedAt: new Date().toISOString()
    };
    
    await AsyncStorage.setItem(key, JSON.stringify(data));
    console.log('💾 Progreso de workout guardado:', {
      exercise: `${progressData.exerciseIndex + 1}/${progressData.totalExercises}`,
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error guardando progreso de workout:', error);
    return false;
  }
};

/**
 * Obtener progreso de la sesión actual
 */
export const getWorkoutProgress = async (deviceId, routineId, sessionNumber) => {
  try {
    const key = `${WORKOUT_PROGRESS_PREFIX}${deviceId}_${routineId}_${sessionNumber}`;
    const data = await AsyncStorage.getItem(key);
    
    if (!data) {
      console.log('📭 No hay progreso guardado para esta sesión');
      return null;
    }
    
    const progress = JSON.parse(data);
    
    // Verificar si el progreso es reciente (menos de 24 horas)
    const lastUpdated = new Date(progress.lastUpdatedAt).getTime();
    const now = new Date().getTime();
    const hoursSince = (now - lastUpdated) / (1000 * 60 * 60);
    
    if (hoursSince > 24) {
      console.log('⏰ Progreso muy antiguo (>24h), limpiando...');
      await clearWorkoutProgress(deviceId, routineId, sessionNumber);
      return null;
    }
    
    console.log('📦 Progreso de workout encontrado:', {
      exercise: `${progress.exerciseIndex + 1}/${progress.totalExercises}`,
      hoursSince: Math.round(hoursSince * 10) / 10
    });
    
    return progress;
  } catch (error) {
    console.error('❌ Error leyendo progreso de workout:', error);
    return null;
  }
};

/**
 * Limpiar progreso de la sesión (al completar)
 */
export const clearWorkoutProgress = async (deviceId, routineId, sessionNumber) => {
  try {
    const key = `${WORKOUT_PROGRESS_PREFIX}${deviceId}_${routineId}_${sessionNumber}`;
    await AsyncStorage.removeItem(key);
    console.log('🗑️ Progreso de workout limpiado');
    return true;
  } catch (error) {
    console.error('❌ Error limpiando progreso de workout:', error);
    return false;
  }
};

/**
 * Verificar si hay progreso guardado (sin leerlo)
 */
export const hasWorkoutProgress = async (deviceId, routineId, sessionNumber) => {
  const progress = await getWorkoutProgress(deviceId, routineId, sessionNumber);
  return progress !== null;
};