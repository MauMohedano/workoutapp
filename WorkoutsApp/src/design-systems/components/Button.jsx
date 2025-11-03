import React from 'react';
import { Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { radius } from '../tokens/radius';
import Text from './Text';

/**
 * 🔘 BUTTON COMPONENT
 * 
 * Botón con variantes visuales y estados manejados.
 * 
 * @param {string} variant - primary, secondary, ghost, danger
 * @param {string} size - sm, md, lg
 * @param {function} onPress - Callback al presionar
 * @param {boolean} disabled - Deshabilitar botón
 * @param {boolean} loading - Mostrar spinner
 * @param {boolean} fullWidth - Ocupa todo el ancho
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  children,
  style,
  ...props
}) {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textColor = getTextColor(variant);
  const textSize = getTextSize(size);

  return (
    <Pressable
      style={({ pressed }) => [
        buttonStyles,
        pressed && !disabled && !loading && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={textColor}
          size={size === 'sm' ? 'small' : 'default'}
        />
      ) : (
        <Text 
          variant={textSize}
          color={textColor}
          style={styles.text}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

// ===== HELPER FUNCTIONS =====

function getTextColor(variant) {
  const colorMap = {
    primary: colors.neutral.white,
    secondary: colors.primary.main,
    ghost: colors.primary.main,
    danger: colors.neutral.white,
  };
  return colorMap[variant] || colors.neutral.white;
}

function getTextSize(size) {
  const sizeMap = {
    sm: 'bodySmall',
    md: 'body',
    lg: 'body',
  };
  return sizeMap[size] || 'body';
}

// ===== STYLES =====

const styles = StyleSheet.create({
  // Base
  base: {
    borderRadius: radius.base,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variants
  primary: {
    backgroundColor: colors.primary.main,
  },
  secondary: {
    backgroundColor: colors.neutral.white,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.danger.main,
  },
  
  // Sizes
  size_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  size_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  size_lg: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
  },
  
  // Text
  text: {
    fontWeight: '600',
  },
  
  // States
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});