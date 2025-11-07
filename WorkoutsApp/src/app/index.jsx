import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getRoutines } from '../../src/api/routineApi';
import { Link } from 'expo-router';
import { colors, spacing, typography, radius, shadows, Icon } from '@/design-systems/tokens';
import { Text, Button, Card } from '@/design-systems/components';



export default function HomeScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['routines'],
    queryFn: getRoutines
  })

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text
          variant="bodyMedium"
          color="neutral.gray500"
          style={{ marginTop: spacing.md }}
        >
          Cargando rutinas...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="error" size="xxl" color="danger.main" />
        <Text
          variant="h3"
          color="danger.main"
          align="center"
          style={{ marginTop: spacing.md }}
        >
          Error: {error.message}
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIcon}>
          <Icon name="dumbbell" size="xxl" color="primary.main" />
        </View>

        <Text
          variant="h2"
          color="neutral.gray800"
          align="center"
          style={{ marginBottom: spacing.sm }}
        >
          ¡Comienza tu viaje fitness!
        </Text>

        <Text
          variant="bodyMedium"
          color="neutral.gray500"
          align="center"
          style={{ marginBottom: spacing.xl, maxWidth: 280 }}
        >
          Crea tu primera rutina y empieza a alcanzar tus objetivos
        </Text>

        <Button
          variant="primary"
          size="lg"
          onPress={() => console.log('Crear rutina')}
        >
          Crear Rutina
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Link href={`/routines/${item._id}`} asChild>
            <Card shadow="lg">
              {/* Header con nombre y badge */}
              <View style={styles.routineHeader}>
                <Text variant="h3" color="neutral.gray800" style={styles.routineName}>
                  {item.name}
                </Text>

                {item.isActive && (
                  <View style={styles.activeBadge}>
                    <Icon name="starActive" size={16} color={colors.neutral.gray900} />
                    <Text variant="captionBold" color="neutral.gray900">
                      ACTIVA
                    </Text>
                  </View>
                )}
              </View>

              {/* Descripción */}
              {item.description ? (
                <Text
                  variant="bodySmall"
                  color="neutral.gray500"
                  style={{ marginBottom: spacing.md }}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              ) : null}

              {/* Stats con iconos */}
              <View style={styles.routineStats}>
                <View style={styles.statItem}>
                  <Icon name="calendar" size={18} color={colors.primary.main} />
                  <Text variant="bodySmall" color="neutral.gray700" style={styles.statText}>
                    {item.days?.length || 0} días
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Icon name="dumbbell" size={18} color={colors.primary.main} />
                  <Text variant="bodySmall" color="neutral.gray700" style={styles.statText}>
                    {item.days?.reduce((total, day) => total + (day.exercises?.length || 0), 0) || 0} ejercicios
                  </Text>
                </View>
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
    padding: spacing.xl,
    backgroundColor: colors.neutral.gray100,
  },
  listContent: {
    gap: spacing.md,
    padding: spacing.base,
  },

  // Empty state
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary.main + '20', // 20% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  // Routine card header
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  routineName: {
    flex: 1,
  },

  // Badge "Activa" con glow dorado
  activeBadge: {
    backgroundColor: colors.accent.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 2,
    borderRadius: radius.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    // Shadow para iOS
    shadowColor: colors.accent.main,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    // Elevation para Android
    elevation: 4,
  },

  // Stats
  routineStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.neutral.gray300,
  },
});