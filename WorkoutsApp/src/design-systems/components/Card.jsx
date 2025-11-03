import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { radius } from '../tokens/radius';
import { shadows } from '../tokens/shadows';

/**
 * 🃏 CARD COMPONENT
 * 
 * Contenedor base para información agrupada.
 * Puede ser presionable o estático.
 * 
 * @param {string} variant - default, highlighted, flat
 * @param {function} onPress - Si existe, card es presionable
 * @param {number} padding - Override padding (default: spacing.base)
 * @param {boolean} shadow - Mostrar sombra (default: true)
 * @param {object} style - Estilos adicionales
 */
export default function Card({
  variant = 'default',
  onPress,
  padding = spacing.base,
  shadow = true,
  children,
  style,
  ...props
}) {
  const cardStyles = [
    styles.base,
    { padding },
    shadow && shadows.md,
    styles[variant],
    style,
  ];

  // Si tiene onPress, usar Pressable
  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          cardStyles,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  // Si no, usar View estático
  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
}

// ===== STYLES =====

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  
  // Variants
  default: {
    // Solo el shadow del prop
  },
  highlighted: {
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  flat: {
    backgroundColor: colors.neutral.gray50,
  },
  
  // States
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
});