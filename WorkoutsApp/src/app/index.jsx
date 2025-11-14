import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, FlatList, StyleSheet, View, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getRoutines } from '../api/routineApi';
import { Link } from 'expo-router';
import { colors, spacing, typography, radius, shadows, Icon } from '@/design-systems/tokens';
import { Text, Button, Card, CircularProgress } from '@/design-systems/components';

export default function HomeScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['routines'],
    queryFn: getRoutines
  });

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
        <View style={styles.errorIcon}>
          <Icon name="error" size={48} color={colors.danger.main} />
        </View>
        <Text
          variant="h3"
          color="danger.main"
          align="center"
          style={{ marginTop: spacing.md, marginBottom: spacing.sm }}
        >
          Error al cargar
        </Text>
        <Text
          variant="body"
          color="neutral.gray500"
          align="center"
          style={{ marginBottom: spacing.lg, maxWidth: 280 }}
        >
          {error.message}
        </Text>
        <Button
          variant="secondary"
          size="md"
          icon="refresh"
          onPress={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="overline" color="neutral.gray500">
                MIS RUTINAS
              </Text>
              <Text variant="h1" color="neutral.gray900">
                Workout App
              </Text>
            </View>
          </View>
        </View>

        {/* Empty State */}
        <View style={styles.centerContainer}>
          <View style={styles.emptyIcon}>
            <Icon name="dumbbell" size={64} color={colors.primary.main} />
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
            variant="body"
            color="neutral.gray500"
            align="center"
            style={{ marginBottom: spacing.xl, maxWidth: 300, lineHeight: 24 }}
          >
            Crea tu primera rutina y empieza a alcanzar tus objetivos de entrenamiento
          </Text>

          <Button
            variant="primary"
            size="lg"
            icon="add"
            onPress={() => console.log('Crear rutina')}
          >
            Crear Mi Primera Rutina
          </Button>
        </View>

        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con botón crear */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text variant="overline" color="neutral.gray500">
              MIS RUTINAS
            </Text>
            <Text variant="h1" color="neutral.gray900">
              {data.length} {data.length === 1 ? 'Rutina' : 'Rutinas'}
            </Text>
          </View>
        </View>
      </View>

      {/* Lista de rutinas */}
      <FlatList
        data={data}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Link href={`/routines/${item._id}`} asChild>
            <Pressable>
              <Card shadow="lg" style={styles.routineCard}>
                {/* Header de la card */}
                <View style={styles.routineCardHeader}>
                  {/* Progreso circular */}
                  <CircularProgress
                    percentage={0} // TODO: Calcular progreso real
                    size={56}
                    strokeWidth={5}
                    showPercentage={true}
                  />

                  {/* Info principal */}
                  <View style={styles.routineCardInfo}>
                    <View style={styles.routineCardTitleRow}>
                      <Text variant="h3" color="neutral.gray800" style={styles.routineName}>
                        {item.name}
                      </Text>

                      {item.isActive && (
                        <View style={styles.activeBadge}>
                          <Icon name="starActive" size={14} color={colors.neutral.gray900} />
                          <Text variant="caption" style={styles.activeBadgeText}>
                            ACTIVA
                          </Text>
                        </View>
                      )}
                    </View>

                    {item.description && (
                      <Text
                        variant="bodySmall"
                        color="neutral.gray500"
                        numberOfLines={1}
                        style={{ marginTop: 2 }}
                      >
                        {item.description}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Stats */}
                <View style={styles.routineStats}>
                  <View style={styles.statItem}>
                    <Icon name="calendar" size={16} color={colors.primary.main} />
                    <Text variant="bodySmall" color="neutral.gray700" style={styles.statText}>
                      {item.days?.length || 0} días
                    </Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statItem}>
                    <Icon name="dumbbell" size={16} color={colors.primary.main} />
                    <Text variant="bodySmall" color="neutral.gray700" style={styles.statText}>
                      {item.days?.reduce((total, day) => total + (day.exercises?.length || 0), 0) || 0} ejercicios
                    </Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statItem}>
                    <Icon name="flame" size={16} color={colors.warning.main} />
                    <Text variant="bodySmall" color="neutral.gray700" style={styles.statText}>
                      0/21 sesiones
                    </Text>
                  </View>
                </View>

                {/* Footer con chevron */}
                <View style={styles.routineCardFooter}>
                  <Text variant="bodySmall" color="primary.main" style={{ fontWeight: '600' }}>
                    Ver rutina
                  </Text>
                  <Icon name="chevronRight" size={20} color={colors.primary.main} />
                </View>
              </Card>
            </Pressable>
          </Link>
        )}
      />

      {/* FAB (Floating Action Button) */}
      <Pressable
        style={styles.fab}
        onPress={() => console.log('Crear rutina desde FAB')}
      >
        <Icon name="add" size={28} color={colors.neutral.white} />
      </Pressable>

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
  },

  // Header
  header: {
    backgroundColor: colors.neutral.white,
    paddingTop: spacing.lg,
    paddingBottom: spacing.base,
    paddingHorizontal: spacing.base,
    ...shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Lista
  listContent: {
    gap: spacing.md,
    padding: spacing.base,
    paddingBottom: 100, // Espacio para el FAB
  },

  // Routine Card
  routineCard: {
    padding: spacing.base,
    gap: spacing.md,
  },
  routineCardHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  routineCardInfo: {
    flex: 1,
  },
  routineCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  routineName: {
    flex: 1,
  },

  // Badge activa
  activeBadge: {
    backgroundColor: colors.accent.main,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: colors.accent.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  activeBadgeText: {
    color: colors.neutral.gray900,
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.5,
  },

  // Stats
  routineStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statText: {
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.neutral.gray300,
  },

  // Footer
  routineCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },

  // Empty state
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  // Error state
  errorIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.danger.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // FAB (Floating Action Button)
  fab: {
    position: 'absolute',
    right: spacing.base,
    bottom: spacing.base,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xl,
    elevation: 8,
  },
});