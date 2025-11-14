/**
 * 🧮 SESSION HELPERS
 * 
 * Funciones helper para cálculos relacionados con sesiones.
 * SOLO lógica pura, sin dependencias de React o UI.
 */

/**
 * Calcula el porcentaje de progreso de una sesión (VERSIÓN APROXIMADA)
 * 
 * NOTA: Esta es una versión simplificada que calcula progreso basado en ejercicios completados,
 * no en sets individuales. Para progreso detallado por sets, ver roadmap en Phase 2.
 * 
 * @param {number} sessionNum - Número de sesión
 * @param {number} currentSession - Sesión actual
 * @param {Object} workoutProgress - Progreso del workout (puede ser null)
 * @param {Object} day - Día de la rutina con ejercicios
 * @returns {number} Porcentaje (0-100)
 */
export const getSessionProgress = (sessionNum, currentSession, workoutProgress, day) => {
  // Sesión completada = 100% (asumimos que se completó)
  if (sessionNum < currentSession) {
    return 100;
  }
  
  // Sesión actual = progreso aproximado basado en ejercicios
  if (sessionNum === currentSession && workoutProgress) {
    const totalExercises = day?.exercises?.length || 1;
    const currentExercise = workoutProgress.exerciseIndex;
    
    // Progreso aproximado: ejercicios completados / total
    // Nota: No considera sets individuales aún
    const progress = (currentExercise / totalExercises) * 100;
    
    return Math.round(progress);
  }
  
  // Sesión futura = 0%
  return 0;
};

/**
 * Calcula qué día de la rutina corresponde a una sesión
 * @param {number} sessionNumber - Número de sesión (1-21)
 * @param {Array} days - Array de días de la rutina
 * @returns {Object|null} Día correspondiente o null
 */
export const getDayForSession = (sessionNumber, days) => {
  if (!days || days.length === 0) return null;
  
  const totalDays = days.length;
  const dayIndex = (sessionNumber - 1) % totalDays;
  const sortedDays = [...days].sort((a, b) => a.order - b.order);
  
  return sortedDays[dayIndex];
};

/**
 * Calcula el índice de inicio para un workout
 * @param {Object} workoutProgress - Progreso actual del workout
 * @returns {number} Índice del ejercicio (default: 0)
 */
export const getWorkoutStartIndex = (workoutProgress) => {
  return workoutProgress?.exerciseIndex || 0;
};

/**
 * Obtiene el color del progreso según el porcentaje
 * @param {number} percentage - Porcentaje (0-100)
 * @param {Object} colors - Objeto de colores del design system
 * @returns {string} Color hex
 */
export const getProgressColor = (percentage, colors) => {
  if (percentage === 100) return colors.success.main;
  if (percentage > 0) return colors.primary.main;
  return colors.neutral.gray300;
};

/**
 * Calcula la semana de una sesión
 * @param {number} sessionNum - Número de sesión
 * @param {number} totalDays - Total de días en la rutina
 * @returns {number} Número de semana
 */
export const getSessionWeek = (sessionNum, totalDays) => {
  return Math.ceil(sessionNum / totalDays);
};

/**
 * Valida si un día tiene ejercicios
 * @param {Object} day - Día de la rutina
 * @returns {boolean} true si tiene ejercicios
 */
export const hasExercises = (day) => {
  return day && day.exercises && day.exercises.length > 0;
};