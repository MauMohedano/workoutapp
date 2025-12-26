import { View, StyleSheet } from 'react-native';
import { colors, spacing, radius, Icon } from '@/design-systems/tokens';
import { Text } from '@/design-systems/components';

export default function SetRow({ setNumber, weight, reps, isCurrentSession = false }) {
  return (
    <View style={styles.container}>
      {/* Set Badge */}
      <View style={[
        styles.setBadge,
        isCurrentSession && styles.setBadgeCurrent
      ]}>
        <Text 
          variant="caption" 
          color={isCurrentSession ? "primary.main" : "neutral.gray600"}
          bold
        >
          Set {setNumber}
        </Text>
      </View>

      {/* Weight × Reps */}
      <View style={styles.values}>
        <Text variant="bodyMedium" color="neutral.gray800" bold>
          {weight}kg
        </Text>
        <Text variant="bodyMedium" color="neutral.gray600">
          {' × '}
        </Text>
        <Text variant="bodyMedium" color="neutral.gray800" bold>
          {reps} reps
        </Text>
      </View>

      {/* Checkmark */}
      <Icon 
        name="checkmark-circle" 
        size={20} 
        color={isCurrentSession ? colors.success.main : colors.neutral.gray400} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.base,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    marginBottom: spacing.xs,
  },
  setBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 2,
    backgroundColor: colors.neutral.gray200,
    borderRadius: radius.base,
    minWidth: 50,
    alignItems: 'center',
  },
  setBadgeCurrent: {
    backgroundColor: colors.primary.main + '20',
  },
  values: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});