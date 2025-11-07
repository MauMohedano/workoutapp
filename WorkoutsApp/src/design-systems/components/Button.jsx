import React from 'react';
import { Pressable, ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { radius } from '../tokens/radius';
import { shadows } from '../tokens/shadows';
import { Icon } from '../tokens/icons';
import Text from './Text';

/**
 * 🔘 BUTTON COMPONENT V2.0
 * 
 * Botón con soporte para iconos y variantes visuales.
 * 
 * @param {string} variant - primary, secondary, ghost, danger
 * @param {string} size - sm, md, lg
 * @param {string} icon - Nombre del icono (opcional)
 * @param {string} iconPosition - 'left' o 'right' (default: 'left')
 * @param {number} iconSize - Tamaño del icono (opcional)
 * @param {function} onPress - Callback al presionar
 * @param {boolean} disabled - Deshabilitar botón
 * @param {boolean} loading - Mostrar spinner
 * @param {boolean} fullWidth - Ocupa todo el ancho
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  iconSize,
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
    !disabled && !loading && shadows.md,
    style,
  ];

  const textColor = getTextColor(variant, disabled);
  const textVariant = getTextVariant(size);
  const resolvedIconSize = iconSize || getIconSize(size);

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
        <View style={styles.content}>
          {/* Icono a la izquierda */}
          {icon && iconPosition === 'left' && (
            <Icon 
              name={icon} 
              size={resolvedIconSize} 
              color={textColor}
              style={{ marginRight: spacing.xs }}
            />
          )}
          
          {/* Texto */}
          <Text 
            variant={textVariant}
            color={textColor}
            style={styles.text}
          >
            {children}
          </Text>
          
          {/* Icono a la derecha */}
          {icon && iconPosition === 'right' && (
            <Icon 
              name={icon} 
              size={resolvedIconSize} 
              color={textColor}
              style={{ marginLeft: spacing.xs }}
            />
          )}
        </View>
      )}
    </Pressable>
  );
}

// ===== HELPER FUNCTIONS =====

function getTextColor(variant, disabled) {
  if (disabled) return colors.neutral.gray400;
  
  const colorMap = {
    primary: colors.neutral.white,
    secondary: colors.primary.main,
    ghost: colors.primary.main,
    danger: colors.neutral.white,
    warning: colors.neutral.gray900,
  };
  return colorMap[variant] || colors.neutral.white;
}

function getTextVariant(size) {
  const sizeMap = {
    sm: 'buttonSmall',
    md: 'button',
    lg: 'buttonLarge',
  };
  return sizeMap[size] || 'button';
}

function getIconSize(size) {
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
  };
  return sizeMap[size] || 20;
}

// ===== STYLES =====

const styles = StyleSheet.create({
  // Base
  base: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  
  // Content wrapper (para alinear icono + texto)
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  warning: {
    backgroundColor: colors.warning.main,
  },
  
  // Sizes
  size_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    minHeight: 40,
  },
  size_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  size_lg: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
  
  // Text
  text: {
    textAlign: 'center',
  },
  
  // States
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});