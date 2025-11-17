// URL backend
import { API_URL } from '../config/api';

// ==================== EXERCISES (API NINJA) ====================

/**
 * Buscar ejercicios
 * @param {Object} params - { muscle, name, type, difficulty }
 */
export const searchExercises = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_URL}/ninja/exercises${queryParams ? `?${queryParams}` : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch exercises');
  }
  
  const data = await response.json();
  return data.exercises; // Devuelve solo el array de ejercicios
};

/**
 * Buscar ejercicio por nombre exacto
 * @param {string} name - Nombre del ejercicio
 */
export const getExerciseByName = async (name) => {
  const response = await fetch(`${API_URL}/ninja/exercises?name=${name}`);
  if (!response.ok) {
    throw new Error('Failed to fetch exercise');
  }
  
  const data = await response.json();
  return data.exercises;
};

// ==================== SETS (MONGODB) ====================

/**
 * Obtener todos los sets
 */
export const getSets = async () => {
  const response = await fetch(`${API_URL}/exercises`);
  if (!response.ok) {
    throw new Error('Failed to fetch sets');
  }
  
  return response.json();
};

/**
 * Crear un nuevo set
 * @param {Object} set - { exercise, reps, weight }
 */
export const createSet = async (set) => {
  const response = await fetch(`${API_URL}/exercises`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(set),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create set');
  }
  
  return response.json();
};

/**
 * Actualizar un set
 * @param {string} id - ID del set
 * @param {Object} updates - { exercise, reps, weight }
 */
export const updateSet = async (id, updates) => {
  const response = await fetch(`${API_URL}/exercises/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update set');
  }
  
  return response.json();
};

/**
 * Eliminar un set
 * @param {string} id - ID del set
 */
export const deleteSet = async (id) => {
  const response = await fetch(`${API_URL}/exercises/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete set');
  }
  
  return response.json();
};

/**
 * Obtener último entrenamiento de un ejercicio
 * @param {string} exerciseName - Nombre del ejercicio
 * @param {number} currentSession - Sesión actual (para excluirla)
 */
export const getLastWorkout = async (exerciseName, currentSession) => {
  const params = new URLSearchParams({
    exerciseName,
    currentSession: currentSession || 999
  });
  
  const response = await fetch(`${API_URL}/exercises/last-workout?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch last workout');
  }
  
  return response.json();
};