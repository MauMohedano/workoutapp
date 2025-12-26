import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TIMER_STORAGE_KEY = '@workout_timer';

// Contexto
const WorkoutTimerContext = createContext();

// Provider
export const WorkoutTimerProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [routineId, setRoutineId] = useState(null);
  const [sessionNumber, setSessionNumber] = useState(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [dayId, setDayId] = useState(null);
  const [dayName, setDayName] = useState(null);
  const [totalExercises, setTotalExercises] = useState(0);


  // 🔄 Restaurar timer al montar (por si cerraron la app)
  useEffect(() => {
    const restoreTimer = async () => {
      try {
        const data = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
        if (data) {
          const {
            isActive,
            startTime,
            routineId,
            sessionNumber,
            exerciseIndex: savedExerciseIndex,
            dayId: savedDayId,
            dayName: savedDayName,
            totalExercises: savedTotalExercises
          } = JSON.parse(data);

          if (isActive && startTime) {
            setIsActive(true);
            setStartTime(startTime);
            setRoutineId(routineId);
            setSessionNumber(sessionNumber);
            setExerciseIndex(savedExerciseIndex || 0);
            setDayId(savedDayId);
            setDayName(savedDayName);
            setTotalExercises(savedTotalExercises || 0);

            // Calcular tiempo transcurrido desde que empezó
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000);
            setElapsedSeconds(elapsed);

            console.log('⏱️ Timer restaurado:', { elapsed, routineId, sessionNumber });
          }
        }
      } catch (error) {
        console.error('❌ Error restaurando timer:', error);
      }
    };

    restoreTimer();
  }, []);

  // ⏱️ Actualizar cada segundo cuando está activo
  useEffect(() => {
    if (!isActive || !startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // 💾 Guardar en AsyncStorage cuando cambia el estado
  useEffect(() => {
    const saveTimer = async () => {
      try {
        if (isActive) {
          await AsyncStorage.setItem(
            TIMER_STORAGE_KEY,
            JSON.stringify({
              isActive,
              startTime,
              routineId,
              sessionNumber,
              exerciseIndex,
              dayId,
              dayName,
              totalExercises
            })
          );
        } else {
          await AsyncStorage.removeItem(TIMER_STORAGE_KEY);
        }
      } catch (error) {
        console.error('❌ Error guardando timer:', error);
      }
    };

    saveTimer();
  }, [isActive, startTime, routineId, sessionNumber]);

  const startTimer = (routineIdParam, sessionNumberParam, workoutData = {}) => {
    const now = Date.now();
    setIsActive(true);
    setStartTime(now);
    setElapsedSeconds(0);
    setRoutineId(routineIdParam);
    setSessionNumber(sessionNumberParam);
    setExerciseIndex(workoutData.exerciseIndex || 0);
    setDayId(workoutData.dayId || null);
    setDayName(workoutData.dayName || null);
    setTotalExercises(workoutData.totalExercises || 0);
    console.log('▶️ Timer iniciado:', {
      routineId: routineIdParam,
      sessionNumber: sessionNumberParam,
      exerciseIndex: workoutData.exerciseIndex
    });
  };

  // ⏹️ Detener timer (al completar sesión)
  const stopTimer = () => {
    const finalElapsed = elapsedSeconds;
    setIsActive(false);
    setStartTime(null);
    setElapsedSeconds(0);
    setRoutineId(null);
    setSessionNumber(null);
    console.log('⏹️ Timer detenido. Duración:', finalElapsed, 'segundos');
    return finalElapsed; // Retornar duración para guardar en BD
  };

  // 🔄 Resetear timer (sin guardar duración)
  const resetTimer = () => {
    setIsActive(false);
    setStartTime(null);
    setElapsedSeconds(0);
    setRoutineId(null);
    setSessionNumber(null);
    console.log('🔄 Timer reseteado');
  };

  // 📊 Obtener tiempo formateado (HH:MM:SS o MM:SS)
  const getFormattedTime = () => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const value = {
    // Estado
    isActive,
    elapsedSeconds,
    routineId,
    sessionNumber,
    exerciseIndex,
    dayId,
    dayName,
    totalExercises,

    // Acciones
    startTimer,
    stopTimer,
    resetTimer,
    getFormattedTime,
  };

  return (
    <WorkoutTimerContext.Provider value={value}>
      {children}
    </WorkoutTimerContext.Provider>
  );
};

// Hook para usar el contexto
export const useWorkoutTimer = () => {
  const context = useContext(WorkoutTimerContext);
  if (!context) {
    throw new Error('useWorkoutTimer debe usarse dentro de WorkoutTimerProvider');
  }
  return context;
};