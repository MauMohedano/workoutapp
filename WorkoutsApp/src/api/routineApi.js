// URL de tu backend
const API_URL = 'http://192.168.1.68:3003/api';

// ==================== RUTINAS ====================

/**
 * Obtener todas las rutinas
 */
export const getRoutines = async () => {
  const response = await fetch(`${API_URL}/routines`);
  if (!response.ok) {
    throw new Error('Failed to fetch routines');
  }
  return response.json();
};

/**
 * Obtener una rutina específica por ID
 * @param {string} id - ID de la rutina
 */
export const getRoutineById = async (id) => {
  const response = await fetch(`${API_URL}/routines/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch routine');
  }
  return response.json();
};

/**
 * Crear una nueva rutina
 * @param {Object} routine - { name, description, days }
 */
export const createRoutine = async (routine) => {
  const response = await fetch(`${API_URL}/routines`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(routine),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create routine');
  }
  
  return response.json();
};

/**
 * Actualizar una rutina
 * @param {string} id - ID de la rutina
 * @param {Object} updates - Campos a actualizar
 */
export const updateRoutine = async (id, updates) => {
  const response = await fetch(`${API_URL}/routines/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update routine');
  }
  
  return response.json();
};

/**
 * Activar una rutina (y desactivar las demás)
 * @param {string} id - ID de la rutina
 */
export const activateRoutine = async (id) => {
  const response = await fetch(`${API_URL}/routines/${id}/activate`, {
    method: 'PUT',
  });
  
  if (!response.ok) {
    throw new Error('Failed to activate routine');
  }
  
  return response.json();
};

/**
 * Eliminar una rutina
 * @param {string} id - ID de la rutina
 */
export const deleteRoutine = async (id) => {
  const response = await fetch(`${API_URL}/routines/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete routine');
  }
  
  return response.json();
};