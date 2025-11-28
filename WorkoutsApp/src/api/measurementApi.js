// URL de tu backend
import { API_URL } from '../config/api';

// ==================== MEDICIONES ====================

/**
 * Obtener todas las mediciones del usuario
 * @param {string} deviceId - ID del dispositivo
 */
export const getMeasurements = async (deviceId) => {
  const url = `${API_URL}/measurements?deviceId=${deviceId}`;
    
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch measurements');
  }
  
  return response.json();
};

/**
 * Obtener la última medición del usuario
 * @param {string} deviceId - ID del dispositivo
 */
export const getLatestMeasurement = async (deviceId) => {
  const url = `${API_URL}/measurements/latest?deviceId=${deviceId}`;
    
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch latest measurement');
  }
  
  return response.json();
};

/**
 * Obtener estadísticas de mediciones
 * @param {string} deviceId - ID del dispositivo
 */
export const getMeasurementStats = async (deviceId) => {
  const url = `${API_URL}/measurements/stats?deviceId=${deviceId}`;
    
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch measurement stats');
  }
  
  return response.json();
};

/**
 * Obtener una medición específica por ID
 * @param {string} id - ID de la medición
 * @param {string} deviceId - ID del dispositivo
 */
export const getMeasurementById = async (id, deviceId) => {
  const url = `${API_URL}/measurements/${id}?deviceId=${deviceId}`;
    
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch measurement');
  }
  
  return response.json();
};

/**
 * Crear una nueva medición
 * @param {Object} measurement - { deviceId, weight, circumferences, notes, date }
 */
export const createMeasurement = async (measurement) => {
  const response = await fetch(`${API_URL}/measurements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(measurement),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create measurement');
  }
  
  return response.json();
};

/**
 * Actualizar una medición existente
 * @param {string} id - ID de la medición
 * @param {Object} updates - Campos a actualizar
 */
export const updateMeasurement = async (id, updates) => {
  const response = await fetch(`${API_URL}/measurements/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update measurement');
  }
  
  return response.json();
};

/**
 * Eliminar una medición
 * @param {string} id - ID de la medición
 * @param {string} deviceId - ID del dispositivo
 */
export const deleteMeasurement = async (id, deviceId) => {
  const url = `${API_URL}/measurements/${id}?deviceId=${deviceId}`;
  
  const response = await fetch(url, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete measurement');
  }
  
  return response.json();
};