import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getRoutines } from '../../src/api/routineApi';
import { Link } from 'expo-router';
import { colors, spacing, typography, radius, shadows } from '@/design-systems/tokens';

export default function HomeScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['routines'],
    queryFn: getRoutines
  })

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No tienes rutinas creadas</Text>
        <Text style={styles.emptySubtext}>Crea tu primera rutina para comenzar</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        contentContainerStyle={{ gap: 10, padding: 10 }}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Link href={`/routines/${item._id}`} asChild>
            <Pressable style={styles.routineCard}>
              <View style={styles.routineHeader}>
                <Text style={styles.routineName}>{item.name}</Text>
                {item.isActive && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>⭐ Activa</Text>
                  </View>
                )}
              </View>

              {item.description ? (
                <Text style={styles.routineDescription}>{item.description}</Text>
              ) : null}

              <View style={styles.routineStats}>
                <Text style={styles.statText}>
                  📅 {item.days?.length || 0} días
                </Text>
                <Text style={styles.statText}>
                  💪 {item.days?.reduce((total, day) => total + (day.exercises?.length || 0), 0) || 0} ejercicios
                </Text>
              </View>
            </Pressable>
          </Link>
        )}
      />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    color: colors.danger.main,
    ...typography.body,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.heading3,
    color: colors.neutral.gray600,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.neutral.gray500,
  },
  routineCard: {
    backgroundColor: colors.neutral.white,
    padding: spacing.base,
    borderRadius: radius.lg,
    ...shadows.md,  // ← Shadow con tokens
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  routineName: {
    ...typography.heading2,
    color: colors.neutral.gray600,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: colors.special.gold,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
  },
  activeBadgeText: {
    ...typography.captionBold,
    color: colors.neutral.gray600,
  },
  routineDescription: {
    ...typography.bodySmall,
    color: colors.neutral.gray500,
    marginBottom: spacing.md,
  },
  routineStats: {
    flexDirection: 'row',
    gap: spacing.base,
  },
  statText: {
    ...typography.bodySmall,
    color: colors.neutral.gray500,
  },
});