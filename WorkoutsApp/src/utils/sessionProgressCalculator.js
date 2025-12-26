/**
 * 📊 SESSION PROGRESS CALCULATOR
 * Calcula el progreso de una sesión basado en sets completados vs objetivo
 */

/**
 * Calcula el porcentaje de progreso de una sesión
 * 
 * @param {Object} day - Día de la rutina con ejercicios y targetSets
 * @param {Array} completedSets - Sets completados de esa sesión (del backend)
 * @returns {number} - Porcentaje de progreso (0-100)
 */
export const calculateSessionProgress = (day, completedSets) => {
  if (!day || !day.exercises || day.exercises.length === 0) {
    return 0;
  }

  // Calcular sets totales objetivo
  const totalTargetSets = day.exercises.reduce((total, exercise) => {
    return total + (exercise.targetSets || 0);
  }, 0);

  if (totalTargetSets === 0) {
    return 0;
  }

  if (!completedSets || completedSets.length === 0) {
    return 0;
  }

  // Contar sets completados agrupados por ejercicio
  const completedSetsByExercise = {};
  
  completedSets.forEach(set => {
    const exerciseName = set.exercise;
    if (!completedSetsByExercise[exerciseName]) {
      completedSetsByExercise[exerciseName] = 0;
    }
    completedSetsByExercise[exerciseName]++;
  });

  // Calcular sets completados totales (cap al objetivo por ejercicio)
  let totalCompletedSets = 0;
  
  day.exercises.forEach(exercise => {
    const completed = completedSetsByExercise[exercise.name] || 0;
    const target = exercise.targetSets || 0;
    // Tomar el mínimo entre completados y objetivo (si hizo más sets, solo cuenta hasta el objetivo)
    totalCompletedSets += Math.min(completed, target);
  });

  // Calcular porcentaje
  const percentage = Math.round((totalCompletedSets / totalTargetSets) * 100);
  
  return Math.min(percentage, 100); // Cap a 100%
};


/**
 * Obtiene un resumen legible del progreso
 * 
 * @param {Object} day - Día de la rutina
 * @param {Array} completedSets - Sets completados
 * @returns {Object} - { percentage, completedSets, totalSets, isComplete }
 */
export const getSessionProgressSummary = (day, completedSets) => {
  const totalTargetSets = day.exercises.reduce((total, exercise) => {
    return total + (exercise.targetSets || 0);
  }, 0);

  const completedSetsByExercise = {};
  completedSets?.forEach(set => {
    const exerciseName = set.exercise;
    if (!completedSetsByExercise[exerciseName]) {
      completedSetsByExercise[exerciseName] = 0;
    }
    completedSetsByExercise[exerciseName]++;
  });

  let totalCompletedSets = 0;
  day.exercises.forEach(exercise => {
    const completed = completedSetsByExercise[exercise.name] || 0;
    const target = exercise.targetSets || 0;
    totalCompletedSets += Math.min(completed, target);
  });

  const percentage = calculateSessionProgress(day, completedSets);

  return {
    percentage,
    completedSets: totalCompletedSets,
    totalSets: totalTargetSets,
    isComplete: percentage === 100
  };
};