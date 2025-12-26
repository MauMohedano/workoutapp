import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { colors, spacing, radius, shadows, Icon } from '@/design-systems/tokens';
import { Text } from '@/design-systems/components';
import { CircularProgress } from '@/design-systems/components';

/**
 * 💪 EXERCISE CARD COMPONENT (Nike Minimalist Style)
 * 
 * @param {Object} exercise - Objeto con datos del ejercicio
 * @param {Function} onPress - Callback al presionar
 * @param {number} index - Número de orden en la lista
 * @param {Object} progress - { completedSets, totalSets, percentage } o null
 * @param {string} variant - 'default' | 'compact' | 'readonly'
 * @param {boolean} completed - Marca como completado
 * @param {boolean} current - Marca como actual/en progreso
 * @param {boolean} disabled - Deshabilita la interacción
 */
export default function ExerciseCard({
  exercise,
  onPress,
  index,
  progress = null,
  variant = 'default',
  completed = false,
  current = false,
  disabled = false,
  style,
  ...props
}) {
  const isInteractive = !disabled && onPress;
  const hasProgress = progress && progress.percentage > 0;

  return (
    <Pressable
      onPress={isInteractive ? () => onPress(exercise) : undefined}
      disabled={!isInteractive}
      style={({ pressed }) => [
        styles.container,
        current && styles.current,
        pressed && isInteractive && styles.pressed,
        style,
      ]}
      {...props}
    >
      {/* Círculo de progreso O número de orden */}
      {hasProgress ? (
        <View style={styles.progressContainer}>
          <CircularProgress
            percentage={progress.percentage}
            size={36}
            strokeWidth={3}
            showPercentage={false}
            color={progress.percentage === 100 ? colors.success.main : colors.primary.main}
          />
          <Text 
            variant="caption" 
            style={[
              styles.progressText,
              { color: progress.percentage === 100 ? colors.success.main : colors.primary.main }
            ]}
            bold
          >
            {progress.percentage}%
          </Text>
        </View>
      ) : (
        <View style={[
          styles.orderBadge,
          current && styles.orderBadgeCurrent,
        ]}>
          <Text variant="caption" color={current ? "primary.main" : "neutral.gray600"} bold>
            {index}
          </Text>
        </View>
      )}

      {/* Contenido principal */}
      <View style={styles.content}>
        {/* Nombre del ejercicio */}
        <Text 
          variant="bodyMedium"
          color="neutral.gray800"
          style={styles.exerciseName}
        >
          {exercise.name}
        </Text>

        {/* Sets, reps y descanso en una línea */}
        <View style={styles.infoRow}>
          <Text variant="bodySmall" color="neutral.gray600">
            {hasProgress 
              ? `${progress.completedSets}/${progress.totalSets} sets`
              : `${exercise.targetSets} sets × ${exercise.targetReps} reps`
            }
          </Text>
          
          {exercise.restTime && (
            <>
              <Text variant="bodySmall" color="neutral.gray400"> • </Text>
              <Text variant="bodySmall" color="neutral.gray600">
                Rest: {Math.floor(exercise.restTime / 60)}:{(exercise.restTime % 60).toString().padStart(2, '0')}
              </Text>
            </>
          )}
        </View>

        {/* Badge de estado "EN PROGRESO" */}
        {current && !completed && (
          <View style={styles.currentBadge}>
            <Text variant="caption" color="primary.main" bold>
              EN PROGRESO
            </Text>
          </View>
        )}
      </View>

      {/* Icono de acción (solo si es interactivo) */}
      {isInteractive && (
        <Icon 
          name="chevron-forward" 
          size={20} 
          color={current ? colors.primary.main : colors.neutral.gray400} 
        />
      )}
    </Pressable>
  );
}



const styles = StyleSheet.create({
container: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 16,  
  paddingVertical: 20,  
  paddingHorizontal: 20,  
  backgroundColor: colors.neutral.white,
  borderRadius: 12, 
  borderWidth: 1,
  borderColor: colors.neutral.gray200,
  marginBottom: 16,  
  minHeight: 88, 
},

  // States
  current: {
    backgroundColor: colors.primary.main + '08',
    borderColor: colors.primary.main + '40',
    ...shadows.sm,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  // Progress container (círculo)
  progressContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressText: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '700',
  },

  // Order badge (cuando no hay progreso)
  orderBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderBadgeCurrent: {
    backgroundColor: colors.primary.main + '20',
    borderWidth: 2,
    borderColor: colors.primary.main,
  },

  // Content
  content: {
    flex: 1,
    gap: spacing.xs - 2,
  },
  exerciseName: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Info row (sets, reps, rest)
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  // Current badge
  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary.main + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.base,
    marginTop: spacing.xs - 2,
  },
});