import { View, StyleSheet, ActivityIndicator, Pressable, Alert, FlatList, LogBox } from "react-native";
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getRoutineById } from "../../api/routineApi";
import { useState, useEffect } from "react";
import { useSessionProgress } from "../../hooks/useSessionProgress";
import { getWorkoutProgress } from "../../utils/workoutProgressCache";
import React from "react";

// Design System
import { colors, spacing, radius, Icon, shadows } from '@/design-systems/tokens';
import { Text, Button, Card, ExerciseCard } from '@/design-systems/components';

LogBox.ignoreLogs([
    'VirtualizedLists should never be nested'
]);

export default function RoutineDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [expandedDayId, setExpandedDayId] = useState(null);
    const {
        currentSession,
        completedSessions,
        skippedSessions,
        isSessionCompleted,
        isSessionSkipped,
        skipCurrentSession,
        deviceId,
    } = useSessionProgress(id);

    const [workoutProgress, setWorkoutProgress] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            const loadProgress = async () => {
                if (deviceId && id && currentSession) {
                    const progress = await getWorkoutProgress(deviceId, id, currentSession);
                    setWorkoutProgress(progress);
                    console.log('🔄 Progreso recargado:', progress ?
                        `Ejercicio ${progress.exerciseIndex + 1}/${progress.totalExercises}` :
                        'Sin progreso'
                    );
                }
                setLoadingProgress(false);
            };

            loadProgress();
        }, [deviceId, id, currentSession])
    );

    const { data: routine, isLoading, error } = useQuery({
        queryKey: ['routine', id],
        queryFn: () => getRoutineById(id)
    });

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

    if (!routine) {
        return (
            <View style={styles.centerContainer}>
                <Text variant="body" color="neutral.gray500">
                    Rutina no encontrada
                </Text>
            </View>
        );
    }

    const toggleDay = (dayId) => {
        setExpandedDayId(expandedDayId === dayId ? null : dayId);
    };

    const startWorkout = (sessionNumber) => {
        const dayIndex = (sessionNumber - 1) % totalDays;
        const day = routine.days?.sort((a, b) => a.order - b.order)[dayIndex];

        if (!day || !day.exercises || day.exercises.length === 0) {
            console.error('No hay ejercicios en este día');
            return;
        }

        const startIndex = workoutProgress?.exerciseIndex || 0;

        router.push({
            pathname: '/workout',
            params: {
                routineId: routine._id,
                sessionNumber: sessionNumber,
                dayId: day._id,
                dayName: day.name,
                totalExercises: day.exercises.length,
                exerciseIndex: startIndex
            }
        });
    };

    const handleSkipSession = () => {
        Alert.alert(
            "Saltar Sesión",
            `¿Estás seguro de saltar la Sesión ${currentSession}? No podrás regresar a ella.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Saltar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await skipCurrentSession();
                            Alert.alert('✅ Sesión Saltada', `Avanzaste a la Sesión ${currentSession + 1}`);
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo saltar la sesión');
                        }
                    }
                }
            ]
        )
    }

    const totalDays = routine.days?.length || 3;
    const currentDayIndex = ((currentSession - 1) % totalDays);
    const currentWeek = Math.ceil(currentSession / totalDays);
    const sessionsData = Array.from({ length: 21 }, (_, i) => i + 1);

    return (
        <FlatList
            style={styles.container}
            data={sessionsData}
            keyExtractor={(item) => `session-${item}`}
            ListHeaderComponent={() => (
                <>
                    <Stack.Screen options={{ title: routine.name }} />

                    {/* Header con progreso */}
                    <View style={styles.header}>
                        <Text variant="h1" color="neutral.gray600" style={{ marginBottom: spacing.sm }}>
                            {routine.name}
                        </Text>
                        {routine.description ? (
                            <Text variant="body" color="neutral.gray500" style={{ marginBottom: spacing.base }}>
                                {routine.description}
                            </Text>
                        ) : null}

                        {/* Progreso de sesiones */}
                        <Card variant="flat" shadow={false} style={{ marginBottom: spacing.sm + 2 }}>
                            <Text variant="bodySmall" color="neutral.gray500" style={{ marginBottom: spacing.xs }}>
                                Progreso del Programa
                            </Text>
                            <Text variant="h2" color="primary.main" style={{ marginBottom: 2 }}>
                                Sesión {currentSession} de 21
                            </Text>
                            <Text variant="bodySmall" color="neutral.gray500" style={{ marginBottom: spacing.sm }}>
                                {routine.days?.sort((a, b) => a.order - b.order)[currentDayIndex]?.name}
                            </Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${(currentSession / 21) * 100}%` }]} />
                            </View>
                        </Card>
                    </View>

                    {/* Próxima sesión destacada */}

                    <View style={styles.nextSessionCard}>
                        {/* Header con icono */}
                        <View style={styles.nextSessionHeader}>
                            <Icon name="flame" size={24} color={colors.neutral.white} />
                            <Text variant="overline" style={styles.nextSessionLabel}>
                                PRÓXIMA SESIÓN
                            </Text>
                        </View>

                        {/* Nombre del día con icono según tipo */}
                        <View style={styles.dayNameRow}>
                            <Icon name="dumbbell" size={32} color={colors.neutral.white} />
                            <View style={styles.dayInfo}>
                                <Text variant="h1" style={styles.nextSessionDay}>
                                    {routine.days?.sort((a, b) => a.order - b.order)[currentDayIndex]?.name}
                                </Text>
                                <Text variant="bodySmall" style={styles.sessionMeta}>
                                    Semana {currentWeek} • Sesión {currentSession} de 21
                                </Text>

                                {/* PROGRESO INTEGRADO (NUEVO) */}
                                {workoutProgress && !loadingProgress && (
                                    <View style={styles.inlineProgress}>
                                        <Icon name="play" size={14} color={colors.neutral.white} />
                                        <Text variant="caption" style={styles.inlineProgressText}>
                                            En progreso • Ejercicio {workoutProgress.exerciseIndex + 1}/{workoutProgress.totalExercises}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>



                        {/* Botón principal */}
                        <Button
                            variant={workoutProgress ? "secondary" : "primary"}
                            size="lg"
                            fullWidth
                            icon={workoutProgress ? "play" : "play-circle"}
                            onPress={() => startWorkout(currentSession)}
                            disabled={loadingProgress}
                            style={styles.mainActionButton}
                        >
                            {loadingProgress ? 'Cargando...' :
                                workoutProgress ?
                                    `Continuar Sesión ${currentSession}` :
                                    `Iniciar Sesión ${currentSession}`
                            }
                        </Button>

                        {/* Botón secundario (saltar) */}
                        {currentSession < 21 && (
                            <Pressable
                                style={styles.skipButton}
                                onPress={handleSkipSession}
                            >
                                <Icon name="play-skip-forward" size={18} color={colors.neutral.white} />
                                <Text variant="bodySmall" style={styles.skipButtonText}>
                                    Saltar a Sesión {currentSession + 1}
                                </Text>
                            </Pressable>
                        )}
                    </View>
                    {/* Título de la sección */}
                    <View style={styles.daysSection}>
                        <Text variant="h3" color="neutral.gray600">
                            Programa Completo (21 Sesiones)
                        </Text>
                    </View>
                </>
            )}
            renderItem={({ item: sessionNum }) => {
                const dayIndex = (sessionNum - 1) % totalDays;
                const day = routine.days?.sort((a, b) => a.order - b.order)[dayIndex];
                const week = Math.ceil(sessionNum / totalDays);
                const isExpanded = expandedDayId === `session-${sessionNum}`;
                const isCompleted = sessionNum < currentSession;
                const isCurrent = sessionNum === currentSession;

                if (!day) return null;

                return (
                    <Card
                        variant={isCurrent ? 'highlighted' : 'default'}
                        style={styles.sessionCard}
                    >
                        {/* Header colapsable */}
                        <Pressable
                            style={styles.dayHeader}
                            onPress={() => toggleDay(`session-${sessionNum}`)}
                        >
                            <View style={styles.dayHeaderLeft}>
                                <Text variant="h3" color="neutral.gray600">
                                    Sesión {sessionNum} - {day.name}
                                </Text>
                                <Text variant="bodySmall" color="neutral.gray400">
                                    💪 {day.exercises?.length || 0} ejercicios
                                </Text>
                            </View>

                            {/* Badges */}
                            <View style={styles.badgeContainer}>
                                {isCurrent && (
                                    <View style={[styles.badge, { backgroundColor: colors.primary.main }]}>
                                        <Text variant="caption" style={{ color: colors.neutral.white }}>
                                            📍 Actual
                                        </Text>
                                    </View>
                                )}
                                {isSessionCompleted(sessionNum) && (
                                    <View style={[styles.badge, { backgroundColor: colors.success.main }]}>
                                        <Text variant="caption" style={{ color: colors.neutral.white }}>
                                            ✅ Hecha
                                        </Text>
                                    </View>
                                )}
                                {isSessionSkipped(sessionNum) && (
                                    <View style={[styles.badge, { backgroundColor: colors.warning.main }]}>
                                        <Text variant="caption" style={{ color: colors.neutral.white }}>
                                            ⏭️ Saltada
                                        </Text>
                                    </View>
                                )}
                                <Text variant="body" color="primary.main" style={{ marginLeft: spacing.sm }}>
                                    {isExpanded ? '▲' : '▼'}
                                </Text>
                            </View>
                        </Pressable>

                        {/* Contenido colapsable */}
                        {isExpanded && (
                            <View style={styles.dayContent}>
                                {/* Warm up */}
                                {day.warm_up && day.warm_up.length > 0 && (
                                    <View style={styles.section}>
                                        <Text variant="bodySmall" color="neutral.gray600" bold>
                                            🔥 Calentamiento:
                                        </Text>
                                        {day.warm_up.map((item, idx) => (
                                            <Text key={idx} variant="caption" color="neutral.gray500" style={styles.sectionItem}>
                                                • {item}
                                            </Text>
                                        ))}
                                    </View>
                                )}

                                {/* Ejercicios */}
                                <View style={styles.exercisesContainer}>
                                    <Text variant="bodySmall" color="neutral.gray600" bold style={{ marginBottom: spacing.xs }}>
                                        💪 Ejercicios:
                                    </Text>
                                    {day.exercises?.sort((a, b) => a.order - b.order).map((exercise, idx) => (
                                        <ExerciseCard
                                            key={exercise._id}
                                            exercise={exercise}
                                            index={idx + 1}
                                            variant="default"
                                            current={sessionNum === currentSession && workoutProgress?.exerciseIndex === idx}
                                            completed={sessionNum < currentSession}
                                            disabled={false}
                                            onPress={(ex) => {
                                                router.push({
                                                    pathname: '/workout',
                                                    params: {
                                                        routineId: routine._id,
                                                        sessionNumber: sessionNum,
                                                        dayId: day._id,
                                                        dayName: day.name,
                                                        totalExercises: day.exercises.length,
                                                        exerciseIndex: idx,
                                                        isReadOnly: sessionNum !== currentSession ? 'true' : 'false'
                                                    }
                                                });
                                            }}
                                        />
                                    ))}
                                </View>

                                {/* Cool down */}
                                {day.cool_down && day.cool_down.length > 0 && (
                                    <View style={styles.section}>
                                        <Text variant="bodySmall" color="neutral.gray600" bold>
                                            ❄️ Enfriamiento:
                                        </Text>
                                        {day.cool_down.map((item, idx) => (
                                            <Text key={idx} variant="caption" color="neutral.gray500" style={styles.sectionItem}>
                                                • {item}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}
                    </Card>
                );
            }}
        />
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
    },
    header: {
        backgroundColor: colors.neutral.white,
        padding: spacing.base,
        marginBottom: spacing.sm + 2,
    },
    progressBar: {
        height: 8,
        backgroundColor: colors.neutral.gray200,
        borderRadius: radius.base,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary.main,
    },
    nextSessionCard: {
        backgroundColor: colors.primary.main,
        padding: spacing.lg,
        marginBottom: spacing.sm + 2,
        borderRadius: radius.xl,
        ...shadows.xl,
    },
    nextSessionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    nextSessionLabel: {
        color: colors.neutral.white,
        opacity: 0.9,
        letterSpacing: 1.2,
    },
    nextSessionTitle: {
        color: colors.neutral.white,
        opacity: 0.9,
        marginBottom: spacing.xs,
    },
    dayNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    dayInfo: {
        flex: 1,
    },
    nextSessionDay: {
        color: colors.neutral.white,
        marginBottom: spacing.xs - 2,
    },
    sessionMeta: {
        color: colors.neutral.white,
        opacity: 0.8,
    },

    mainActionButton: {
        marginBottom: spacing.sm,
        ...shadows.lg,
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 1.5,
        borderColor: colors.neutral.white + '40',
        backgroundColor: 'transparent',
    },
    skipButtonText: {
        color: colors.neutral.white,
        opacity: 0.9,
    },

    progressIndicator: {
        textAlign: 'center',
        color: colors.neutral.white,
        marginTop: spacing.sm,
        opacity: 0.9,
    },
    daysSection: {
        padding: spacing.sm + 2,
    },
    sessionCard: {
        marginBottom: spacing.sm + 2,
        marginHorizontal: spacing.sm + 2,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dayHeaderLeft: {
        flex: 1,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs - 2,
        borderRadius: radius.full,
    },
    dayContent: {
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.neutral.gray200,
        marginTop: spacing.md,
    },
    section: {
        marginBottom: spacing.md,
    },
    sectionItem: {
        marginBottom: 2,
        paddingLeft: spacing.sm,
    },
    exercisesContainer: {
        marginBottom: spacing.md,
    },
     
    inlineProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: spacing.xs,
    },
    inlineProgressText: {
        color: colors.neutral.white,
        opacity: 0.9,
        fontStyle: 'italic',
    },
});