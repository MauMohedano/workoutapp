import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { radius } from '../tokens/radius';
import { shadows } from '../tokens/shadows';
import { Icon } from '../tokens/icons';
import Text from './Text';

/**
 * 💪 EXERCISE CARD COMPONENT
 * 
 * Tarjeta para mostrar ejercicios en listas.
 * Componente presentacional (solo UI, lógica en el parent).
 * 
 * @param {Object} exercise - Objeto con datos del ejercicio
 * @param {Function} onPress - Callback al presionar
 * @param {number} index - Número de orden en la lista
 * @param {string} variant - 'default' | 'compact' | 'readonly'
 * @param {boolean} completed - Marca como completado
 * @param {boolean} current - Marca como actual/en progreso
 * @param {boolean} disabled - Deshabilita la interacción
 * @param {boolean} showMeta - Muestra músculo y equipment
 */
export default function ExerciseCard({
  exercise,
  onPress,
  index,
  variant = 'default',
  completed = false,
  current = false,
  disabled = false,
  showMeta = true,
  style,
  ...props
}) {
  const isInteractive = !disabled && onPress;

  return (
    <Pressable
      onPress={isInteractive ? () => onPress(exercise) : undefined}
      disabled={!isInteractive}
      style={({ pressed }) => [
        styles.container,
        styles[variant],
        completed && styles.completed,
        current && styles.current,
        disabled && styles.disabled,
        pressed && isInteractive && styles.pressed,
        style,
      ]}
      {...props}
    >
      {/* Número de orden */}
      <View style={[
        styles.orderBadge,
        completed && styles.orderBadgeCompleted,
        current && styles.orderBadgeCurrent,
      ]}>
        {completed ? (
          <Icon name="success" size={16} color={colors.success.main} />
        ) : (
          <Text variant="captionBold" color="neutral.gray600">
            {index}
          </Text>
        )}
      </View>

      {/* Contenido principal */}
      <View style={styles.content}>
        {/* Nombre del ejercicio */}
        <Text 
          variant={variant === 'compact' ? 'bodyMedium' : 'body'} 
          color={completed ? "neutral.gray500" : "neutral.gray800"}
          style={styles.exerciseName}
        >
          {exercise.name}
        </Text>

        {/* Sets y reps */}
        <View style={styles.setsRepsRow}>
          <Icon name="repeat" size={14} color={colors.primary.main} />
          <Text 
            variant="bodySmall" 
            color="primary.main"
            style={styles.setsReps}
          >
            {exercise.targetSets} sets × {exercise.targetReps} reps
          </Text>
        </View>

        {/* Metadata (músculo y equipment) */}
        {showMeta && variant !== 'compact' && (
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="body" size={12} color={colors.neutral.gray500} />
              <Text variant="caption" color="neutral.gray500" style={styles.metaText}>
                {exercise.muscle}
              </Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Icon name="barbell" size={12} color={colors.neutral.gray500} />
              <Text variant="caption" color="neutral.gray500" style={styles.metaText}>
                {exercise.equipment}
              </Text>
            </View>
            {exercise.restTime && (
              <>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Icon name="timer" size={12} color={colors.neutral.gray500} />
                  <Text variant="caption" color="neutral.gray500" style={styles.metaText}>
                    {exercise.restTime}s
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Badge de estado */}
        {current && !completed && (
          <View style={styles.currentBadge}>
            <Text variant="caption" color="primary.main" style={{ fontWeight: '600' }}>
              EN PROGRESO
            </Text>
          </View>
        )}
      </View>

      {/* Icono de acción */}
      {isInteractive && !completed && (
        <Icon 
          name="chevronRight" 
          size={20} 
          color={current ? colors.primary.main : colors.neutral.gray400} 
        />
      )}
    </Pressable>
  );
}

// ===== STYLES =====

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.neutral.gray50,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  // Variants
  default: {
    padding: spacing.md,
  },
  compact: {
    padding: spacing.sm,
  },
  readonly: {
    backgroundColor: colors.neutral.gray100,
  },

  // States
  completed: {
    opacity: 0.6,
    backgroundColor: colors.success.main + '10',
  },
  current: {
    backgroundColor: colors.primary.main + '10',
    borderColor: colors.primary.main,
    ...shadows.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  // Order badge
  orderBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderBadgeCompleted: {
    backgroundColor: colors.success.main + '20',
  },
  orderBadgeCurrent: {
    backgroundColor: colors.primary.main + '20',
  },

  // Content
  content: {
    flex: 1,
    gap: spacing.xs - 2,
  },
  exerciseName: {
    fontWeight: '600',
  },

  // Sets and reps
  setsRepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  setsReps: {
    fontWeight: '600',
  },

  // Metadata
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    textTransform: 'capitalize',
  },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: colors.neutral.gray300,
  },

  // Current badge
  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary.main + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.base,
  },
});