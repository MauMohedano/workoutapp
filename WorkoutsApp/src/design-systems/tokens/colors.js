/**
 * 🎨 DESIGN TOKENS: COLORS V2.0
 * 
 * Paleta de colores mejorada para fitness app.
 * Nike Energy style - Alta energía y motivación.
 * COMPATIBLE con código existente.
 */

export const colors = {
  // ===== COLORES DE MARCA (MEJORADOS) =====
  primary: {
    main: '#FF4500',      // OrangeRed energético (antes #007AFF)
    light: '#FF6B35',
    dark: '#CC3700',
  },

  // ===== COLORES DE ACENTO (NUEVO) =====
  accent: {
    main: '#FFD700',      // Dorado - Logros
    electric: '#00E5FF',  // Cyan - Energía
    lime: '#CDFF00',      // Lima - Fresco
  },

  // ===== COLORES FUNCIONALES =====
  success: {
    main: '#00E676',      // Verde neón
    light: '#69F0AE',
    dark: '#00C853',
  },

  warning: {
    main: '#FFA726',
    light: '#FFB74D',
    dark: '#FF9800',
  },

  danger: {
    main: '#FF1744',
    light: '#FF5252',
    dark: '#D50000',
  },

  // ===== COLORES NEUTROS =====
  neutral: {
  white: '#FFFFFF',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#E0E0E0',
  gray300: '#CCCCCC',
  gray400: '#999999',
  gray500: '#666666',
  gray600: '#757575',   
  gray700: '#616161',   
  gray800: '#424242',   
  gray900: '#212121',   
  black: '#000000',
},

  // ===== BACKGROUNDS (NUEVO) =====
  backgrounds: {
    default: '#F5F5F5',
    elevated: '#FFFFFF',
    dark: '#1A1A1A',
  },

  // ===== COMPATIBILIDAD =====
  special: {
    gold: '#FFD700',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
};

export const c = colors;