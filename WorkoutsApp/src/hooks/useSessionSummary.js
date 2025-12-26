import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../config/api';
import { getDeviceId } from '../utils/deviceId';
import { useState, useEffect } from 'react';

/**
 * Hook para obtener estadísticas de un workout completado
 * @param {string} routineId - ID de la rutina
 * @param {number} sessionNumber - Número de sesión completada
 */
export const useSessionSummary = (routineId, sessionNumber) => {
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await getDeviceId();
      setDeviceId(id);
    };
    fetchDeviceId();
  }, []);

  // Query para obtener sets de la sesión actual
  const { data: currentSets = [], isLoading: loadingCurrent } = useQuery({
    queryKey: ['sessionSummary', deviceId, routineId, sessionNumber],
   queryFn: async () => {
  const url = `${API_URL}/exercises/by-session?deviceId=${deviceId}&routineId=${routineId}&sessionNumber=${sessionNumber}`;
  console.log('🔍 Fetching current sets:', url);
  
  const response = await fetch(url);
  console.log('📡 Response status:', response.status);
  
  if (!response.ok) {
    console.error('❌ Failed to fetch current sets');
    throw new Error('Failed to fetch current session sets');
  }
  
  const data = await response.json();
  console.log('✅ Current sets received:', data.length, 'sets');
  return data;
    },
    enabled: !!deviceId && !!routineId && sessionNumber != null,
  });

  // Query para obtener sets de la sesión anterior
  const { data: previousSets = [], isLoading: loadingPrevious } = useQuery({
    queryKey: ['sessionSummary', deviceId, routineId, sessionNumber - 1],
    queryFn: async () => {
      if (sessionNumber === 1) return []; // No hay sesión anterior
      
      const response = await fetch(
        `${API_URL}/exercises/by-session?deviceId=${deviceId}&routineId=${routineId}&sessionNumber=${sessionNumber - 1}`
      );
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!deviceId && !!routineId && sessionNumber != null && sessionNumber > 1,
  });

  // Query para obtener progreso de sesiones (para racha)
  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ['sessionProgress', deviceId, routineId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/session-progress/${deviceId}/${routineId}`);
      if (!response.ok) throw new Error('Failed to fetch progress');
      return response.json();
    },
    enabled: !!deviceId && !!routineId,
  });

  // 📊 CALCULAR ESTADÍSTICAS

  // 1. Total de Sets
  const totalSets = currentSets.length;

  // 2. Volumen Total (peso × reps)
  const totalVolume = currentSets.reduce((sum, set) => {
    return sum + (set.weight * set.reps);
  }, 0);

  // 3. Volumen de sesión anterior
  const previousVolume = previousSets.reduce((sum, set) => {
    return sum + (set.weight * set.reps);
  }, 0);

  // 4. Cambio de volumen (%)
  const volumeChange = previousVolume > 0 
    ? ((totalVolume - previousVolume) / previousVolume) * 100 
    : 0;

  // 5. Sets de sesión anterior
  const previousTotalSets = previousSets.length;

  // 6. Total de reps
  const totalReps = currentSets.reduce((sum, set) => sum + set.reps, 0);
  const previousTotalReps = previousSets.reduce((sum, set) => sum + set.reps, 0);

  // 7. Racha de días consecutivos
  const streak = calculateStreak(progress);

  // 8. Highlights dinámicos
  const highlights = generateHighlights({
    totalSets,
    previousTotalSets,
    totalVolume,
    previousVolume,
    volumeChange,
    totalReps,
    previousTotalReps,
    streak,
    sessionNumber,
    currentSets,
    previousSets,
  });

  return {
    // Datos
    totalSets,
    totalVolume,
    volumeChange,
    streak,
    highlights,
    
    // Comparación
    previousTotalSets,
    previousVolume,
    totalReps,
    previousTotalReps,
    
    // Estados
    isLoading: loadingCurrent || loadingPrevious || loadingProgress,
    hasData: currentSets.length > 0,
    hasPreviousSession: previousSets.length > 0,
  };
};

/**
 * Calcular racha de días consecutivos
 */
function calculateStreak(progress) {
  if (!progress?.completedSessions || progress.completedSessions.length === 0) {
    return 1; // Primera sesión
  }

  // Obtener fechas únicas de completedSessions
  const uniqueDates = new Set();
  
  progress.completedSessions.forEach(s => {
    const date = s.completedAt ? new Date(s.completedAt) : new Date();
    const dateStr = date.toISOString().split('T')[0]; // Solo fecha YYYY-MM-DD
    uniqueDates.add(dateStr);
  });

  const dates = Array.from(uniqueDates).sort().reverse(); // Más reciente primero

  // Contar días consecutivos desde hoy
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < dates.length; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - streak);
    const expected = checkDate.toISOString().split('T')[0];
    
    if (dates[i] === expected) {
      streak++;
    } else {
      break;
    }
  }

  return streak || 1;
}

/**
 * Generar highlights dinámicos basados en mejoras
 */
function generateHighlights(data) {
  const {
    totalVolume,
    previousVolume,
    volumeChange,
    totalSets,
    previousTotalSets,
    totalReps,
    previousTotalReps,
    streak,
    sessionNumber,
    currentSets,
    previousSets,
  } = data;

  // Si es primera sesión
  if (sessionNumber === 1 || !previousSets || previousSets.length === 0) {
    return {
      icon: '🎉',
      title: '¡Primera sesión completada!',
      subtitle: 'Gran comienzo, sigue así',
      color: 'primary',
    };
  }

  // Prioridad 1: Récord de peso en algún ejercicio
  const weightRecords = findWeightRecords(currentSets, previousSets);
  if (weightRecords.length > 0) {
    const record = weightRecords[0];
    return {
      icon: '🏆',
      title: `¡Nuevo récord en ${record.exercise}!`,
      subtitle: `${record.weight}kg (+${record.increase}kg)`,
      color: 'warning',
    };
  }

  // Prioridad 2: Mucho más volumen
  if (volumeChange > 10) {
    return {
      icon: '💪',
      title: `¡${volumeChange.toFixed(0)}% más volumen!`,
      subtitle: `Levantaste ${formatVolume(totalVolume - previousVolume)} más que la anterior`,
      color: 'primary',
    };
  }

  // Prioridad 3: Más reps
  const repsIncrease = totalReps - previousTotalReps;
  if (repsIncrease > 5) {
    return {
      icon: '🔥',
      title: `¡${repsIncrease} reps más!`,
      subtitle: 'Tu resistencia está mejorando',
      color: 'primary',
    };
  }

  // Prioridad 4: Más sets
  const setsIncrease = totalSets - previousTotalSets;
  if (setsIncrease > 2) {
    return {
      icon: '📈',
      title: `¡${setsIncrease} sets más completados!`,
      subtitle: 'Excelente consistencia',
      color: 'primary',
    };
  }

  // Prioridad 5: Racha consecutiva
  if (streak >= 3) {
    return {
      icon: '🔥',
      title: `¡${streak} días consecutivos!`,
      subtitle: 'Keep the momentum going',
      color: 'warning',
    };
  }

  // Prioridad 6: Volumen similar (mantenimiento)
  if (Math.abs(volumeChange) < 5) {
    return {
      icon: '✨',
      title: '¡Consistencia perfecta!',
      subtitle: 'Mantienes tu nivel de entrenamiento',
      color: 'primary',
    };
  }

  // Default: Gran trabajo
  return {
    icon: '💪',
    title: '¡Gran trabajo!',
    subtitle: 'Sigue entrenando con constancia',
    color: 'primary',
  };
}

/**
 * Encontrar récords de peso por ejercicio
 */
function findWeightRecords(currentSets, previousSets) {
  const records = [];

  // Agrupar por ejercicio
  const currentByExercise = groupByExercise(currentSets);
  const previousByExercise = groupByExercise(previousSets);

  Object.keys(currentByExercise).forEach(exercise => {
    const currentMax = Math.max(...currentByExercise[exercise].map(s => s.weight));
    const previousMax = previousByExercise[exercise] 
      ? Math.max(...previousByExercise[exercise].map(s => s.weight))
      : 0;

    if (currentMax > previousMax) {
      records.push({
        exercise,
        weight: currentMax,
        increase: currentMax - previousMax,
      });
    }
  });

  // Ordenar por aumento de peso (mayor primero)
  return records.sort((a, b) => b.increase - a.increase);
}

/**
 * Agrupar sets por ejercicio
 */
function groupByExercise(sets) {
  return sets.reduce((acc, set) => {
    if (!acc[set.exercise]) {
      acc[set.exercise] = [];
    }
    acc[set.exercise].push(set);
    return acc;
  }, {});
}

/**
 * Formatear volumen en kg
 */
function formatVolume(volume) {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k kg`;
  }
  return `${volume.toFixed(0)} kg`;
}

export default useSessionSummary;