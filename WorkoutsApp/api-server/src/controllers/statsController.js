const Exercise = require('../models/Exercise');
const SessionProgress = require('../models/SessionProgress');
const Routine = require('../models/Routine');

/**
 * GET /api/stats/:deviceId
 * Obtener todas las estadísticas del usuario
 */
const getUserStats = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { period = 'all' } = req.query; // 'week', 'month', 'year', 'all'
    
    console.log('📊 Calculando estadísticas para:', deviceId, '| Período:', period);
    
    // Calcular fecha de inicio según período
    const startDate = getStartDate(period);
    
    // Query base para filtrar por fecha
    const dateFilter = startDate ? { createdAt: { $gte: startDate } } : {};
    
    // 1. Obtener todos los sets del usuario
    const allSets = await Exercise.find({
      deviceId,
      ...dateFilter
    }).sort({ createdAt: -1 });
    
    console.log('📦 Total sets encontrados:', allSets.length);
    
    if (allSets.length === 0) {
      return res.json(getEmptyStats());
    }
    
    // 2. Calcular estadísticas
    const stats = {
      // Volumen
      volume: calculateVolume(allSets),
      
      // Distribución muscular (optimizada para pie chart)
      muscleDistribution: await calculateMuscleDistribution(allSets),
      
      // Consistencia con streak
      consistency: await calculateConsistency(deviceId, startDate, allSets),
      
      // Personal Records
      personalRecords: calculatePersonalRecords(allSets),
      
      // Top ejercicios con detalles (volumen, 1RM, etc)
      topExercises: calculateTopExercises(allSets),
      
      // Volumen semanal (para gráfica)
      weeklyVolume: calculateWeeklyVolume(allSets),
      
      // Tiempo
      time: await calculateTimeStats(deviceId, startDate),
      
      // Metadata
      period,
      totalWorkouts: allSets.length > 0 ? [...new Set(allSets.map(s => s.sessionNumber))].length : 0,
      lastWorkoutDate: allSets[0]?.createdAt || null
    };
    
    console.log('✅ Estadísticas calculadas');
    
    res.json(stats);
  } catch (error) {
    console.error('❌ GET STATS ERROR:', error);
    res.status(500).json({ error: 'Error al calcular estadísticas' });
  }
};

// ===== HELPER FUNCTIONS =====

function getStartDate(period) {
  const now = new Date();
  
  switch(period) {
    case 'week':
      return new Date(now.setDate(now.getDate() - 7));
    case 'month':
      return new Date(now.setMonth(now.getMonth() - 1));
    case 'year':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case 'all':
    default:
      return null;
  }
}

function calculateVolume(sets) {
  const totalSets = sets.length;
  const totalReps = sets.reduce((sum, set) => sum + set.reps, 0);
  const totalWeight = sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
  
  return {
    totalSets,
    totalReps,
    totalWeight: Math.round(totalWeight)
  };
}

async function calculateMuscleDistribution(sets) {
  // Agrupar por ejercicio
  const exerciseGroups = {};
  
  sets.forEach(set => {
    if (!exerciseGroups[set.exercise]) {
      exerciseGroups[set.exercise] = 0;
    }
    exerciseGroups[set.exercise]++;
  });
  
  // Mapear ejercicios a grupos musculares
  const muscleGroups = {
    chest: 0,
    back: 0,
    legs: 0,
    shoulders: 0,
    arms: 0,
    core: 0,
    other: 0
  };
  
  // Clasificar ejercicios
  Object.entries(exerciseGroups).forEach(([exercise, count]) => {
    const exerciseLower = exercise.toLowerCase();
    
    if (exerciseLower.includes('bench') || exerciseLower.includes('press') || exerciseLower.includes('chest') || exerciseLower.includes('pecho')) {
      muscleGroups.chest += count;
    } else if (exerciseLower.includes('pull') || exerciseLower.includes('row') || exerciseLower.includes('back') || exerciseLower.includes('espalda') || exerciseLower.includes('lat')) {
      muscleGroups.back += count;
    } else if (exerciseLower.includes('squat') || exerciseLower.includes('leg') || exerciseLower.includes('lunge') || exerciseLower.includes('pierna') || exerciseLower.includes('sentadilla')) {
      muscleGroups.legs += count;
    } else if (exerciseLower.includes('shoulder') || exerciseLower.includes('lateral') || exerciseLower.includes('overhead') || exerciseLower.includes('hombro')) {
      muscleGroups.shoulders += count;
    } else if (exerciseLower.includes('curl') || exerciseLower.includes('tricep') || exerciseLower.includes('arm') || exerciseLower.includes('brazo')) {
      muscleGroups.arms += count;
    } else if (exerciseLower.includes('plank') || exerciseLower.includes('crunch') || exerciseLower.includes('ab') || exerciseLower.includes('core')) {
      muscleGroups.core += count;
    } else {
      muscleGroups.other += count;
    }
  });
  
  // Calcular porcentajes
  const total = Object.values(muscleGroups).reduce((sum, val) => sum + val, 0);
  
  const distribution = {};
  Object.entries(muscleGroups).forEach(([muscle, count]) => {
    distribution[muscle] = total > 0 ? Math.round((count / total) * 100) : 0;
  });
  
  return distribution;
}

