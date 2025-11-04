/**
 * 📊 WORKOUT STATISTICS UTILITIES
 * 
 * Pure functions para calcular estadísticas de sets de ejercicios.
 * Reutilizable, testeable, mantenible.
 * 
 * @module workoutStats
 */

/**
 * Calcular el mejor set (mayor volumen = peso × reps)
 * @param {Array} sets - Array de sets {weight, reps}
 * @returns {Object|null} Set con mayor volumen
 */
export const calculateBestSet = (sets) => {
  if (!sets || sets.length === 0) return null;
  
  return sets.reduce((best, current) => {
    const currentVolume = current.weight * current.reps;
    const bestVolume = best.weight * best.reps;
    return currentVolume > bestVolume ? current : best;
  });
};

/**
 * Calcular volumen total de todos los sets
 * @param {Array} sets - Array de sets {weight, reps}
 * @returns {number} Volumen total en kg
 */
export const calculateTotalVolume = (sets) => {
  if (!sets || sets.length === 0) return 0;
  
  return sets.reduce((total, set) => total + (set.weight * set.reps), 0);
};

/**
 * Calcular peso promedio
 * @param {Array} sets - Array de sets {weight, reps}
 * @returns {number} Peso promedio redondeado
 */
export const calculateAvgWeight = (sets) => {
  if (!sets || sets.length === 0) return 0;
  
  const sum = sets.reduce((total, set) => total + set.weight, 0);
  return Math.round(sum / sets.length);
};

/**
 * Calcular repeticiones promedio
 * @param {Array} sets - Array de sets {weight, reps}
 * @returns {number} Reps promedio redondeado
 */
export const calculateAvgReps = (sets) => {
  if (!sets || sets.length === 0) return 0;
  
  const sum = sets.reduce((total, set) => total + set.reps, 0);
  return Math.round(sum / sets.length);
};

/**
 * Obtener rango de repeticiones (min-max)
 * @param {Array} sets - Array de sets {weight, reps}
 * @returns {Object|null} {min, max} reps
 */
export const getRepsRange = (sets) => {
  if (!sets || sets.length === 0) return null;
  
  const reps = sets.map(s => s.reps);
  return { 
    min: Math.min(...reps), 
    max: Math.max(...reps) 
  };
};

/**
 * Calcular 1RM estimado usando fórmula Epley
 * 1RM = weight × (1 + reps/30)
 * @param {Array} sets - Array de sets {weight, reps}
 * @returns {number} 1RM estimado en kg
 */
export const calculateEstimated1RM = (sets) => {
  if (!sets || sets.length === 0) return 0;
  
  const bestSet = calculateBestSet(sets);
  return Math.round(bestSet.weight * (1 + bestSet.reps / 30));
};

/**
 * Comparar volumen con sesión anterior
 * @param {number} currentVolume - Volumen actual
 * @param {number} previousVolume - Volumen anterior
 * @returns {number|null} Porcentaje de cambio (+ mejora, - bajó)
 */
export const compareWithPrevious = (currentVolume, previousVolume) => {
  if (!previousVolume || previousVolume === 0) return null;
  
  const change = ((currentVolume - previousVolume) / previousVolume) * 100;
  return Math.round(change);
};

/**
 * Detectar si es Personal Record
 * @param {Array} currentSets - Sets de la sesión actual
 * @param {Array} previousSets - Sets de sesiones anteriores
 * @returns {boolean} true si es PR
 */
export const isPR = (currentSets, previousSets) => {
  if (!currentSets || currentSets.length === 0) return false;
  if (!previousSets || previousSets.length === 0) return false;

  const currentBest = calculateBestSet(currentSets);
  const previousBest = calculateBestSet(previousSets);
  
  return (currentBest.weight * currentBest.reps) > (previousBest.weight * previousBest.reps);
};

/**
 * 🎯 ALL-IN-ONE: Obtener todas las estadísticas de una vez
 * Función principal para UI - retorna objeto con todas las stats
 * 
 * @param {Array} sets - Sets de la sesión actual
 * @param {Array} previousSets - Sets de la sesión anterior (opcional)
 * @param {number} targetSets - Sets objetivo del ejercicio (opcional)
 * @returns {Object|null} Objeto con todas las estadísticas
 */
export const getWorkoutStats = (sets, previousSets = [], targetSets = null) => {
  if (!sets || sets.length === 0) return null;

  const bestSet = calculateBestSet(sets);
  const totalVolume = calculateTotalVolume(sets);
  const previousVolume = calculateTotalVolume(previousSets);
  const volumeChange = compareWithPrevious(totalVolume, previousVolume);
  
  return {
    // Estadísticas principales
    bestSet,
    totalVolume,
    avgWeight: calculateAvgWeight(sets),
    avgReps: calculateAvgReps(sets),
    repsRange: getRepsRange(sets),
    estimated1RM: calculateEstimated1RM(sets),
    
    // Comparación
    previousVolume,
    volumeChange,
    isPersonalRecord: isPR(sets, previousSets),
    
    // Meta info
    totalSets: sets.length,
    completionRate: targetSets ? Math.round((sets.length / targetSets) * 100) : null,
  };
};