/**
 * 🎨 DESIGN TOKENS: COLORS
 * 
 * Paleta de colores de la aplicación.
 * Basada en iOS HIG con ajustes personalizados.
 * 
 * Uso:
 * import { colors } from '@/design-system/tokens';
 * color: colors.primary.main
 */

export const colors = {
  // ===== COLORES DE MARCA =====
  primary: {
    main: '#007AFF',      // Azul principal (iOS blue)
    light: '#5AC8FA',     // Azul claro
    dark: '#0051D5',      // Azul oscuro (para hover/pressed)
  },

  // ===== COLORES FUNCIONALES =====
  success: {
    main: '#34C759',      // Verde (sesión completada)
    light: '#4CD964',     // Verde claro
    dark: '#248A3D',      // Verde oscuro
  },

  warning: {
    main: '#FF9500',      // Naranja (sesión en progreso)
    light: '#FFB340',     // Naranja claro
    dark: '#CC7700',      // Naranja oscuro
  },

  danger: {
    main: '#FF3B30',      // Rojo (error, eliminar)
    light: '#FF6961',     // Rojo claro
    dark: '#CC2E24',      // Rojo oscuro
  },

  // ===== COLORES NEUTROS =====
  neutral: {
    white: '#FFFFFF',
    gray50: '#FAFAFA',
    gray100: '#F5F5F5',   // Background principal
    gray200: '#E0E0E0',   // Borders, dividers
    gray300: '#CCCCCC',   // Borders activos
    gray400: '#999999',   // Secondary text, icons
    gray500: '#666666',   // Primary text
    gray600: '#333333',   // Headings, emphasis
    black: '#000000',
  },

  // ===== COLORES ESPECIALES =====
  special: {
    gold: '#FFD700',      // Badge "Activa"
    overlay: 'rgba(0, 0, 0, 0.5)',  // Modal overlay
  },
};

/**
 * Alias para compatibilidad
 * (puedes usar nombres más cortos si prefieres)
 */
export const c = colors;