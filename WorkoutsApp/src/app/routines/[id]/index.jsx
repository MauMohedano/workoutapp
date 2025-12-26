import { View, StyleSheet, ScrollView, Pressable, Animated, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDeviceId } from '../../../utils/deviceId';
import { useEffect } from 'react';
import { getRoutineById, deleteRoutine } from '../../../api/routineApi';
import { getWorkoutProgress } from '../../../api/workoutApi';
import { skipSession } from '../../../api/sessionProgressApi'
import { colors, spacing, radius, Icon } from '@/design-systems/tokens';
import { Text, Card, Button } from '@/design-systems/components';
import { ActivityIndicator } from 'react-native';
import { useState, useRef } from 'react';
import { getDayForSession, getSessionProgress, getProgressColor } from '@/utils/sessionHelpers';
import SessionCard from '../../../components/routines/SessionCard';

export default function RoutineDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // Estados
    const [deviceId, setDeviceId] = useState(null);
    const [routine, setRoutine] = useState(null);
    const [routineLoading, setRoutineLoading] = useState(true);
    const [expandedSessions, setExpandedSessions] = useState({});
    const expandedAnimations = useRef({}).current;

    // Cargar routine con deviceId de forma manual
    useEffect(() => {
        const loadRoutineWithProgress = async () => {
            try {
                setRoutineLoading(true);

                // 1. Obtener deviceId
                const deviceIdValue = await getDeviceId();
                setDeviceId(deviceIdValue);

                // 2. Llamar API CON deviceId
                const routineData = await getRoutineById(id, deviceIdValue);
                setRoutine(routineData);

            } catch (error) {
                console.error('❌ Error cargando routine:', error);
            } finally {
                setRoutineLoading(false);
            }
        };

        if (id) {
            loadRoutineWithProgress();
        }
    }, [id]);

    // Fetch workout progress
    const { data: workoutProgress } = useQuery({
        queryKey: ['workoutProgress', id],
        queryFn: () => getWorkoutProgress(id),
        enabled: !!id,
    });

    // Toggle sesión
    const toggleSession = (sessionNum) => {
        const key = `session-${sessionNum}`;
        const isCurrentlyExpanded = expandedSessions[key];

        // Inicializar animación si no existe
        if (!expandedAnimations[key]) {
            expandedAnimations[key] = new Animated.Value(isCurrentlyExpanded ? 1 : 0);
        }

        // Animar
        Animated.timing(expandedAnimations[key], {
            toValue: isCurrentlyExpanded ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();

        // Toggle estado
        setExpandedSessions(prev => ({
            ...prev,
            [key]: !isCurrentlyExpanded
        }));
    };

    // Handle delete
    const handleDelete = async () => {
        try {
            await deleteRoutine(id);
            router.back();
        } catch (error) {
            console.error('Error deleting routine:', error);
        }
    };
    // Handle skip session
    const handleSkipSession = async () => {
        try {
            if (!deviceId) {
                console.error('❌ No deviceId disponible');
                return;
            }

            
            Alert.alert(
                'Saltar Sesión',
                `¿Estás seguro de saltar la sesión ${currentSession}?\n\nEsta sesión se marcará como omitida.`,
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel'
                    },
                    {
                        text: 'Saltar',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                

                                await skipSession(deviceId, routine._id, currentSession);

                                

                                // Recargar la rutina para actualizar el progreso
                                const updatedRoutine = await getRoutineById(id, deviceId);
                                setRoutine(updatedRoutine);

                            } catch (error) {
                                console.error('❌ Error al saltar sesión:', error);
                                Alert.alert('Error', 'No se pudo saltar la sesión. Intenta de nuevo.');
                            }
                        }
                    }
                ]
            );

        } catch (error) {
            console.error('❌ Error al saltar sesión:', error);
        }
    };

    if (routineLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    if (!routine) {
        return (
            <View style={styles.centerContainer}>
                <Text variant="body" color="neutral.gray500">
                    Rutina no encontrada
                </Text>
            </View>
        );
    }

    const currentSession = routine.progress?.currentSession || 1;
    const sessions = Array.from({ length: routine.totalSessions }, (_, i) => i + 1);

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: routine.name,
                    headerRight: () => (
                        <Pressable onPress={handleDelete}>
                            <Icon name="trash" size={20} color={colors.error.main} />
                        </Pressable>
                    ),
                }}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Card */}
                <Card shadow="lg" style={styles.headerCard}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerInfo}>
                            <Text variant="h2" color="neutral.gray800">
                                {routine.name}
                            </Text>
                            <View style={styles.metaRow}>
                                <View style={styles.metaItem}>
                                    <Icon name="calendar" size={16} color={colors.neutral.gray500} />
                                    <Text variant="caption" color="neutral.gray600">
                                        {routine.days?.length || 0} días/semana
                                    </Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Icon name="repeat" size={16} color={colors.neutral.gray500} />
                                    <Text variant="caption" color="neutral.gray600">
                                        {routine.totalSessions} sesiones
                                    </Text>
                                </View>
                            </View>

                            {/* Descripción */}
                            {routine.description && (
                                <Text variant="bodySmall" color="neutral.gray600" style={{ marginTop: spacing.sm }}>
                                    {routine.description}
                                </Text>
                            )}
                        </View>

                        {/* Badge de activa */}
                        {routine.isActive && (
                            <View style={styles.activeBadge}>
                                <Icon name="checkmark-circle" size={16} color={colors.success.main} />
                                <Text variant="caption" color="success.main" bold>
                                    Activa
                                </Text>
                            </View>
                        )}
                    </View>
                </Card>

                {/* Progreso General */}
                <Card shadow="sm" style={styles.progressCard}>
                    <View style={styles.progressHeader}>
                        <Icon name="analytics" size={20} color={colors.primary.main} />
                        <Text variant="bodyLarge" color="neutral.gray800" bold>
                            Progreso General
                        </Text>
                    </View>

                    <View style={styles.progressStats}>
                        <View style={styles.progressStat}>
                            <Text variant="h2" color="primary.main">
                                {currentSession}
                            </Text>
                            <Text variant="caption" color="neutral.gray600">
                                Sesión actual
                            </Text>
                        </View>

                        <View style={styles.progressDivider} />

                        <View style={styles.progressStat}>
                            <Text variant="h2" color="success.main">
                                {routine.progress?.completedSessions?.length || 0}
                            </Text>
                            <Text variant="caption" color="neutral.gray600">
                                Completadas
                            </Text>
                        </View>

                        <View style={styles.progressDivider} />

                        <View style={styles.progressStat}>
                            <Text variant="h2" color="neutral.gray800">
                                {Math.round(((routine.progress?.completedSessions?.length || 0) / routine.totalSessions) * 100)}%
                            </Text>
                            <Text variant="caption" color="neutral.gray600">
                                Progreso
                            </Text>
                        </View>
                    </View>

                    {/* Barra de progreso */}
                    <View style={styles.progressBarContainer}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: `${Math.round(((routine.progress?.completedSessions?.length || 0) / routine.totalSessions) * 100)}%`
                                }
                            ]}
                        />
                    </View>
                </Card>

                {/* Botones de acción */}
                <View style={styles.actionButtons}>
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        icon="play-circle"
                        onPress={() => {
                            const day = getDayForSession(currentSession, routine.days);
                            if (day) {
                                router.push({
                                    pathname: '/workout',
                                    params: {
                                        routineId: routine._id,
                                        sessionNumber: currentSession,
                                        dayId: day._id,
                                        dayName: day.name,
                                        totalExercises: day.exercises.length,
                                        exerciseIndex: workoutProgress?.exerciseIndex || 0,
                                        isReadOnly: 'false'
                                    }
                                });
                            }
                        }}
                    >
                        Iniciar Sesión {currentSession}
                    </Button>

                    {currentSession < routine.totalSessions && (
                        <Button
                            variant="ghost"
                            size="md"
                            fullWidth
                            icon="play-skip-forward"
                            onPress={handleSkipSession}
                        >
                            Saltar Sesión
                        </Button>
                    )}
                </View>

                {/* Programa Completo - Solo Sesión Actual */}
                <View style={styles.programSection}>
                    <Text variant="h2" color="neutral.gray800" style={styles.sectionTitle}>
                        Sesión Actual
                    </Text>

                    {(() => {
                        const currentSessionNum = routine.progress?.currentSession || 1;
                        const day = getDayForSession(currentSessionNum, routine.days);

                        if (!day) return null;

                        const sessionProgress = getSessionProgress(
                            currentSessionNum,
                            currentSessionNum,
                            workoutProgress,
                            day
                        );

                        return (
                            <SessionCard
                                key={currentSessionNum}
                                sessionNum={currentSessionNum}
                                day={day}
                                currentSession={currentSessionNum}
                                workoutProgress={workoutProgress}
                                completedSessions={routine.progress?.completedSessions || []}
                                isExpanded={true}  // Siempre expandida
                                onToggle={() => { }}  // No hace nada (siempre expandida)
                                onStartSession={() => {
                                    router.push({
                                        pathname: '/workout',
                                        params: {
                                            routineId: routine._id,
                                            sessionNumber: currentSessionNum,
                                            dayId: day._id,
                                            dayName: day.name,
                                            totalExercises: day.exercises.length,
                                            exerciseIndex: 0,
                                            isReadOnly: 'false'
                                        }
                                    });
                                }}
                                router={router}
                                routine={routine}
                                expandedAnimations={expandedAnimations}
                            />
                        );
                    })()}

                    {/* Botón Ver Programa Completo */}
                    <Pressable
                        style={styles.viewAllButton}
                        onPress={() => router.push(`/routines/${routine._id}/sessions`)}
                    >
                        <Icon name="calendar" size={20} color={colors.primary.main} />
                        <Text variant="bodyLarge" color="primary.main" style={{ fontWeight: '600' }}>
                            Ver Programa Completo
                        </Text>
                        <Text variant="caption" color="neutral.gray500">
                            ({routine.totalSessions} sesiones)
                        </Text>
                        <Icon name="chevron-forward" size={20} color={colors.primary.main} style={{ marginLeft: 'auto' }} />
                    </Pressable>
                </View>
            </ScrollView>
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
        backgroundColor: colors.neutral.gray100,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: spacing.base,
        paddingBottom: spacing.xl,
    },

    // Header Card
    headerCard: {
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    headerContent: {
        gap: spacing.sm,
    },
    headerInfo: {
        flex: 1,
    },
    metaRow: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginTop: spacing.xs,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    activeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        backgroundColor: colors.success.main + '15',
        borderRadius: radius.base,
        marginTop: spacing.sm,
    },

    // Progress Card
    progressCard: {
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    progressStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.lg,
    },
    progressStat: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    progressDivider: {
        width: 1,
        height: 40,
        backgroundColor: colors.neutral.gray200,
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: colors.neutral.gray200,
        borderRadius: radius.full,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary.main,
        borderRadius: radius.full,
    },

    // Action Buttons
    actionButtons: {
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },

    // Program Section
    programSection: {
        marginTop: spacing.md,
    },
    sectionTitle: {
        marginBottom: spacing.md,
        fontWeight: '600',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.lg,
        backgroundColor: colors.neutral.white,
        borderRadius: radius.lg,
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.neutral.gray200,
    },
});