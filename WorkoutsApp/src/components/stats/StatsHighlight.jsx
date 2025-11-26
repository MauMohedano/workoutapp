import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, shadows, Icon } from '@/design-systems/tokens';
import { Text, Card } from '@/design-systems/components';

/**
 * Preview de estadísticas para el dashboard
 * Muestra 2-3 métricas clave con link a screen completa
 */
export default function StatsHighlight({ stats, deviceId }) {
  const router = useRouter();

  if (!stats) return null;

  const { volume, consistency, personalRecords } = stats;

  // Top PR
  const topPR = personalRecords?.[0];

  return (
    <Pressable onPress={() => router.push(`/stats?deviceId=${deviceId}`)}>
      <Card shadow="md" style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Icon name="flame" size={20} color={colors.warning.main} />
            <Text variant="bodyLarge" color="neutral.gray800" style={{ fontWeight: '600' }}>
              Estadísticas
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.neutral.gray400} />
        </View>

        {/* Grid de stats */}
        <View style={styles.statsGrid}>
          {/* Volumen total */}
          <View style={styles.statItem}>
            <Text variant="h2" color="primary.main">
              {volume?.totalWeight || 0}
            </Text>
            <Text variant="caption" color="neutral.gray500">
              kg levantados
            </Text>
          </View>

          {/* Sesiones completadas */}
          <View style={styles.statItem}>
            <Text variant="h2" color="success.main">
              {consistency?.totalCompleted || 0}
            </Text>
            <Text variant="caption" color="neutral.gray500">
              completadas
            </Text>
          </View>

          {/* Top PR */}
          {topPR && (
            <View style={styles.statItem}>
              <Text variant="h2" color="warning.main">
                {topPR.weight}kg
              </Text>
              <Text variant="caption" color="neutral.gray500" numberOfLines={1}>
                PR: {topPR.exercise}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
    padding: spacing.sm,
    borderRadius: radius.lg,
    alignItems: 'center',
    gap: spacing.xs - 2,
  },
});