async function calculateConsistency(deviceId, startDate, allSets) {
  const filter = { deviceId };
  if (startDate) {
    filter.lastWorkoutDate = { $gte: startDate };
  }
  
  const allProgress = await SessionProgress.find(filter);
  
  const totalCompleted = allProgress.reduce((sum, p) => sum + p.completedSessions.length, 0);
  const totalPlanned = allProgress.reduce((sum, p) => sum + p.currentSession - 1, 0);
  
  // Calcular racha de días (streak) usando las fechas de los sets
  const streak = calculateStreak(allSets);
  
  // Última sesión
  const lastWorkoutDate = allSets.length > 0 ? allSets[0].createdAt : null;
  const daysSinceLastWorkout = lastWorkoutDate 
    ? Math.floor((new Date() - new Date(lastWorkoutDate)) / (1000 * 60 * 60 * 24))
    : null;
  
  return {
    totalCompleted,
    totalPlanned,
    completionRate: totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0,
    streak,
    lastWorkoutDate,
    daysSinceLastWorkout
  };
}

/**
 * Calcular racha de días consecutivos con entrenamientos
 */
function calculateStreak(sets) {
  if (sets.length === 0) return 0;
  
  // Extraer fechas únicas de entrenamientos (solo fecha, sin hora)
  const workoutDates = [...new Set(
    sets.map(set => new Date(set.createdAt).toDateString())
  )].sort((a, b) => new Date(b) - new Date(a)); // Más reciente primero
  
  if (workoutDates.length === 0) return 0;
  
  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  // Si no entrenó hoy ni ayer, la racha es 0
  if (workoutDates[0] !== today && workoutDates[0] !== yesterday) {
    return 0;
  }
  
  // Contar días consecutivos hacia atrás
  let currentDate = new Date(workoutDates[0]);
  
  for (let i = 0; i < workoutDates.length; i++) {
    const workoutDate = new Date(workoutDates[i]);
    const diffDays = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      streak++;
      currentDate = workoutDate;
    } else {
      break;
    }
  }
  
  return streak;
}

function calculatePersonalRecords(sets) {
  // Agrupar por ejercicio y encontrar máximo peso
  const exerciseMaxes = {};
  
  sets.forEach(set => {
    if (!exerciseMaxes[set.exercise] || set.weight > exerciseMaxes[set.exercise].weight) {
      exerciseMaxes[set.exercise] = {
        exercise: set.exercise,
        weight: set.weight,
        reps: set.reps,
        date: set.createdAt
      };
    }
  });
  
  // Ordenar por peso y tomar top 5
  return Object.values(exerciseMaxes)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);
}

/**
 * Calcular top ejercicios con métricas detalladas
 */
function calculateTopExercises(sets) {
  // Agrupar por ejercicio
  const exerciseData = {};
  
  sets.forEach(set => {
    if (!exerciseData[set.exercise]) {
      exerciseData[set.exercise] = {
        exercise: set.exercise,
        totalVolume: 0,
        totalSets: 0,
        maxWeight: 0,
        maxWeightReps: 0,
        bestSet: null
      };
    }
    
    const data = exerciseData[set.exercise];
    data.totalVolume += set.weight * set.reps;
    data.totalSets++;
    
    if (set.weight > data.maxWeight) {
      data.maxWeight = set.weight;
      data.maxWeightReps = set.reps;
      data.bestSet = set;
    }
  });
  
  // Calcular 1RM estimado para cada ejercicio
  // Fórmula: 1RM = peso × (1 + reps/30)
  Object.values(exerciseData).forEach(data => {
    data.estimated1RM = Math.round(data.maxWeight * (1 + data.maxWeightReps / 30));
    data.totalVolume = Math.round(data.totalVolume);
  });
  
  // Ordenar por volumen total y tomar top 5
  return Object.values(exerciseData)
    .sort((a, b) => b.totalVolume - a.totalVolume)
    .slice(0, 5);
}

/**
 * Calcular volumen por semana (últimas 8 semanas)
 */
function calculateWeeklyVolume(sets) {
  if (sets.length === 0) return [];
  
  // Agrupar por semana
  const weeklyData = {};
  
  sets.forEach(set => {
    // Obtener inicio de semana (Lunes)
    const date = new Date(set.createdAt);
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(date.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        week: weekKey,
        volume: 0,
        sets: 0
      };
    }
    
    weeklyData[weekKey].volume += set.weight * set.reps;
    weeklyData[weekKey].sets++;
  });
  
  // Convertir a array y ordenar por fecha
  const weeklyArray = Object.values(weeklyData)
    .map(week => ({
      ...week,
      volume: Math.round(week.volume)
    }))
    .sort((a, b) => new Date(a.week) - new Date(b.week))
    .slice(-8); // Últimas 8 semanas
  
  return weeklyArray;
}

async function calculateTimeStats(deviceId, startDate) {
  // Por ahora retornamos datos dummy
  // TODO: Necesitaríamos guardar inicio/fin de cada workout
  return {
    avgDuration: 0, // segundos
    totalTime: 0 // segundos
  };
}

function getEmptyStats() {
  return {
    volume: { totalSets: 0, totalReps: 0, totalWeight: 0 },
    muscleDistribution: {
      chest: 0, back: 0, legs: 0, shoulders: 0, arms: 0, core: 0, other: 0
    },
    consistency: { 
      totalCompleted: 0, 
      totalPlanned: 0, 
      completionRate: 0, 
      streak: 0,
      lastWorkoutDate: null,
      daysSinceLastWorkout: null
    },
    personalRecords: [],
    topExercises: [],
    weeklyVolume: [],
    time: { avgDuration: 0, totalTime: 0 },
    period: 'all',
    totalWorkouts: 0,
    lastWorkoutDate: null
  };
}

module.exports = { getUserStats };