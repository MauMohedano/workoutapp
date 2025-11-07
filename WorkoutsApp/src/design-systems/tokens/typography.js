/**
 * 🔤 DESIGN TOKENS: TYPOGRAPHY V2.0
 * 
 * Sistema tipográfico completo y escalable.
 * Jerarquía visual clara + estilos especiales para fitness.
 * Incluye variantes para números grandes, stats, y badges.
 * 
 * Uso:
 * fontSize: typography.heading1.fontSize
 * fontWeight: typography.heading1.fontWeight
 */

export const typography = {
  // ===== DISPLAY (Para headlines grandes) =====
  display: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 56,
    letterSpacing: -1.5,
  },
  displayMedium: {
    fontSize: 40,
    fontWeight: 'bold',
    lineHeight: 48,
    letterSpacing: -1.0,
  },
  displaySmall: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
    letterSpacing: -0.5,
  },

  // ===== HEADINGS =====
  heading1: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  heading2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    letterSpacing: 0,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: 0,
  },
  heading4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0,
  },
  
  // ===== BODY TEXT =====
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 26,
    letterSpacing: 0.15,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  
  // ===== CAPTION / SMALL TEXT =====
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  overline: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // ===== NÚMEROS Y STATS (Especial para fitness) =====
  
  // Para contadores grandes (calorías, minutos, peso)
  numberHero: {
    fontSize: 64,
    fontWeight: 'bold',
    lineHeight: 72,
    letterSpacing: -2,
  },
  numberLarge: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 56,
    letterSpacing: -1.5,
  },
  numberMedium: {
    fontSize: 36,
    fontWeight: '600',
    lineHeight: 44,
    letterSpacing: -1,
  },
  numberSmall: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    letterSpacing: -0.5,
  },

  // Para stats en cards (reps, sets, peso)
  stat: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: 0,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ===== BOTONES =====
  buttonLarge: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.25,
  },

  // ===== BADGES / CHIPS =====
  badge: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  badgeSmall: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 0.5,
  },

  // ===== TABS / NAVIGATION =====
  tabActive: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  tabInactive: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.25,
  },

  // ===== INPUTS / FORMS =====
  input: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  inputHelper: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  inputError: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.4,
  },
};

/**
 * Alias corto
 */
export const typo = typography;

export default typography;