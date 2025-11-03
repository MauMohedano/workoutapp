/**
 * 🌫️ DESIGN TOKENS: SHADOWS
 * 
 * Sistema de elevaciones consistente para iOS y Android.
 * iOS usa shadowColor/shadowOffset/shadowOpacity/shadowRadius
 * Android usa elevation
 * 
 * Uso:
 * ...shadows.md
 */

import { Platform } from 'react-native';

export const shadows = {
  none: {},
  
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
    },
    android: {
      elevation: 1,
    },
    default: {},
  }),
  
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.20,
      shadowRadius: 3.84,
    },
    android: {
      elevation: 3,
    },
    default: {},
  }),
  
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
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
        height: 6,
      },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
    },
    android: {
      elevation: 12,
    },
    default: {},
  }),
};