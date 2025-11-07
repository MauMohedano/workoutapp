/**
 * 🌑 DESIGN TOKENS: SHADOWS V2.0
 * 
 * Sistema de elevaciones dramático y moderno.
 * Sombras más pronunciadas para dar profundidad real.
 * iOS usa shadowColor/shadowOffset/shadowOpacity/shadowRadius
 * Android usa elevation
 * 
 * Uso:
 * ...shadows.md
 */

import { Platform } from 'react-native';

export const shadows = {
  none: {},
  
  // ===== SOMBRAS ESTÁNDAR (Mejoradas) =====
  
  xs: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.15,
      shadowRadius: 2.0,
    },
    android: {
      elevation: 1,
    },
    default: {},
  }),
  
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.20,
      shadowRadius: 3.0,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 5.0,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.30,
      shadowRadius: 8.0,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
  
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.35,
      shadowRadius: 12.0,
    },
    android: {
      elevation: 12,
    },
    default: {},
  }),

  xxl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 15,
      },
      shadowOpacity: 0.40,
      shadowRadius: 16.0,
    },
    android: {
      elevation: 16,
    },
    default: {},
  }),

  // ===== SOMBRAS DE COLORES (Para elementos destacados) =====
  
  // Sombra con color primario (para botones principales)
  primaryGlow: Platform.select({
    ios: {
      shadowColor: '#FF4500',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.4,
      shadowRadius: 8.0,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),

  // Sombra con color success (para badges de logro)
  successGlow: Platform.select({
    ios: {
      shadowColor: '#00E676',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.4,
      shadowRadius: 8.0,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),

  // Sombra con color accent (para elementos dorados)
  accentGlow: Platform.select({
    ios: {
      shadowColor: '#FFD700',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.5,
      shadowRadius: 10.0,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),

  // ===== SOMBRAS ESPECIALES =====
  
  // Sombra para floating buttons (FAB)
  floating: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.35,
      shadowRadius: 10.0,
    },
    android: {
      elevation: 10,
    },
    default: {},
  }),

  // Sombra para modal/dialog
  modal: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 20,
      },
      shadowOpacity: 0.45,
      shadowRadius: 24.0,
    },
    android: {
      elevation: 24,
    },
    default: {},
  }),
};

export default shadows;