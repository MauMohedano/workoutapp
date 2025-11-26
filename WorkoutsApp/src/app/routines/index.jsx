import { View, StyleSheet, ScrollView, ActivityIndicator, Pressable, Alert, Switch } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoutines, activateRoutine } from '../../api/routineApi';
import { colors, spacing, radius, shadows, Icon } from '@/design-systems/tokens';
import { Text, Button, Card, CircularProgress } from '@/design-systems/components';
import { Link } from 'expo-router';

export default function RoutinesListScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { deviceId } = useLocalSearchParams();

    const { data: routines, isLoading, error } = useQuery({
        queryKey: ['routines', deviceId],
        queryFn: () => getRoutines(deviceId),
        enabled: !!deviceId,
    });

    // Mutation para activar rutina
    const activateMutation = useMutation({
        mutationFn: activateRoutine,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routines'], exact: false });
            Alert.alert('✅ Rutina activada', 'Ya puedes comenzar a entrenar');
        },
        onError: (error) => {
            Alert.alert('Error', 'No se pudo activar la rutina');
            console.error('Error activating routine:', error);
        },
    });

    const handleToggleRoutine = (routine) => {
        if (routine.isActive) {
            // No permitir desactivar (solo puede haber una activa a la vez)
            return;
        }

        // Activar sin confirmación
        activateMutation.mutate(routine._id);
    };


    // Loading state
    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary.main} />
                <Text variant="bodyMedium" color="neutral.gray500" style={{ marginTop: spacing.md }}>
                    Cargando rutinas...
                </Text>
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Icon name="error" size={48} color={colors.danger.main} />
                <Text variant="h3" color="danger.main" style={{ marginTop: spacing.md }}>
                    Error al cargar
                </Text>
                <Text variant="body" color="neutral.gray500" align="center" style={{ marginTop: spacing.sm }}>
                    {error.message}
                </Text>
            </View>
        );
    }

    // Separar rutina activa de las demás
    const activeRoutine = routines?.find(r => r.isActive);
    const inactiveRoutines = routines?.filter(r => !r.isActive) || [];

    // Empty state
    if (!routines || routines.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.emptyIcon}>
                    <Icon name="dumbbell" size={64} color={colors.primary.main} />
                </View>
                <Text variant="h2" color="neutral.gray900" style={{ marginTop: spacing.lg }}>
                    Sin rutinas aún
                </Text>
                <Text variant="body" color="neutral.gray500" align="center" style={{ marginTop: spacing.sm, maxWidth: 280 }}>
                    Crea tu primera rutina para comenzar a entrenar
                </Text>
                <Button
                    variant="primary"
                    size="lg"
                    icon="add"
                    onPress={() => router.push('/create-routine')}
                    style={{ marginTop: spacing.xl }}
                >
                    Crear Rutina
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Mis Rutinas',
                    headerBackTitle: 'Atrás',
                }}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text variant="h1" color="neutral.gray900">
                        Mis Rutinas
                    </Text>
                    <Text variant="body" color="neutral.gray500">
                        {routines.length} {routines.length === 1 ? 'rutina' : 'rutinas'} creadas
                    </Text>
                </View>

                {/* Rutina Activa (destacada) */}
                {activeRoutine ? (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="starActive" size={20} color={colors.accent.main} />
                            <Text variant="bodyLarge" color="neutral.gray800" bold>
                                Rutina Activa
                            </Text>
                        </View>

                        <Link href={`/routines/${activeRoutine._id}`} asChild>
                            <Pressable>
                                <Card shadow="xl" style={styles.activeRoutineCard}>
                                    <View style={styles.activeRoutineHeader}>
                                        <CircularProgress
                                            percentage={Math.round(
                                                ((activeRoutine.progress?.completedSessions?.length || 0) /
                                                    activeRoutine.totalSessions) *
                                                100
                                            )}
                                            size={72}
                                            strokeWidth={6}
                                            showPercentage={true}
                                        />
                                        <View style={styles.activeRoutineInfo}>
                                            <View style={styles.activeBadge}>
                                                <Icon name="flame" size={14} color={colors.accent.main} />
                                                <Text variant="caption" style={styles.activeBadgeText}>
                                                    EN PROGRESO
                                                </Text>
                                            </View>
                                            <Text variant="h2" color="neutral.gray900" style={{ marginTop: spacing.xs }}>
                                                {activeRoutine.name}
                                            </Text>
                                            {activeRoutine.description && (
                                                <Text variant="bodySmall" color="neutral.gray500" numberOfLines={2} style={{ marginTop: spacing.xs - 2 }}>
                                                    {activeRoutine.description}
                                                </Text>
                                            )}
                                        </View>
                                    </View>

                                    {/* Stats */}
                                    <View style={styles.activeRoutineStats}>
                                        <View style={styles.activeStatItem}>
                                            <Icon name="calendar" size={16} color={colors.primary.main} />
                                            <Text variant="bodySmall" color="neutral.gray700" bold>
                                                {activeRoutine.days?.length || 0} días
                                            </Text>
                                        </View>
                                        <View style={styles.statDivider} />
                                        <View style={styles.activeStatItem}>
                                            <Icon name="dumbbell" size={16} color={colors.primary.main} />
                                            <Text variant="bodySmall" color="neutral.gray700" bold>
                                                {activeRoutine.days?.reduce((total, day) => total + (day.exercises?.length || 0), 0) || 0} ejercicios
                                            </Text>
                                        </View>
                                        <View style={styles.statDivider} />
                                        <View style={styles.activeStatItem}>
                                            <Icon name="flame" size={16} color={colors.warning.main} />
                                            <Text variant="bodySmall" color="neutral.gray700" bold>
                                                {activeRoutine.progress?.completedSessions?.length || 0}/{activeRoutine.totalSessions}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Action */}
                                    <View style={styles.activeRoutineFooter}>
                                        <Text variant="bodySmall" color="primary.main" bold>
                                            Continuar entrenamiento
                                        </Text>
                                        <Icon name="arrow-forward" size={20} color={colors.primary.main} />
                                    </View>
                                </Card>
                            </Pressable>
                        </Link>
                    </View>
                ) : (
                    // No hay rutina activa
                    <Card style={styles.noActiveCard}>
                        <Icon name="starOutline" size={32} color={colors.neutral.gray400} />
                        <Text variant="body" color="neutral.gray600" align="center" style={{ marginTop: spacing.sm }}>
                            No tienes ninguna rutina activa
                        </Text>
                        <Text variant="bodySmall" color="neutral.gray500" align="center" style={{ marginTop: spacing.xs }}>
                            Activa una rutina para comenzar a entrenar
                        </Text>
                    </Card>
                )}

                {/* Otras Rutinas */}
                {inactiveRoutines.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="list" size={20} color={colors.neutral.gray600} />
                            <Text variant="bodyLarge" color="neutral.gray800" bold>
                                Todas las Rutinas
                            </Text>
                        </View>

                        <View style={styles.routinesList}>
                            {inactiveRoutines.map((routine) => (
                                <Link key={routine._id} href={`/routines/${routine._id}`} asChild>
                                    <Pressable>
                                        <Card shadow="md" style={styles.routineCard}>
                                            <View style={styles.routineCardHeader}>
                                                <CircularProgress
                                                    percentage={Math.round(
                                                        ((routine.progress?.completedSessions?.length || 0) /
                                                            routine.totalSessions) *
                                                        100
                                                    )}
                                                    size={56}
                                                    strokeWidth={5}
                                                    showPercentage={true}
                                                />
                                                <View style={styles.routineCardInfo}>
                                                    {/* Nombre y Switch en la misma línea */}
                                                    <View style={styles.routineTitleRow}>
                                                        <Text variant="h3" color="neutral.gray800" style={{ flex: 1 }}>
                                                            {routine.name}
                                                        </Text>
                                                        <Switch
                                                            value={routine.isActive}
                                                            onValueChange={() => handleToggleRoutine(routine)}
                                                            disabled={activateMutation.isPending}
                                                            trackColor={{
                                                                false: colors.neutral.gray300,
                                                                true: colors.primary.main + '40'
                                                            }}
                                                            thumbColor={routine.isActive ? colors.primary.main : colors.neutral.gray50}
                                                            ios_backgroundColor={colors.neutral.gray300}
                                                        />
                                                    </View>

                                                    {routine.description && (
                                                        <Text variant="bodySmall" color="neutral.gray500" numberOfLines={1} style={{ marginTop: 2 }}>
                                                            {routine.description}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>

                                            <View style={styles.routineStats}>
                                                <View style={styles.statItem}>
                                                    <Icon name="calendar" size={16} color={colors.primary.main} />
                                                    <Text variant="bodySmall" color="neutral.gray700">
                                                        {routine.days?.length || 0} días
                                                    </Text>
                                                </View>
                                                <View style={styles.statDivider} />
                                                <View style={styles.statItem}>
                                                    <Icon name="dumbbell" size={16} color={colors.primary.main} />
                                                    <Text variant="bodySmall" color="neutral.gray700">
                                                        {routine.days?.reduce((total, day) => total + (day.exercises?.length || 0), 0) || 0} ejercicios
                                                    </Text>
                                                </View>
                                                <View style={styles.statDivider} />
                                                <View style={styles.statItem}>
                                                    <Icon name="flame" size={16} color={colors.warning.main} />
                                                    <Text variant="bodySmall" color="neutral.gray700">
                                                        {routine.progress?.completedSessions?.length || 0}/{routine.totalSessions}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.routineCardFooter}>
                                                <Text variant="bodySmall" color="primary.main" bold>
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
            </ScrollView>

            {/* FAB - Crear nueva rutina */}
            <Pressable
                style={styles.fab}
                onPress={() => router.push('/create-routine')}
            >
                <Icon name="add" size={28} color={colors.neutral.white} />
            </Pressable>
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
    emptyIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.primary.main + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },

    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.base,
        paddingBottom: 100,
    },

    // Header
    header: {
        marginBottom: spacing.lg,
    },

    // Sections
    section: {
        marginBottom: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },

    // Active Routine Card
    activeRoutineCard: {
        padding: spacing.lg,
        backgroundColor: colors.accent.main + '08',
        borderWidth: 2,
        borderColor: colors.accent.main + '30',
    },
    routineTitleRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm,
},
    activeRoutineHeader: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    activeRoutineInfo: {
        flex: 1,
    },
    activeBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.accent.main,
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: radius.base,
    },
    activeBadgeText: {
        color: colors.neutral.gray900,
        fontWeight: '700',
        fontSize: 10,
        letterSpacing: 0.5,
    },
    activeRoutineStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.neutral.gray200,
    },
    activeStatItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    activeRoutineFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingTop: spacing.sm,
    },

    // No Active Card
    noActiveCard: {
        padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.lg,
    },

    // Routines List
    routinesList: {
        gap: spacing.md,
    },
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
    routineStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.neutral.gray200,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
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