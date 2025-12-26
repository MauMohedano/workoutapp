import { View, StyleSheet, ScrollView, ActivityIndicator, Animated, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getRoutineById } from '../../api/routineApi';
import { getSetsBySession } from '../../api/workoutApi';
import NewSetInput from '../../components/NewSetInput';
import { useSessionProgress } from '../../hooks/useSessionProgress';
import { saveWorkoutProgress, clearWorkoutProgress } from '../../utils/workoutProgressCache';
import { getDeviceId } from '../../utils/deviceId';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWorkoutProgress } from '../../utils/workoutProgressCache';
import { FinishWorkoutModal } from '../../components/workout/FinishWorkoutModal';
import { getExercisesCompletedCount } from '../../utils/sessionProgressCalculator';
import { useWorkoutTimer } from '../../contexts/WorkoutTimerContext';

// Design System
import { colors, spacing, radius, shadows, Icon } from '@/design-systems/tokens';
import { Text, Button, Card } from '@/design-systems/components';

// Workout Components
import SessionSection from '../../components/workout/SessionSection';
import HistorySectionCollapsible from '../../components/workout/HistorySectionCollapsible';
import AutoAdvanceBar from '../../components/workout/AutoAdvanceBar';

export default function WorkoutScreen() {
    const router = useRouter();
    const {
        routineId,
        sessionNumber,
        dayId,
        dayName,
        totalExercises,
        exerciseIndex: exerciseIndexParam,
        isReadOnly: isReadOnlyParam
    } = useLocalSearchParams();

    const isReadOnly = isReadOnlyParam === 'true';
    const { completeCurrentSession, isCompleting, currentSession } = useSessionProgress(routineId);
    const { isActive: isTimerActive, startTimer, stopTimer } = useWorkoutTimer();

    // Estados y refs
    const exerciseIndex = parseInt(exerciseIndexParam) || 0;
    const [deviceId, setDeviceId] = useState(null);
    const [showAutoAdvance, setShowAutoAdvance] = useState(false);
    const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const [showFinishModal, setShowFinishModal] = useState(false);

    const calculateProgress = () => {
        if (!day?.exercises) {
            return { completedExercises: 0, totalExercises: 0, isFullyCompleted: false };
        }

        const totalExercises = day.exercises.length;

        // Contar ejercicios completados manualmente
        let completedExercises = 0;
        day.exercises.forEach(exercise => {
            const exerciseSets = currentSessionSets.filter(
                set => set.exercise === exercise.name
            );

            if (exerciseSets.length >= exercise.targetSets) {
                completedExercises++;
            }
        });

        return {
            completedExercises,
            totalExercises,
            isFullyCompleted: completedExercises === totalExercises
        };
    };

    const handleStartWorkout = () => {
        // Iniciar timer con todos los datos del workout
        startTimer(routineId, sessionNumber, {
            exerciseIndex,
            dayId,
            dayName,
            totalExercises
        });
        console.log('🚀 Rutina iniciada - Timer comenzado');
    };

    const handleConfirmFinish = async () => {
        setShowFinishModal(false);

        try {
            const duration = stopTimer();
            console.log('⏹️ Timer detenido. Duración:', duration, 'segundos');

            await completeCurrentSession(duration);
            console.log('✅ Sesión completada con duración guardada');

            if (deviceId) {
                await clearWorkoutProgress(deviceId, routineId, sessionNumber);
            }

            // ✨ Navegar a pantalla de resumen
            router.push({
                pathname: '/workout/summary',
                params: {
                    duration: duration || 0,
                    routineId,
                    sessionNumber,
                    dayName: day?.name || 'Entrenamiento'
                }
            });
        } catch (error) {
            console.error('❌ Error al completar sesión:', error);
        }
    };


    useEffect(() => {
        const loadDeviceId = async () => {
            const id = await getDeviceId();
            setDeviceId(id);
        }
        loadDeviceId();
    }, []);

    // ✅ Restaurar ejercicio guardado cuando regresa al workout
    useEffect(() => {
        const restoreProgress = async () => {
            // Solo intentar restaurar una vez
            if (hasRestoredProgress) {

                return;
            }

            // Esperar a tener todo lo necesario
            if (!deviceId || !routineId || !sessionNumber) {

                return;
            }

            try {


                // ✅ Usar la función existente que tiene la key correcta
                const progress = await getWorkoutProgress(deviceId, routineId, sessionNumber);

                if (progress) {


                    const savedExerciseIndex = progress.exerciseIndex || 0;



                    // Si el guardado es diferente al actual Y es mayor a 0
                    if (savedExerciseIndex !== exerciseIndex && savedExerciseIndex > 0) {


                        setHasRestoredProgress(true);

                        router.replace({
                            pathname: '/workout',
                            params: {
                                routineId,
                                sessionNumber,
                                dayId: progress.dayId || dayId,
                                dayName: progress.dayName || dayName,
                                totalExercises: progress.totalExercises || totalExercises,
                                exerciseIndex: savedExerciseIndex,
                                isReadOnly: isReadOnlyParam
                            }
                        });
                    } else {

                        setHasRestoredProgress(true);
                    }
                } else {

                    setHasRestoredProgress(true);
                }
            } catch (error) {
                console.error('❌ Error restaurando progreso:', error);
                setHasRestoredProgress(true);
            }
        };

        restoreProgress();
    }, [deviceId, routineId, sessionNumber, hasRestoredProgress]);



    const { data: routine, isLoading, error } = useQuery({
        queryKey: ['routine', routineId],
        queryFn: () => getRoutineById(routineId)
    });

    // Obtener datos del ejercicio actual
    const day = routine?.days?.find(d => d._id === dayId);
    const exercises = day?.exercises?.sort((a, b) => a.order - b.order) || [];
    const currentExercise = exercises[exerciseIndex];

    // Obtener sets de la sesión actual
    const { data: currentSessionSets = [] } = useQuery({
        queryKey: ['sessionSets', deviceId, routineId, sessionNumber],
        queryFn: () => getSetsBySession(deviceId, routineId, sessionNumber),
        enabled: !!deviceId && !!routineId && !!sessionNumber
    });

    // Obtener sets de sesiones anteriores (últimas 10)
    const { data: allHistorySets = [] } = useQuery({
        queryKey: ['allSets', deviceId, routineId],
        queryFn: async () => {
            const historyPromises = [];
            const currentSessionNum = parseInt(sessionNumber);

            // Últimas 10 sesiones (o menos si no hay tantas)
            const startSession = Math.max(1, currentSessionNum - 10);

            for (let i = currentSessionNum - 1; i >= startSession; i--) {
                historyPromises.push(
                    getSetsBySession(deviceId, routineId, i)
                        .then(sets => ({ sessionNumber: i, sets }))
                        .catch(() => ({ sessionNumber: i, sets: [] }))
                );
            }

            return Promise.all(historyPromises);
        },
        enabled: !!deviceId && !!routineId && !!sessionNumber
    });

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    if (error || !routine || !day || !currentExercise) {
        return (
            <View style={styles.centerContainer}>
                <Text variant="body" color="danger.main" align="center">
                    Error cargando rutina
                </Text>
            </View>
        );
    }

    // Filtrar sets del ejercicio actual
    const currentExerciseSets = currentSessionSets.filter(
        set => set.exercise === currentExercise.name
    );

    // Preparar historial de sesiones
    const historySessions = allHistorySets
        .map(({ sessionNumber: sessNum, sets }) => {
            const exerciseSets = sets.filter(s => s.exercise === currentExercise.name);
            if (exerciseSets.length === 0) return null;

            // Formatear fecha
            const date = exerciseSets[0]?.createdAt
                ? new Date(exerciseSets[0].createdAt).toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }).toUpperCase()
                : `Sesión ${sessNum}`;

            return {
                sessionNumber: sessNum,
                date,
                sets: exerciseSets
            };
        })
        .filter(Boolean)
        .reverse(); // Más reciente primero

    // Dividir en primeras 4 y resto
    const recentSessions = historySessions.slice(0, 4);
    const olderSessions = historySessions.slice(4);

    // Navegación
    const isFirstExercise = exerciseIndex === 0;
    const isLastExercise = exerciseIndex >= exercises.length - 1;

    const navigateToExercise = async (newIndex) => {
        // Fade out simple
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => {
            // Navegar
            router.replace({
                pathname: '/workout',
                params: {
                    routineId,
                    sessionNumber,
                    dayId,
                    dayName,
                    totalExercises,
                    exerciseIndex: newIndex,
                    isReadOnly: isReadOnlyParam
                }
            });

            // Fade in
            fadeAnim.setValue(1);
        });

        // Guardar progreso
        if (deviceId) {
            await saveWorkoutProgress(deviceId, routineId, sessionNumber, {
                exerciseIndex: newIndex,
                dayId,
                dayName,
                totalExercises
            });
        }
    };



    const goToNextExercise = async () => {
        if (isLastExercise) {
            // Último ejercicio - completar sesión
            try {
                await completeCurrentSession();


                if (deviceId) {
                    await clearWorkoutProgress(deviceId, routineId, sessionNumber);
                }
            } catch (error) {
                console.error('❌ Error al completar sesión:', error);
            }

            router.back();
        } else {
            navigateToExercise(exerciseIndex + 1);
        }
    };

    // Manejar cuando se agrega un set
    const handleSetAdded = async () => {
        const newCount = currentExerciseSets.length + 1;

        // Si completó todos los sets
        if (newCount >= currentExercise.targetSets) {
            if (!isLastExercise) {
                // Mostrar auto-advance
                setShowAutoAdvance(true);

                // ✅ AGREGAR: Guardar progreso en "siguiente ejercicio"
                if (deviceId) {
                    await saveWorkoutProgress(deviceId, routineId, sessionNumber, {
                        exerciseIndex: exerciseIndex + 1, // ← Siguiente ejercicio
                        dayId,
                        dayName,
                        totalExercises
                    });

                }
            } else {
                // Es el último ejercicio

            }
        }
    };



    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: `Sesión ${sessionNumber}: ${dayName}`,
                    headerBackTitle: 'Rutina',
                    headerRight: () => null,
                }}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Header con flechas flotantes */}
                    <View style={styles.navigationHeader}>
                        {/* Flecha izquierda */}
                        {!isFirstExercise ? (
                            <Pressable
                                style={({ pressed }) => [
                                    styles.navArrow,
                                    pressed && styles.navArrowPressed
                                ]}
                                onPress={() => navigateToExercise(exerciseIndex - 1)}
                            >
                                <Icon name="chevron-back" size={28} color={colors.primary.main} />
                            </Pressable>
                        ) : (
                            <View style={styles.navArrowPlaceholder} />
                        )}

                        {/* Contador central */}
                        <View style={styles.counterCenter}>
                            <Text variant="overline" color="neutral.gray500" style={styles.counterLabel}>
                                EJERCICIO
                            </Text>
                            <Text variant="h2" color="neutral.gray900" bold>
                                {exerciseIndex + 1} de {totalExercises}
                            </Text>
                        </View>

                        {/* Flecha derecha */}
                        {!isLastExercise ? (
                            <Pressable
                                style={({ pressed }) => [
                                    styles.navArrow,
                                    pressed && styles.navArrowPressed
                                ]}
                                onPress={() => navigateToExercise(exerciseIndex + 1)}
                            >
                                <Icon name="chevron-forward" size={28} color={colors.primary.main} />
                            </Pressable>
                        ) : (
                            <View style={styles.navArrowPlaceholder} />
                        )}
                    </View>

                    {/* Exercise Header */}
                    <View style={styles.exerciseHeader}>
                        <Text variant="h2" color="neutral.gray900" numberOfLines={2}>
                            {currentExercise.name}
                        </Text>
                        <View style={styles.exerciseMetaTags}>
                            <View style={styles.metaTag}>
                                <Icon name="body" size={14} color={colors.primary.main} />
                                <Text variant="caption" color="neutral.gray600">
                                    {currentExercise.muscle}
                                </Text>
                            </View>
                            <View style={styles.metaDot} />
                            <View style={styles.metaTag}>
                                <Icon name="barbell" size={14} color={colors.primary.main} />
                                <Text variant="caption" color="neutral.gray600">
                                    {currentExercise.equipment}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.targetRow}>
                            <View style={styles.targetBadge}>
                                <Icon name="repeat" size={16} color={colors.primary.main} />
                                <Text variant="bodySmall" color="neutral.gray700" bold>
                                    {currentExercise.targetSets} × {currentExercise.targetReps} reps
                                </Text>
                            </View>
                            {currentExercise.restTime && (
                                <View style={styles.restBadge}>
                                    <Icon name="timer" size={16} color={colors.warning.main} />
                                    <Text variant="bodySmall" color="neutral.gray700" bold>
                                        {Math.floor(currentExercise.restTime / 60)}:{(currentExercise.restTime % 60).toString().padStart(2, '0')} rest
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Read-Only Banner */}
                    {isReadOnly && (
                        <View style={styles.readOnlyBanner}>
                            <Text variant="bodyMedium" style={styles.readOnlyText} bold>
                                ⚠️ MODO LECTURA
                            </Text>
                            <Text variant="bodySmall" style={styles.readOnlySubtext}>
                                Esta sesión ya fue completada. Solo puedes ver el historial.
                            </Text>
                        </View>
                    )}

                    {/* Botón "Comenzar Rutina" - Solo si NO está en modo lectura y el timer NO está activo */}
                    {!isReadOnly && !isTimerActive && (
                        <View style={styles.startWorkoutContainer}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.startWorkoutButton,
                                    pressed && styles.startWorkoutButtonPressed
                                ]}
                                onPress={handleStartWorkout}
                            >
                                <Icon name="play-circle" size={28} color={colors.neutral.white} />
                                <Text variant="h3" style={styles.startWorkoutText} bold>
                                    COMENZAR RUTINA
                                </Text>
                            </Pressable>
                        </View>
                    )}

                    {/* Compact Set Input */}
                    {!isReadOnly && (
                        <View style={styles.inputSection}>
                            <View style={styles.sectionHeader}>
                                <Icon name="add-circle" size={18} color={colors.primary.main} />
                                <Text variant="bodyMedium" color="neutral.gray800" bold>
                                    AGREGAR SET
                                </Text>
                            </View>
                            <NewSetInput
                                exerciseName={currentExercise.name}
                                routineExerciseId={currentExercise._id}
                                sessionNumber={sessionNumber}
                                deviceId={deviceId}
                                routineId={routineId}
                                restTime={currentExercise.restTime}
                                targetSets={currentExercise.targetSets}
                                targetReps={currentExercise.targetReps}
                                variant="compact"
                                onSetAdded={handleSetAdded}
                            />
                        </View>
                    )}

                    {/* Current Session Sets */}
                    {currentExerciseSets.length > 0 && (
                        <SessionSection
                            title="SESIÓN ACTUAL"
                            subtitle={`Sesión ${sessionNumber}`}
                            sets={currentExerciseSets}
                            isCurrentSession={true}
                            icon="barbell"
                        />
                    )}

                    {/* Recent History (4 más recientes) */}
                    {recentSessions.map((session, index) => (
                        <SessionSection
                            key={index}
                            title={session.date}
                            subtitle={`Sesión ${session.sessionNumber}`}
                            sets={session.sets}
                            isCurrentSession={false}
                            icon="calendar"
                        />
                    ))}

                    {/* Older History (colapsable) */}
                    {olderSessions.length > 0 && (
                        <HistorySectionCollapsible sessions={olderSessions} />
                    )}

                    {/* Spacer para el auto-advance bar */}
                    <View style={{ height: 120 }} />
                </Animated.View>
            </ScrollView>


            {/* Botón fijo "Terminar Rutina" */}
            {!isReadOnly && !showAutoAdvance && (
                <View style={styles.finishButtonContainer}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.finishButton,
                            pressed && styles.finishButtonPressed
                        ]}
                        onPress={() => setShowFinishModal(true)}
                    >
                        <Icon name="checkmark-circle" size={24} color={colors.neutral.white} />
                        <Text variant="bodyMedium" style={styles.finishButtonText} bold>
                            TERMINAR RUTINA
                        </Text>
                    </Pressable>
                </View>
            )}

            {/* Auto-Advance Bar */}
            {showAutoAdvance && !isLastExercise && (
                <AutoAdvanceBar
                    onAdvance={goToNextExercise}
                    onCancel={() => setShowAutoAdvance(false)}
                    nextExerciseName={exercises[exerciseIndex + 1]?.name}
                />
            )}

            {/* Finish Workout Modal */}
            <FinishWorkoutModal
                visible={showFinishModal}
                onClose={() => setShowFinishModal(false)}
                onConfirm={handleConfirmFinish}
                {...calculateProgress()}
            />
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.xl * 2,
    },
    progressContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.neutral.gray200,
        marginBottom: spacing.lg,
        minHeight: 140,
    },
    progressNumber: {
        color: colors.primary.main,
        fontSize: 42,
        fontWeight: 'bold',
        marginVertical: spacing.sm,
        lineHeight: 52,
        height: 60,
    },

    // Navigation Header (con flechas flotantes)
    navigationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.neutral.white,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral.gray200,
    },
    navArrow: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary.main + '10',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navArrowPressed: {
        backgroundColor: colors.primary.main + '20',
        transform: [{ scale: 0.95 }],
    },
    navArrowPlaceholder: {
        width: 48,
        height: 48,
    },
    counterCenter: {
        alignItems: 'center',
        gap: spacing.xs - 4,
    },
    counterLabel: {
        letterSpacing: 1.2,
    },

    // Exercise Header
    exerciseHeader: {
        backgroundColor: colors.neutral.white,
        padding: spacing.lg,
        marginBottom: spacing.sm + 2,
        gap: spacing.sm,
    },
    exerciseMetaTags: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    metaTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: colors.neutral.gray400,
    },
    targetRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        flexWrap: 'wrap',
    },
    targetBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs - 2,
        backgroundColor: colors.primary.main + '15',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.primary.main + '30',
    },
    restBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs - 2,
        backgroundColor: colors.warning.main + '15',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.warning.main + '30',
    },

    // Read-Only Banner
    readOnlyBanner: {
        backgroundColor: colors.warning.main,
        padding: spacing.md,
        marginBottom: spacing.sm + 2,
        marginHorizontal: spacing.sm + 2,
        borderRadius: radius.lg,
    },
    readOnlyText: {
        color: colors.neutral.white,
        marginBottom: spacing.xs - 2,
    },
    readOnlySubtext: {
        color: colors.neutral.white,
        opacity: 0.9,
    },

    // Input Section
    inputSection: {
        marginBottom: spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.sm,
    },

    // Botón "Terminar Rutina"
    finishButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.neutral.white,
        padding: spacing.md,
        paddingBottom: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral.gray200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    finishButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.success.main,
        paddingVertical: spacing.md + 2,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.lg,
    },
    finishButtonPressed: {
        backgroundColor: colors.success.dark,
        transform: [{ scale: 0.98 }],
    },
    finishButtonText: {
        color: colors.neutral.white,
    },

    // Botón "Comenzar Rutina"
    startWorkoutContainer: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
        backgroundColor: colors.backgrounds.elevated,
    },
    startWorkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary.main,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        borderRadius: radius.lg,
        ...shadows.lg,
    },
    startWorkoutButtonPressed: {
        backgroundColor: colors.primary.dark,
        transform: [{ scale: 0.98 }],
    },
    startWorkoutText: {
        color: colors.neutral.white,
        letterSpacing: 0.5,
    },
});
