import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { colors, spacing, radius, Icon } from '@/design-systems/tokens';
import { Text } from '@/design-systems/components';

/**
 * CollapsibleSection - Sección colapsable estilo Nike/Strava
 * 
 * @param {string} title - Título de la sección
 * @param {number} count - Número a mostrar en badge (ej: cantidad de sesiones)
 * @param {string} emoji - Emoji para el header (ej: 📊, 🎯, 📅)
 * @param {boolean} defaultExpanded - Estado inicial (expandido/colapsado)
 * @param {ReactNode} children - Contenido de la sección
 * @param {string} variant - 'default' | 'primary' | 'secondary'
 */
export default function CollapsibleSection({
  title,
  count,
  iconName,  
  defaultExpanded = false,
  children,
  variant = 'default'
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const animatedHeight = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;
  const animatedRotation = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  // Colores según variante
  const variantStyles = {
    default: {
      titleColor: colors.neutral.gray700,
      badgeColor: colors.neutral.gray200,
      badgeTextColor: colors.neutral.gray700,
      borderColor: colors.neutral.gray200,
    },
    primary: {
      titleColor: colors.primary.main,
      badgeColor: colors.primary.main + '15',
      badgeTextColor: colors.primary.main,
      borderColor: colors.primary.main + '30',
    },
    secondary: {
      titleColor: colors.neutral.gray600,
      badgeColor: colors.neutral.gray100,
      badgeTextColor: colors.neutral.gray600,
      borderColor: colors.neutral.gray200,
    }
  };

  const currentVariant = variantStyles[variant];

  // Toggle con animación
  const toggleSection = () => {
    const toValue = isExpanded ? 0 : 1;

    Animated.parallel([
      Animated.spring(animatedHeight, {
        toValue,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(animatedRotation, {
        toValue,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      })
    ]).start();

    setIsExpanded(!isExpanded);
  };

  // Interpolaciones
  const heightInterpolate = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2000], // Altura máxima
  });

  const rotateInterpolate = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const opacityInterpolate = animatedHeight.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  return (
    <View style={[styles.container, { borderColor: currentVariant.borderColor }]}>
      {/* Header clickeable */}
      <Pressable
        style={styles.header}
        onPress={toggleSection}
        android_ripple={{ color: colors.neutral.gray200 }}
      >
        <View style={styles.headerLeft}>
          {iconName && (
    <Icon
      name={iconName}
      size={20}
      color={currentVariant.titleColor}
    />
  )}
          
          {/* Título */}
          <Text
            variant="bodyLarge"
            style={[styles.title, { color: currentVariant.titleColor }]}
            bold
          >
            {title}
          </Text>

          {/* Badge con número */}
          {count !== undefined && (
            <View style={[
              styles.badge,
              { backgroundColor: currentVariant.badgeColor }
            ]}>
              <Text
                variant="caption"
                style={[styles.badgeText, { color: currentVariant.badgeTextColor }]}
                bold
              >
                {count}
              </Text>
            </View>
          )}
        </View>

        {/* Chevron animado */}
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <Icon
            name="chevron-down"
            size={20}
            color={currentVariant.titleColor}
          />
        </Animated.View>
      </Pressable>

      {/* Divider animado */}
      {isExpanded && (
        <View style={[styles.divider, { backgroundColor: currentVariant.borderColor }]} />
      )}

      {/* Contenido colapsable */}
      <Animated.View
        style={[
          styles.content,
          {
            maxHeight: heightInterpolate,
            opacity: opacityInterpolate,
            overflow: 'hidden',
          }
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  title: {
    flex: 1,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.lg,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
});