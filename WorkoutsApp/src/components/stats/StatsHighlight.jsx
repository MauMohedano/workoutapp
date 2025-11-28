import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, Icon } from '@/design-systems/tokens';
import { Text, Card } from '@/design-systems/components';

export default function StatsHighlight({ stats, deviceId }) {
  const router = useRouter();

  if (!stats) return null;

  const { volume, consistency, personalRecords } = stats;
  const topPR = personalRecords?.[0];

  return (
    <Pressable onPress={() => router.push(`/stats?deviceId=${deviceId}`)}>
      <Card shadow="md" style={styles.statsCard}>
        {/* Header */}
        <View style={styles.statsHeader}>
          <View style={styles.statsTitleRow}>
            <Icon name="trophy" size={24} color={colors.primary.main} />
            <Text variant="bodyLarge" color="neutral.gray800" bold>
              Estadísticas
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.neutral.gray400} />
        </View>

        {/* Stats en fila con dividers */}
        <View style={styles.statsRow}>
          {/* Volumen */}
          <View style={styles.statColumn}>
            <Text variant="h2" color="primary.main">
              {(volume?.totalWeight || 0).toLocaleString()}
            </Text>
            <Text variant="caption" color="neutral.gray500" align="center">
              kg levantados
            </Text>
          </View>

          <View style={styles.statDivider} />

          {/* Racha */}
          <View style={styles.statColumn}>
            <View style={styles.streakBadge}>
              <Icon name="flame" size={16} color={colors.warning.main} />
              <Text variant="h2" color="warning.main">
                {consistency?.streak || 0}
              </Text>
            </View>
            <Text variant="caption" color="neutral.gray500" align="center">
              días de racha
            </Text>
          </View>

          <View style={styles.statDivider} />

          {/* Completadas */}
          <View style={styles.statColumn}>
            <Text variant="h2" color="success.main">
              {consistency?.totalCompleted || 0}
            </Text>
            <Text variant="caption" color="neutral.gray500" align="center">
              completadas
            </Text>
          </View>
        </View>

        {/* Top PR - Destacado abajo */}
        {topPR && (
          <View style={styles.prHighlight}>
            <Icon name="trophy" size={16} color={colors.warning.main} />
            <Text variant="bodySmall" color="neutral.gray700">
              <Text bold color="neutral.gray800">PR: </Text>
              {topPR.exercise} - {topPR.weight}kg
            </Text>
          </View>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    padding: spacing.lg,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral.gray200,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
});
