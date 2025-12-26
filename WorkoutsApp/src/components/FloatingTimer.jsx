import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useWorkoutTimer } from '../contexts/WorkoutTimerContext';
import Text from '../design-systems/components/Text';
import { colors, spacing, radius, shadows } from '../design-systems/tokens';

export const FloatingTimer = () => {
  const router = useRouter();
const { 
    isActive, 
    getFormattedTime, 
    routineId, 
    sessionNumber,
    exerciseIndex,
    dayId,
    dayName,
    totalExercises
} = useWorkoutTimer();

  // No mostrar si no hay timer activo
  if (!isActive) return null;

  const handlePress = () => {
    // Navegar al workout activo
    if (routineId && sessionNumber && dayId) {
        router.push({
            pathname: '/workout',
            params: {
                routineId,
                sessionNumber,
                dayId,
                dayName: dayName || 'Workout',
                totalExercises: totalExercises || 0,
                exerciseIndex: exerciseIndex || 0,
                isReadOnly: 'false'
            }
        });
    }
};

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed
      ]}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>⏱️</Text>
      </View>
      <Text style={styles.time} bold>
        {getFormattedTime()}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50, // Debajo del header
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    ...shadows.md,
    zIndex: 9999, // Siempre encima
  },
  containerPressed: {
    backgroundColor: colors.primary.dark,
    transform: [{ scale: 0.95 }],
  },
  iconContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
  },
  time: {
    color: colors.neutral.white,
    fontSize: 14,
    letterSpacing: 0.5,
  },
});