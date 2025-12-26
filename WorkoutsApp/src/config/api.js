/**
 * 📡 CONFIGURACIÓN CENTRALIZADA DE API
 * 
 * Cambiar solo la IP aquí actualiza TODA la app automáticamente.
 * 
 * CUÁNDO ACTUALIZAR:
 * - Tu IP cambió (ejecuta ipconfig en Windows)
 * - Cambias de red WiFi
 */


const LOCAL_IP = '192.168.1.83';  // ← Mi IP está cambiando constantemente

// Puerto del backend 
const PORT = 3003;

// URL base de la API
export const API_URL = `http://${LOCAL_IP}:${PORT}/api`;

// Log para debug (ver en consola qué IP está usando)


// Exportar también la IP y puerto por si se necesitan individualmente
export { LOCAL_IP, PORT };