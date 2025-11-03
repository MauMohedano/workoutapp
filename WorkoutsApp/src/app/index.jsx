import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getRoutines } from '../../src/api/routineApi';
import { Link } from 'expo-router';
import { colors, spacing } from '@/design-systems/tokens';

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
    backgroundColor: colors.neutral.gray100,  // ✅ Cambiado de '#f5f5f5'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    color: colors.danger.main,  // ✅ Cambiado de '#FF3B30'
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray600,  // ✅ Cambiado de '#333'
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.neutral.gray500,  // ✅ Cambiado de '#666'
  },
  routineCard: {
    backgroundColor: colors.neutral.white,
     padding: spacing.base,
    borderRadius: 12,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routineName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neutral.gray600,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: colors.special.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.gray600,
  },
  routineDescription: {
    fontSize: 14,
    color: colors.neutral.gray500,
    marginBottom: 12,
  },
  routineStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 14,
    color: colors.neutral.gray500,
  },
    routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});