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
      
      // Distribución muscular
      muscleDistribution: await calculateMuscleDistribution(allSets),
      
      // Consistencia
      consistency: await calculateConsistency(deviceId, startDate),
      
      // Personal Records
      personalRecords: calculatePersonalRecords(allSets),
      
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
  
  // Mapear ejercicios a grupos musculares (simplificado por ahora)
  const muscleGroups = {
    chest: 0,
    back: 0,
    legs: 0,
    shoulders: 0,
    arms: 0,
    core: 0,
    other: 0
  };
  
  // Clasificar ejercicios (necesitarías un mapping más completo)
  Object.entries(exerciseGroups).forEach(([exercise, count]) => {
    const exerciseLower = exercise.toLowerCase();
    
    if (exerciseLower.includes('bench') || exerciseLower.includes('press') || exerciseLower.includes('chest')) {
      muscleGroups.chest += count;
    } else if (exerciseLower.includes('pull') || exerciseLower.includes('row') || exerciseLower.includes('back')) {
      muscleGroups.back += count;
    } else if (exerciseLower.includes('squat') || exerciseLower.includes('leg') || exerciseLower.includes('lunge')) {
      muscleGroups.legs += count;
    } else if (exerciseLower.includes('shoulder') || exerciseLower.includes('lateral') || exerciseLower.includes('overhead')) {
      muscleGroups.shoulders += count;
    } else if (exerciseLower.includes('curl') || exerciseLower.includes('tricep') || exerciseLower.includes('arm')) {
      muscleGroups.arms += count;
    } else if (exerciseLower.includes('plank') || exerciseLower.includes('crunch') || exerciseLower.includes('ab')) {
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

async function calculateConsistency(deviceId, startDate) {
  const filter = { deviceId };
  if (startDate) {
    filter.lastWorkoutDate = { $gte: startDate };
  }
  
  const allProgress = await SessionProgress.find(filter);
  
  const totalCompleted = allProgress.reduce((sum, p) => sum + p.completedSessions.length, 0);
  const totalPlanned = allProgress.reduce((sum, p) => sum + p.currentSession - 1, 0);
  
  // Calcular racha (simplificado - necesitaríamos las fechas exactas de cada workout)
  const streak = 0; // TODO: Implementar con fechas de workouts
  
  return {
    totalCompleted,
    totalPlanned,
    completionRate: totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0,
    streak
  };
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
    consistency: { totalCompleted: 0, totalPlanned: 0, completionRate: 0, streak: 0 },
    personalRecords: [],
    time: { avgDuration: 0, totalTime: 0 },
    period: 'all',
    totalWorkouts: 0,
    lastWorkoutDate: null
  };
}

module.exports = { getUserStats };