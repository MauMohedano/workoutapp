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
import { useLatestMeasurement } from '../hooks/useMeasurements';
import { getCurrentDayName, getUpcomingSessions, getCompletedSessionsCount, getRemainingSessionsCount } from '@/utils/routineHelpers';

export default function HomeScreen() {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState(null);
  const [isRoutinesExpanded, setIsRoutinesExpanded] = useState(false);
  const { data: latestMeasurementResponse } = useLatestMeasurement(deviceId);
  const latestMeasurement = latestMeasurementResponse?.data;

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
              <Text variant="caption" color="neutral.gray500" align="center" numberOfLines={1}>
                Rutinas
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text variant="h2" color="primary.main">
                {data?.reduce((sum, r) => sum + (r.progress?.completedSessions?.length || 0), 0) || 0}
              </Text>
              <Text variant="caption" color="neutral.gray500" align="center" numberOfLines={2}>
                Sesiones{'\n'}completadas
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text variant="h2" color="primary.main">
                {Math.ceil((data?.reduce((sum, r) => sum + (r.progress?.completedSessions?.length || 0), 0) || 0) / 3) || 0}
              </Text>
              <Text variant="caption" color="neutral.gray500" align="center" numberOfLines={2}>
                Semanas{'\n'}completadas
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
                      Ir a sesión: <Text style={{ fontWeight: 'bold', color: colors.primary.main }}>{getCurrentDayName(activeRoutine)}</Text>
                    </Button>


                    {/* Próximas Sesiones */}
                    {getUpcomingSessions(activeRoutine).length > 0 && (
                      <View style={styles.upcomingSessions}>
                        <View style={styles.upcomingDivider} />
                        <Text variant="caption" style={styles.upcomingTitle}>
                          Próximas:
                        </Text>
                        {getUpcomingSessions(activeRoutine).map((session, index) => (
                          <Pressable
                            key={index}
                            style={styles.upcomingSessionCard}
                            onPress={() => router.push(`/routines/session-preview?routineId=${activeRoutine._id}&sessionNumber=${session.sessionNumber}&deviceId=${deviceId}`)}
                          >
                            <View style={styles.upcomingCardContent}>
                              <View style={styles.upcomingCardHeader}>
                                <Icon name="dumbbell" size={18} color={`${colors.neutral.white}90`} />
                                <Text variant="bodySmall" style={styles.upcomingCardTitle}>
                                  Sesión {session.sessionNumber} · {session.dayName}
                                </Text>
                                <Icon name="chevron-right" size={18} color={`${colors.neutral.white}60`} style={{ marginLeft: 'auto' }} />
                              </View>
                              <View style={styles.upcomingCardDetails}>
                                <View style={styles.upcomingCardDetailItem}>
                                  <Icon name="list" size={14} color={`${colors.neutral.white}70`} />
                                  <Text variant="caption" style={styles.upcomingCardDetailText}>
                                    {session.exerciseCount} ejercicios
                                  </Text>
                                </View>
                                <View style={styles.upcomingCardDetailItem}>
                                  <Icon name="time" size={14} color={`${colors.neutral.white}70`} />
                                  <Text variant="caption" style={styles.upcomingCardDetailText}>
                                    ~{session.exerciseCount * 8} min
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </Pressable>
                        ))}
                      </View>
                    )}

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
  style={styles.seeAllButton}
  onPress={() => router.push(`/routines?deviceId=${deviceId}`)}
>
              <Text variant="bodyMedium" color="primary.main" style={{ fontWeight: '600' }}>
                Ver todas mis rutinas
              </Text>
              <Icon name="chevron-right" size={20} color={colors.primary.main} />
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


        {/* ===== SECCIÓN 4: MEDICIONES ===== */}
        <Pressable onPress={() => router.push(`/measurements?deviceId=${deviceId}`)}>
          <Card shadow="md" style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <View style={styles.infoCardTitleRow}>
                <Icon name="ruler" size={24} color={colors.primary.main} />
                <Text variant="bodyLarge" color="neutral.gray800" bold>
                  Mediciones
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.neutral.gray400} />
            </View>

            {latestMeasurement ? (
              <View style={styles.measurementsContent}>
                {/* Peso */}
                {latestMeasurement.weight && (
                  <View style={styles.measurementMainStat}>
                    <Text variant="h2" color="neutral.gray900">
                      {latestMeasurement.weight}
                    </Text>
                    <Text variant="bodyMedium" color="neutral.gray600" style={{ marginLeft: 4 }}>
                      kg
                    </Text>
                  </View>
                )}

                {/* Circunferencias destacadas */}
                {latestMeasurement.circumferences && (
                  <View style={styles.measurementsGrid}>
                    {latestMeasurement.circumferences.chest && (
                      <View style={styles.measurementItem}>
                        <Text variant="caption" color="neutral.gray500">
                          Pecho
                        </Text>
                        <Text variant="bodyMedium" color="neutral.gray800" bold>
                          {latestMeasurement.circumferences.chest} cm
                        </Text>
                      </View>
                    )}
                    {latestMeasurement.circumferences.waist && (
                      <View style={styles.measurementItem}>
                        <Text variant="caption" color="neutral.gray500">
                          Cintura
                        </Text>
                        <Text variant="bodyMedium" color="neutral.gray800" bold>
                          {latestMeasurement.circumferences.waist} cm
                        </Text>
                      </View>
                    )}
                    {latestMeasurement.circumferences.leftArm && (
                      <View style={styles.measurementItem}>
                        <Text variant="caption" color="neutral.gray500">
                          Brazo
                        </Text>
                        <Text variant="bodyMedium" color="neutral.gray800" bold>
                          {latestMeasurement.circumferences.leftArm} cm
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.measurementsFooter}>
                  <Text variant="caption" color="neutral.gray500">
                    Última actualización:{' '}
                    {new Date(latestMeasurement.date).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.measurementsEmpty}>
                <Text variant="body" color="neutral.gray500" align="center">
                  No has registrado mediciones aún
                </Text>
                <Text variant="bodySmall" color="primary.main" bold style={{ marginTop: spacing.xs }}>
                  Toca para agregar tu primera medición
                </Text>
              </View>
            )}
          </Card>
        </Pressable>
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
  // ===== CONTENEDORES PRINCIPALES =====
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray100,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },

  seeAllButton: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.xs,
  paddingVertical: spacing.sm,
},

  // ===== SECCIÓN 1: HEADER USUARIO =====
  headerSection: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingText: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    padding: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    ...shadows.sm,
    minHeight: 80,
    justifyContent: 'center',
  },

  // ===== ESTRUCTURA DE SECCIONES (Compartido) =====
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },

  // ===== SECCIÓN 2: RUTINA ACTIVA =====
  activeRoutineCard: {
    backgroundColor: colors.primary.main,
    padding: spacing.lg,
    borderRadius: radius.xl,
    gap: spacing.md,
    ...shadows.lg,
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
    fontWeight: '700',
  },
  activeRoutineMeta: {
    color: colors.neutral.white + 'CC',
    marginTop: spacing.xs - 2,
  },
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
    color: colors.neutral.white + 'CC',
  },

  // Próximas sesiones
  upcomingSessions: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  upcomingDivider: {
    height: 1,
    backgroundColor: `${colors.neutral.white}20`,
    marginBottom: spacing.sm,
  },
  upcomingTitle: {
    color: `${colors.neutral.white}80`,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  upcomingSessionCard: {
    backgroundColor: `${colors.neutral.white}15`,
    borderRadius: radius.lg,
    marginBottom: spacing.xs,
    overflow: 'hidden',
    borderColor: `${colors.neutral.white}20`
  },
  upcomingCardContent: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  upcomingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  upcomingCardTitle: {
    color: `${colors.neutral.white}95`,
    fontWeight: '600',
    flex: 1,
  },
  upcomingCardDetails: {
    flexDirection: 'row',
    gap: spacing.md,
    marginLeft: spacing.lg + spacing.xs, // Alineado con el título
  },
  upcomingCardDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  upcomingCardDetailText: {
    color: `${colors.neutral.white}70`,
  },

  // ===== SECCIÓN 3: MIS RUTINAS =====
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
  routineCard: {
    padding: spacing.lg,
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
  routineCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },

  // ===== CARDS DE INFORMACIÓN (Estadísticas y Mediciones) =====
  // Estilos compartidos para ambos cards
  infoCard: {
    padding: spacing.lg,
  },
  infoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  // ===== SECCIÓN 4: ESTADÍSTICAS =====
  statsContent: {
    gap: spacing.md,
  },
  statsGrid: {
    gap: spacing.md,
  },
  statHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.neutral.gray50,
    borderRadius: radius.base,
  },
  statHighlightInfo: {
    flex: 1,
  },

  // ===== SECCIÓN 5: MEDICIONES =====
  measurementsContent: {
    gap: spacing.sm,
  },
  measurementMainStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  measurementsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  measurementItem: {
    flex: 1,
    gap: 2,
  },
  measurementsFooter: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  measurementsEmpty: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },

  // ===== ESTADOS ESPECIALES =====
  placeholderCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
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
  errorIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.danger.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ===== FAB =====
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
