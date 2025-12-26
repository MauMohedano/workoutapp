import { View, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, radius, Icon } from '@/design-systems/tokens';
import { Text } from '@/design-systems/components';


export default function ExerciseNavigation({ 
  onPrevious, 
  onNext, 
  canGoPrevious, 
  canGoNext,
  currentIndex,
  totalExercises
}) {
  return (
    <View style={styles.container}>
      {/* Previous Button */}
      <Pressable
        style={[styles.navButton, !canGoPrevious && styles.navButtonDisabled]}
        onPress={onPrevious}
        disabled={!canGoPrevious}
      >
        <Icon 
          name="chevron-back" 
          size={24} 
          color={canGoPrevious ? colors.primary.main : colors.neutral.gray300} 
        />
      </Pressable>

      {/* Counter */}
      <View style={styles.counter}>
        <Text variant="overline" color="neutral.gray500" style={styles.counterLabel}>
          EJERCICIO
        </Text>
        <Text variant="h2" color="neutral.gray900" bold>
          {currentIndex + 1} de {totalExercises}
        </Text>
      </View>

      {/* Next Button */}
      <Pressable
        style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
        onPress={onNext}
        disabled={!canGoNext}
      >
        <Icon 
          name="chevron-forward" 
          size={24} 
          color={canGoNext ? colors.primary.main : colors.neutral.gray300} 
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: colors.neutral.gray100,
    opacity: 0.5,
  },
  counter: {
    alignItems: 'center',
    gap: spacing.xs - 4,
  },
  counterLabel: {
    letterSpacing: 1.2,
  },
});
