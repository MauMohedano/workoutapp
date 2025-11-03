import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';

/**
 * 📝 TEXT COMPONENT
 * 
 * Componente de texto con variantes tipográficas predefinidas.
 * Reemplaza <Text> nativo para consistencia visual.
 * 
 * @param {string} variant - h1, h2, h3, body, bodySmall, caption, captionBold
 * @param {string} color - Ruta al color (ej: 'neutral.gray600') o color directo
 * @param {string} align - left, center, right, justify
 * @param {boolean} bold - Forzar bold (sobrescribe variant)
 * @param {object} style - Estilos adicionales
 */
export default function Text({
  variant = 'body',
  color,
  align = 'left',
  bold = false,
  style,
  children,
  ...props
}) {
  // Resolver variante tipográfica
  const typeStyle = getVariantStyle(variant);
  
  // Resolver color
  const textColor = resolveColor(color);
  
  // Estilos combinados
  const combinedStyle = [
    typeStyle,
    textColor && { color: textColor },
    align !== 'left' && { textAlign: align },
    bold && { fontWeight: 'bold' },
    style,
  ];

  return (
    <RNText style={combinedStyle} {...props}>
      {children}
    </RNText>
  );
}

// ===== HELPER FUNCTIONS =====

function getVariantStyle(variant) {
  const variants = {
    h1: typography.heading1,
    h2: typography.heading2,
    h3: typography.heading3,
    body: typography.body,
    bodySmall: typography.bodySmall,
    caption: typography.caption,
    captionBold: typography.captionBold,
  };

  return variants[variant] || variants.body;
}

function resolveColor(colorPath) {
  if (!colorPath) return colors.neutral.gray600; // Default
  
  // Si es un color directo (ej: "#FF0000")
  if (typeof colorPath === 'string' && colorPath.startsWith('#')) {
    return colorPath;
  }
  
  // Si es una ruta (ej: "primary.main" o "neutral.gray600")
  if (typeof colorPath === 'string') {
    const parts = colorPath.split('.');
    let resolved = colors;
    
    for (const part of parts) {
      resolved = resolved[part];
      if (!resolved) {
        console.warn(`Color "${colorPath}" not found in design tokens`);
        return colors.neutral.gray600;
      }
    }
    
    return resolved;
  }
  
  return colorPath; // Ya es un color
}