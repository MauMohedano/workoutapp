import { View, StyleSheet, Animated, Pressable } from 'react-native';
import { colors, spacing, radius } from '@/design-systems/tokens';
import { Text } from '@/design-systems/components';
import { useEffect, useRef, useState } from 'react';

export default function AutoAdvanceBar({ onAdvance, onCancel, nextExerciseName }) {
  const [countdown, setCountdown] = useState(5);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    // Slide up animation cuando aparece
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start();

    // Countdown cada segundo
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onAdvance();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      {/* Countdown text */}
      <View style={styles.header}>
        <Text variant="h3" color="neutral.gray800" bold>
          ⏱️ Siguiente ejercicio en {countdown}s
        </Text>
        {nextExerciseName && (
          <Text variant="bodyMedium" color="neutral.gray600" style={styles.nextExercise}>
            {nextExerciseName}
          </Text>
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: progressWidth },
          ]}
        />
      </View>

      {/* Cancel button */}
      <Pressable onPress={onCancel} style={styles.cancelButton}>
        <Text variant="bodyMedium" color="neutral.gray600" bold>
          CANCELAR
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral.white,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  nextExercise: {
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral.gray200,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: radius.full,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.neutral.gray100,
    borderRadius: radius.lg,
  },
});