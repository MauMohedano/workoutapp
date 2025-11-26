import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, FlatList, StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getRoutines } from '../api/routineApi';
import { Link } from 'expo-router';
import { colors, spacing, typography, radius, shadows, Icon } from '@/design-systems/tokens';
import { Text, Button, Card, CircularProgress } from '@/design-systems/components';
import { getDeviceId } from "../utils/deviceId";
import { useSessionProgress } from '../hooks/useSessionProgress';
import { useWorkoutStats } from '../hooks/useWorkoutStats';
import StatsHighlight from '../components/stats/StatsHighlight';

export default function HomeScreen() {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState(null);
  const [isRoutinesExpanded, setIsRoutinesExpanded] = useState(false);


  useEffect(() => {
    const loadDeviceId = async () => {
      const id = await getDeviceId();
      setDeviceId(id);
    };
    loadDeviceId();
  }, []);


  const { data, isLoading, error } = useQuery({
    queryKey: ['routines', deviceId],
    queryFn: () => getRoutines(deviceId),
    enabled: !!deviceId
  });

  // Obtener rutina activa
  const activeRoutine = data?.find(routine => routine.isActive);

  // Progreso de la rutina activa
  const {
    currentSession,
    completedSessions,
    progress: sessionProgress,
    isLoading: isLoadingProgress,
  } = useSessionProgress(activeRoutine?._id);

  const { data: statsData, isLoading: isLoadingStats } = useWorkoutStats(deviceId);


  // ===== LOADING STATE =====
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

  // ===== ERROR STATE =====
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

  // ===== VISTA PRINCIPAL =====
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== SECCIÓN 1: HEADER USUARIO ===== */}
        <View style={styles.headerSection}>
          <View style={styles.greetingSection}>
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" size={24} color={colors.primary.main} />
            </View>
            <View style={styles.greetingText}>
              <Text variant="overline" color="neutral.gray500">
                BIENVENIDO
              </Text>
              <Text variant="h2" color="neutral.gray900">
                {data && data.length > 0 ? '¡Listo para entrenar!' : '¡Comencemos!'}
              </Text>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text variant="h2" color="primary.main">
                {data?.length || 0}
              </Text>
              <Text variant="caption" color="neutral.gray500">
                {data?.length === 1 ? 'Rutina' : 'Rutinas'}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text variant="h2" color="primary.main">
                {data?.reduce((sum, r) => sum + (r.progress?.completedSessions?.length || 0), 0) || 0}
              </Text>
              <Text variant="caption" color="neutral.gray500">
                Completadas
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text variant="h2" color="primary.main">
                {Math.ceil((data?.reduce((sum, r) => sum + (r.progress?.completedSessions?.length || 0), 0) || 0) / 3) || 0}
              </Text>
              <Text variant="caption" color="neutral.gray500">
                Semanas
              </Text>
            </View>
          </View>
        </View>

        {/* ===== SECCIÓN 2: RUTINA ACTIVA ===== */}
        {data && data.length > 0 && (
          <View style={styles.section}>
            {/* Si hay rutina activa, mostrar card */}
            {activeRoutine ? (
              <>
                <View style={styles.sectionHeader}>
                  <Icon name="flame" size={20} color={colors.primary.main} />
                  <Text variant="bodyLarge" color="neutral.gray800" style={{ fontWeight: '600' }}>
                    Rutina Activa
                  </Text>
                </View>

                <Pressable onPress={() => router.push(`/routines/${activeRoutine._id}`)}>
                  <View style={styles.activeRoutineCard}>
                    {/* Header */}
                    <View style={styles.activeRoutineHeader}>
                      <Icon name="dumbbell" size={28} color={colors.neutral.white} />
                      <View style={styles.activeRoutineInfo}>
                        <Text variant="h2" style={styles.activeRoutineTitle}>
                          {activeRoutine.name}
                        </Text>
                        <Text variant="bodySmall" style={styles.activeRoutineMeta}>
                          Sesión {currentSession} de {activeRoutine.totalSessions}
                        </Text>
                      </View>
                    </View>

                    {/* Progreso */}
                    <View style={styles.activeRoutineProgress}>
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${Math.round((currentSession / activeRoutine.totalSessions) * 100)}%` }
                          ]}
                        />
                      </View>
                      <Text variant="caption" style={styles.progressText}>
                        {completedSessions?.length || 0} completadas • {activeRoutine.totalSessions - currentSession + 1} restantes
                      </Text>
                    </View>

                    {/* Botón */}
                    <Button
                      variant="secondary"
                      size="lg"
                      fullWidth
                      icon="play-circle"
                      onPress={() => router.push(`/routines/${activeRoutine._id}`)}
                    >
                      Iniciar Sesión {currentSession}
                    </Button>
                  </View>
                </Pressable>
              </>
            ) : (
              /* Si NO hay rutina activa, mostrar placeholder */
              <>
                <View style={styles.sectionHeader}>
                  <Icon name="flame" size={20} color={colors.neutral.gray600} />
                  <Text variant="bodyLarge" color="neutral.gray800" style={{ fontWeight: '600' }}>
                    Rutina Activa
                  </Text>
                </View>

                <Card style={styles.placeholderCard}>
                  <Icon name="starActive" size={32} color={colors.neutral.gray300} />
                  <Text variant="body" color="neutral.gray500" style={{ marginTop: spacing.sm }}>
                    Activa una rutina para comenzar a entrenar
                  </Text>
                </Card>
              </>
            )}

            {/* Link a todas las rutinas - SIEMPRE visible si hay rutinas */}
            <Pressable
              style={styles.viewAllLink}
              onPress={() => router.push(`/routines?deviceId=${deviceId}`)}
            >
              <Text variant="bodySmall" color="primary.main" style={{ fontWeight: '600' }}>
                Ver todas mis rutinas
              </Text>
              <Icon name="chevron-right" size={16} color={colors.primary.main} />
            </Pressable>
          </View>
        )}


        {/* ===== SECCIÓN 3: MIS RUTINAS ===== */}
        {isRoutinesExpanded && data && data.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="dumbbell" size={20} color={colors.neutral.gray600} />
              <Text variant="bodyLarge" color="neutral.gray800" style={{ fontWeight: '600' }}>
                Mis Rutinas
              </Text>
            </View>

            {/* Lista de rutinas */}
            <View style={styles.routinesList}>
              {data.map((item) => (
                <Link key={item._id} href={`/routines/${item._id}`} asChild>
                  <Pressable>
                    <Card shadow="lg" style={styles.routineCard}>
                      <View style={styles.routineCardHeader}>
                        <CircularProgress
                          percentage={Math.round(((item.progress?.completedSessions?.length || 0) / item.totalSessions) * 100)}
                          size={56}
                          strokeWidth={5}
                          showPercentage={true}
                        />
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
                            <Text variant="bodySmall" color="neutral.gray500" numberOfLines={1} style={{ marginTop: 2 }}>
                              {item.description}
                            </Text>
                          )}
                        </View>
                      </View>

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
                            {item.progress?.completedSessions?.length || 0}/{item.totalSessions}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.routineCardFooter}>
                        <Text variant="bodySmall" color="primary.main" style={{ fontWeight: '600' }}>
                          Ver rutina
                        </Text>
                        <Icon name="chevron-right" size={20} color={colors.primary.main} />
                      </View>
                    </Card>
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>
        )}

        {/* ===== SECCIÓN 3.5: ESTADÍSTICAS ===== */}
        {data && data.length > 0 && statsData && (
          <View style={styles.section}>
            <StatsHighlight stats={statsData} deviceId={deviceId} />
          </View>
        )}


        {/* ===== SECCIÓN 4: MEDICIONES (Placeholder) ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="trophy" size={20} color={colors.neutral.gray600} />
            <Text variant="bodyLarge" color="neutral.gray800" style={{ fontWeight: '600' }}>
              Mis Mediciones
            </Text>
          </View>

          <Card style={styles.placeholderCard}>
            <Icon name="target" size={32} color={colors.neutral.gray300} />
            <Text variant="body" color="neutral.gray500" style={{ marginTop: spacing.sm }}>
              Próximamente: Trackea tus mediciones corporales
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* FAB */}

      <Pressable
        style={styles.fab}
        onPress={() => router.push('/create-routine')}
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

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Espacio para el FAB
  },

  // Header Section
  headerSection: {
    backgroundColor: colors.neutral.white,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.base,
    gap: spacing.lg,
    ...shadows.sm,
  },

  // Greeting
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary.main + '30',
  },
  greetingText: {
    flex: 1,
    gap: 2,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.neutral.gray50,
    padding: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    gap: spacing.xs - 2,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },

  // Sections
  section: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },

  // Active Routine Card
  activeRoutineCard: {
    backgroundColor: colors.primary.main,
    padding: spacing.lg,
    borderRadius: radius.xl,
    gap: spacing.md,
    ...shadows.xl,
  },
  activeRoutineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  activeRoutineInfo: {
    flex: 1,
  },
  activeRoutineTitle: {
    color: colors.neutral.white,
    marginBottom: spacing.xs - 2,
  },
  activeRoutineMeta: {
    color: colors.neutral.white,
    opacity: 0.9,
  },

  // Progress
  activeRoutineProgress: {
    gap: spacing.xs,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.neutral.white + '30',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.neutral.white,
    borderRadius: radius.full,
  },
  progressText: {
    color: colors.neutral.white,
    opacity: 0.9,
    textAlign: 'center',
  },

  // View all link
  viewAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs - 2,
    paddingVertical: spacing.sm,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  // Routines List
  routinesList: {
    gap: spacing.md,
  },
  collapsedState: {
    backgroundColor: colors.neutral.gray50,
    padding: spacing.md,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
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

  // Routine Stats
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

  // Placeholder Card
  placeholderCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },

  // Error state
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.danger.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // FAB
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