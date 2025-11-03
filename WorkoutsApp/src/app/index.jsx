import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, FlatList, StyleSheet, View, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getRoutines } from '../../src/api/routineApi';
import { Link } from 'expo-router';
import { colors, spacing, typography, radius, shadows } from '@/design-systems/tokens';
import { Text, Button, Card } from '@/design-systems/components';

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
        <Text variant="body" color="danger.main" align="center">
          Error: {error.message}
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="h3" color="neutral.gray600" style={{ marginBottom: spacing.sm }}>
          No tienes rutinas creadas
        </Text>
        <Text variant="bodySmall" color="neutral.gray500" style={{ marginBottom: spacing.xl }}>
          Crea tu primera rutina para comenzar
        </Text>
        <Button
          variant="primary"
          onPress={() => console.log('Botón presionado!')}
        >
          ➕ Crear Rutina
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        contentContainerStyle={{ gap: spacing.sm + 2, padding: spacing.sm + 2 }}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Link href={`/routines/${item._id}`} asChild>
            <Card>
              <View style={styles.routineHeader}>
                <Text variant="h2" color="neutral.gray600" style={styles.routineName}>
                  {item.name}
                </Text>
                {item.isActive && (
                  <View style={styles.activeBadge}>
                    <Text variant="captionBold" color="neutral.gray600">
                      ⭐ Activa
                    </Text>
                  </View>
                )}
              </View>

              {item.description ? (
                <Text variant="bodySmall" color="neutral.gray500" style={{ marginBottom: spacing.md }}>
                  {item.description}
                </Text>
              ) : null}

              <View style={styles.routineStats}>
                <Text variant="bodySmall" color="neutral.gray500">
                  📅 {item.days?.length || 0} días
                </Text>
                <Text variant="bodySmall" color="neutral.gray500">
                  💪 {item.days?.reduce((total, day) => total + (day.exercises?.length || 0), 0) || 0} ejercicios
                </Text>
              </View>
            </Card>
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

  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  routineName: {
    flex: 1,
  },
  activeBadge: {
    backgroundColor: colors.special.gold,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
  },
  routineStats: {
    flexDirection: 'row',
    gap: spacing.base,
  },
});