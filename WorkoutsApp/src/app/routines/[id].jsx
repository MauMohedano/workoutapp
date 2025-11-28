import { View, StyleSheet, ActivityIndicator, Pressable, Alert, FlatList, LogBox, Animated } from "react-native";
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getRoutineById } from "../../api/routineApi";
import { useState, useEffect } from "react";
import { useSessionProgress } from "../../hooks/useSessionProgress";
import {
    getDayForSession,
    getSessionStatus,
    hasExercises,
    getWorkoutStartIndex
} from "../../utils/sessionHelpers";
import { getWorkoutProgress } from "../../utils/workoutProgressCache";
import React from "react";

// Design System
import { colors, spacing, radius, Icon, shadows } from '@/design-systems/tokens';
import { Text, Button, Card, ExerciseCard, CircularProgress } from '@/design-systems/components';

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

    // Estado para animaciones
    const [expandedAnimations] = useState(() => {
        const animations = {};
        for (let i = 1; i <= 72; i++) {  // Máximo posible
            animations[`session-${i}`] = new Animated.Value(0);
        }
        return animations;
    });

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
        const isExpanding = expandedDayId !== dayId;

        setExpandedDayId(isExpanding ? dayId : null);

        // Animar
        Animated.spring(expandedAnimations[dayId], {
            toValue: isExpanding ? 1 : 0,
            useNativeDriver: false,
            tension: 50,
            friction: 8,
        }).start();
    };

    const startWorkout = (sessionNumber) => {
        const day = getDayForSession(sessionNumber, routine.days);

        if (!hasExercises(day)) {
            console.error('No hay ejercicios en este día');
            return;
        }

        const startIndex = getWorkoutStartIndex(workoutProgress);

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

    // Función para calcular el progreso de una sesión
    const getSessionProgress = (sessionNum, day) => {
        // Sesión completada = 100%
        if (sessionNum < currentSession) {
            return 100;
        }

        // Sesión actual con progreso
        if (sessionNum === currentSession && workoutProgress) {
            const totalExercises = day.exercises?.length || 1;
            const completed = workoutProgress.exerciseIndex + 1;
            return Math.round((completed / totalExercises) * 100);
        }

        // Sesión futura o sin progreso = 0%
        return 0;
    };

    const totalDays = routine.days?.length || 3;
    const currentDayIndex = ((currentSession - 1) % totalDays);
    const currentWeek = Math.ceil(currentSession / totalDays);
    const sessionsData = Array.from({ length: routine.totalSessions }, (_, i) => i + 1);


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
                        {/* Título de la rutina */}
                        <View style={styles.headerTitle}>
                            <Icon name="dumbbell" size={24} color={colors.primary.main} />
                            <Text variant="h1" color="neutral.gray800" style={{ flex: 1 }}>
                                {routine.name}
                            </Text>
                        </View>

                        {routine.description && (
                            <Text variant="body" color="neutral.gray500" style={styles.headerDescription}>
                                {routine.description}
                            </Text>
                        )}

                        {/* Card de progreso principal */}
                        <Card shadow="lg" style={styles.progressCard}>
                            {/* Row principal: CircularProgress + Stats */}
                            <View style={styles.progressRow}>
                                {/* Progreso circular grande */}
                                <View style={styles.circularProgressContainer}>
                                    <CircularProgress
                                        percentage={Math.round((currentSession / routine.totalSessions) * 100)}
                                        size={80}
                                        strokeWidth={6}
                                        showPercentage={true}
                                    />
                                    <Text variant="caption" color="neutral.gray500" style={styles.circularLabel}>
                                        PROGRAMA
                                    </Text>
                                </View>

                                {/* Info y stats */}
                                <View style={styles.progressInfo}>
                                    {/* Sesión actual */}
                                    <View style={styles.currentSessionInfo}>
                                        <Text variant="h2" color="primary.main">
                                            Sesión {currentSession}
                                        </Text>
                                        <Text variant="bodySmall" color="neutral.gray500">
                                            de {routine.totalSessions} totales
                                        </Text>
                                    </View>

                                    {/* Día actual */}
                                    <View style={styles.currentDayInfo}>
                                        <Icon name="flame" size={16} color={colors.warning.main} />
                                        <Text variant="bodyMedium" color="neutral.gray800" style={{ fontWeight: '600' }}>
                                            {routine.days?.sort((a, b) => a.order - b.order)[currentDayIndex]?.name}
                                        </Text>
                                    </View>

                                    {/* Mini stats */}
                                    <View style={styles.miniStats}>
                                        <View style={styles.miniStat}>
                                            <Icon name="success" size={14} color={colors.success.main} />
                                            <Text variant="caption" color="neutral.gray600">
                                                {completedSessions.length} completadas
                                            </Text>
                                        </View>
                                        <View style={styles.miniStat}>
                                            <Icon name="timer" size={14} color={colors.neutral.gray500} />
                                            <Text variant="caption" color="neutral.gray600">
                                                {routine.totalSessions - currentSession + 1} restantes
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Semana actual */}
                            <View style={styles.weekBadge}>
                                <Icon name="calendar" size={14} color={colors.primary.main} />
                                <Text variant="caption" color="primary.main" style={{ fontWeight: '600' }}>
                                    SEMANA {currentWeek}
                                </Text>
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
                                    Semana {currentWeek} • Sesión {currentSession} de {routine.totalSessions}
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
                        {currentSession < routine.totalSessions && (
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
                            Programa Completo ({routine.totalSessions} Sesiones)
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
                const isFuture = sessionNum > currentSession;
                const isSkipped = isSessionSkipped(sessionNum);

                if (!day) return null;

                return (
                    <Card
                        variant={isCurrent ? 'highlighted' : 'default'}
                        style={[
                            styles.sessionCard,
                            isCompleted && styles.sessionCardCompleted,
                            isFuture && styles.sessionCardFuture,
                        ]}
                    >
                        {/* Header clickeable */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.sessionHeader,
                                pressed && styles.sessionHeaderPressed,
                            ]}
                            onPress={() => toggleDay(`session-${sessionNum}`)}
                        >
                            {/* Lado izquierdo: Progreso + Info */}
                            <View style={styles.sessionLeft}>
                                {/* Progreso circular */}
                                <CircularProgress
                                    percentage={getSessionProgress(sessionNum, currentSession, workoutProgress, day)}
                                    size={48}
                                    strokeWidth={5}
                                    showPercentage={true}
                                />

                                {/* Info de la sesión */}
                                <View style={styles.sessionInfo}>
                                    <Text variant="bodyMedium" color="neutral.gray800" style={{ fontWeight: '600' }}>
                                        {day.name}
                                    </Text>
                                    <View style={styles.sessionMeta}>
                                        <Text variant="caption" color="neutral.gray500">
                                            Semana {week}
                                        </Text>
                                        <View style={styles.metaDot} />
                                        <Icon name="dumbbell" size={12} color={colors.neutral.gray500} />
                                        <Text variant="caption" color="neutral.gray500">
                                            {day.exercises?.length || 0} ejercicios
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Icono de expansión */}
                            <View style={styles.expandIcon}>
                                <Icon
                                    name={isExpanded ? "chevron-up" : "chevron-down"}
                                    size={24}
                                    color={isCurrent ? colors.primary.main : colors.neutral.gray400}
                                />
                            </View>
                        </Pressable>

                        {/* Contenido expandible */}
                        {isExpanded && (
                            <Animated.View
                                style={[
                                    styles.sessionContent,
                                    {
                                        opacity: expandedAnimations[`session-${sessionNum}`],
                                        maxHeight: expandedAnimations[`session-${sessionNum}`].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, 2000], // Altura máxima suficiente
                                        }),
                                    }
                                ]}
                            >
                                {/* Barra de progreso de ejercicios (solo si tiene progreso) */}
                                {isCurrent && workoutProgress && (
                                    <View style={styles.exerciseProgress}>
                                        <View style={styles.progressBarContainer}>
                                            <View style={[
                                                styles.progressBarFill,
                                                { width: `${((workoutProgress.exerciseIndex + 1) / (day.exercises?.length || 1)) * 100}%` }
                                            ]} />
                                        </View>
                                        <Text variant="caption" color="primary.main" style={{ fontWeight: '600' }}>
                                            {workoutProgress.exerciseIndex + 1}/{day.exercises?.length || 0} ejercicios
                                        </Text>
                                    </View>
                                )}

                                {/* Warm up */}
                                {day.warm_up && day.warm_up.length > 0 && (
                                    <View style={styles.sectionBlock}>
                                        <View style={styles.sectionHeader}>
                                            <Icon name="flame" size={18} color={colors.warning.main} />
                                            <Text variant="bodySmall" color="neutral.gray700" style={{ fontWeight: '600' }}>
                                                Calentamiento
                                            </Text>
                                        </View>
                                        {day.warm_up.map((item, idx) => (
                                            <Text key={idx} variant="bodySmall" color="neutral.gray600" style={styles.listItem}>
                                                • {item}
                                            </Text>
                                        ))}
                                    </View>
                                )}

                                {/* Ejercicios */}
                                <View style={styles.exercisesContainer}>
                                    <View style={styles.sectionHeader}>
                                        <Icon name="dumbbell" size={18} color={colors.primary.main} />
                                        <Text variant="bodySmall" color="neutral.gray700" style={{ fontWeight: '600' }}>
                                            Ejercicios
                                        </Text>
                                    </View>
                                    {day.exercises?.sort((a, b) => a.order - b.order).map((exercise, exIndex) => (
                                        <ExerciseCard
                                            key={exercise._id}
                                            exercise={exercise}
                                            index={exIndex + 1}
                                            variant="default"
                                            current={sessionNum === currentSession && workoutProgress?.exerciseIndex === exIndex}
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
                                                        exerciseIndex: exIndex,
                                                        isReadOnly: sessionNum !== currentSession ? 'true' : 'false'
                                                    }
                                                });
                                            }}
                                        />
                                    ))}
                                </View>

                                {/* Cool down */}
                                {day.cool_down && day.cool_down.length > 0 && (
                                    <View style={styles.sectionBlock}>
                                        <View style={styles.sectionHeader}>
                                            <Icon name="snow" size={18} color={colors.primary.light} />
                                            <Text variant="bodySmall" color="neutral.gray700" style={{ fontWeight: '600' }}>
                                                Enfriamiento
                                            </Text>
                                        </View>
                                        {day.cool_down.map((item, idx) => (
                                            <Text key={idx} variant="bodySmall" color="neutral.gray600" style={styles.listItem}>
                                                • {item}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </Animated.View>
                        )}
                    </Card>
                );
            }}
        />
    );
}

