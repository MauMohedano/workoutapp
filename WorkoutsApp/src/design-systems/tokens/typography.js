/**
 * 🔤 DESIGN TOKENS: TYPOGRAPHY
 * 
 * Sistema tipográfico consistente.
 * Jerarquía visual clara con tamaños escalados.
 * 
 * Uso:
 * fontSize: typography.heading1.fontSize
 * fontWeight: typography.heading1.fontWeight
 */

export const typography = {
  // Headings
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  
  // Caption / Small text
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
};

// Alias
export const typo = typography;