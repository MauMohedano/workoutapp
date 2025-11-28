/**
 * 🏋️ ROUTINE HELPERS
 * 
 * Funciones helper para navegación y vista general de rutinas.
 * SOLO lógica pura, sin dependencias de React o UI.
 * 
 * Para lógica de progreso dentro de workouts, ver sessionHelpers.js
 */

import { getDayForSession } from './sessionHelpers';

/**
 * Obtiene el nombre del día actual basado en el número de sesión
 * @param {Object} routine - Objeto de rutina
 * @returns {string} - Nombre del día (ej: "Push", "Pull", "Legs")
 */
export const getCurrentDayName = (routine) => {
  if (!routine?.days || routine.days.length === 0) return 'Sesión';

  const currentSession = routine.progress?.currentSession || 1;
  const dayIndex = (currentSession - 1) % routine.days.length;
  const currentDay = routine.days[dayIndex];

  // Extraer el nombre del día (antes del paréntesis si existe)
  const dayName = currentDay.name.split('(')[0].trim();

  return dayName;
};

/**
 * Obtiene el nombre del día para una sesión específica
 * @param {Object} routine - Objeto de rutina
 * @param {number} sessionNumber - Número de sesión
 * @returns {string} - Nombre del día
 */
export const getDayNameForSession = (routine, sessionNumber) => {
  if (!routine?.days || routine.days.length === 0) return 'Sesión';

  const dayIndex = (sessionNumber - 1) % routine.days.length;
  const day = routine.days[dayIndex];

  return day.name.split('(')[0].trim();
};

/**
 * Obtiene las próximas N sesiones de una rutina
 * @param {Object} routine - Objeto de rutina
 * @param {number} count - Cantidad de sesiones a obtener (default: 2)
 * @returns {Array} - Array de objetos con info de próximas sesiones
 */
export const getUpcomingSessions = (routine, count = 2) => {
  if (!routine?.days || routine.days.length === 0) return [];

  const currentSession = routine.progress?.currentSession || 1;
  const upcomingSessions = [];

  for (let i = 1; i <= count; i++) {
    const sessionNumber = currentSession + i;
    if (sessionNumber > routine.totalSessions) break; // No pasar del total

    const dayIndex = (sessionNumber - 1) % routine.days.length;
    const day = routine.days[dayIndex];

    upcomingSessions.push({
      sessionNumber,
      dayName: day.name.split('(')[0].trim(),
      exerciseCount: day.exercises?.length || 0,
      day: day, // Por si necesitas más info después
    });
  }

  return upcomingSessions;
};

/**
 * Calcula el porcentaje de progreso de una rutina completa
 * @param {Object} routine - Objeto de rutina
 * @returns {number} - Porcentaje de 0 a 100
 */
export const calculateRoutineProgress = (routine) => {
  if (!routine?.progress?.currentSession || !routine?.totalSessions) return 0;
  
  const currentSession = routine.progress.currentSession;
  return Math.round((currentSession / routine.totalSessions) * 100);
};

/**
 * Obtiene el día/sesión activo de una rutina con info completa
 * @param {Object} routine - Objeto de rutina
 * @returns {Object|null} - Objeto con info del día actual
 */
export const getCurrentDay = (routine) => {
  if (!routine?.days || routine.days.length === 0) return null;

  const currentSession = routine.progress?.currentSession || 1;
  const day = getDayForSession(currentSession, routine.days);

  if (!day) return null;

  return {
    day,
    dayIndex: routine.days.findIndex(d => d._id === day._id),
    sessionNumber: currentSession,
    dayName: day.name.split('(')[0].trim(),
    exerciseCount: day.exercises?.length || 0,
  };
};

/**
 * Verifica si una rutina está activa
 * @param {Object} routine - Objeto de rutina
 * @returns {boolean}
 */
export const isRoutineActive = (routine) => {
  return routine?.isActive === true;
};

/**
 * Obtiene el total de sesiones completadas de una rutina
 * @param {Object} routine - Objeto de rutina
 * @returns {number}
 */
export const getCompletedSessionsCount = (routine) => {
  return routine?.progress?.completedSessions?.length || 0;
};

/**
 * Obtiene el total de sesiones restantes de una rutina
 * @param {Object} routine - Objeto de rutina
 * @returns {number}
 */
export const getRemainingSessionsCount = (routine) => {
  const currentSession = routine?.progress?.currentSession || 1;
  const totalSessions = routine?.totalSessions || 0;
  
  return Math.max(0, totalSessions - currentSession + 1);
};