const styles = StyleSheet.create({
    // ===== CONTENEDORES PRINCIPALES =====
    container: {
        flex: 1,
        backgroundColor: colors.neutral.gray100,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ===== HEADER MEJORADO =====
    header: {
        backgroundColor: colors.neutral.white,
        padding: spacing.base,
        marginBottom: spacing.sm + 2,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    headerDescription: {
        marginBottom: spacing.base,
    },

    // Progress card (nuevo diseño)
    progressCard: {
        padding: spacing.lg,
        backgroundColor: colors.backgrounds.elevated,
    },
    progressRow: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginBottom: spacing.md,
    },

    // Circular progress container
    circularProgressContainer: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    circularLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginTop: spacing.xs - 2,
    },

    // Progress info
    progressInfo: {
        flex: 1,
        gap: spacing.sm,
        justifyContent: 'center',
    },
    currentSessionInfo: {
        gap: 2,
    },
    currentDayInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs - 2,
        backgroundColor: colors.warning.main + '15',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs - 2,
        borderRadius: radius.base,
        alignSelf: 'flex-start',
    },

    // Mini stats
    miniStats: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.xs,
    },
    miniStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    // Week badge
    weekBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs - 2,
        backgroundColor: colors.primary.main + '15',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs - 2,
        borderRadius: radius.full,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: colors.primary.main + '30',
    },

    // ===== NEXT SESSION CARD =====
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
    sessionMetaText: {
        color: colors.neutral.white,
        opacity: 0.8,
    },

    // Buttons
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

    // Inline progress
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

    // ===== SESSIONS LIST =====
    daysSection: {
        padding: spacing.sm + 2,
    },
    sessionCard: {
        marginBottom: spacing.md,
        marginHorizontal: spacing.sm + 2,
        overflow: 'hidden',
    },
    sessionCardCompleted: {
        opacity: 0.85,
    },
    sessionCardFuture: {
        opacity: 0.9,
    },

    // Session header
    sessionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    sessionHeaderPressed: {
        opacity: 0.7,
        backgroundColor: colors.neutral.gray50,
    },

    // Session left side
    sessionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        flex: 1,
    },

    // Session info
    sessionInfo: {
        flex: 1,
        gap: 4,
    },
    sessionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: colors.neutral.gray400,
    },

    // Expand icon
    expandIcon: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ===== SESSION CONTENT (EXPANDED) =====
    sessionContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        gap: spacing.md,
    },

    // Exercise progress bar
    exerciseProgress: {
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.primary.main + '10',
        borderRadius: radius.lg,
        marginBottom: spacing.xs,
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: colors.neutral.gray200,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary.main,
        borderRadius: 3,
    },

    // Section blocks
    sectionBlock: {
        gap: spacing.xs,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs - 2,
    },
    listItem: {
        paddingLeft: spacing.md,
        lineHeight: 20,
    },

    // Exercises container
    exercisesContainer: {
        gap: spacing.sm,
    },
});