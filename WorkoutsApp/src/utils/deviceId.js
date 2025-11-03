import * as Application from 'expo-application';
import { Platform } from 'react-native';

/**
 * Obtiene un identificador único del dispositivo
 * En producción esto sería el userId después del login
 * Por ahora usamos un identificador temporal del dispositivo
 */
export const getDeviceId = () => {
  if (Platform.OS === 'android') {
    // Android: usa androidId
    return Application.androidId || `android-${Date.now()}`;
  } else if (Platform.OS === 'ios') {
    // iOS: usa identifierForVendor (cambia si desinstalan la app)
    return Application.getIosIdForVendorAsync().then(id => id || `ios-${Date.now()}`);
  } else if (Platform.OS === 'web') {
    // Web: usa localStorage o genera uno
    let webId = localStorage.getItem('deviceId');
    if (!webId) {
      webId = `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('deviceId', webId);
    }
    return webId;
  }
  
  // Fallback
  return `device-${Date.now()}`;
};

/**
 * Versión async para iOS
 */
export const getDeviceIdAsync = async () => {
  if (Platform.OS === 'ios') {
    const id = await Application.getIosIdForVendorAsync();
    return id || `ios-${Date.now()}`;
  }
  return getDeviceId();
};