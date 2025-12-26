import { View, StyleSheet } from 'react-native';
import { colors, spacing, radius, Icon } from '@/design-systems/tokens';
import { Text } from '@/design-systems/components';
import SetRow from './SetRow';


export default function SessionSection({ 
  title, 
  subtitle, 
  sets = [], 
  isCurrentSession = false,
  icon = 'calendar'
}) {
  if (!sets || sets.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon 
          name={icon} 
          size={18} 
          color={isCurrentSession ? colors.primary.main : colors.neutral.gray600} 
        />
        <View style={styles.headerText}>
          <Text 
            variant="bodyMedium" 
            color={isCurrentSession ? "primary.main" : "neutral.gray800"} 
            bold
          >
            {title}
          </Text>
          {subtitle && (
            <Text variant="caption" color="neutral.gray500">
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* Sets List */}
      <View style={styles.setsList}>
        {sets.map((set, index) => (
          <SetRow
            key={index}
            setNumber={index + 1}
            weight={set.weight}
            reps={set.reps}
            isCurrentSession={isCurrentSession}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.sm + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  setsList: {
    gap: 0,
  },
});