import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getRoutineById } from '../../api/routineApi';
import { getLastWorkout, getSets } from '../../api/workoutApi';
import NewSetInput from '../../components/NewSetInput';
import SetsList from '../../components/SetsList';
import { useSessionProgress } from '../../hooks/useSessionProgress';
import { saveWorkoutProgress, clearWorkoutProgress } from '../../utils/workoutProgressCache';
import { getDeviceId } from '../../utils/deviceId';
import { useState, useEffect } from 'react';

// Design System
import { colors, spacing, radius } from '@/design-systems/tokens';
import { Text, Button, Card } from '@/design-systems/components';

// Workout Stats
import { getWorkoutStats } from '../../utils/workoutStats';

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


    const exerciseIndex = parseInt(exerciseIndexParam) || 0;
    const [deviceId, setDeviceId] = useState(null);

    useEffect(() => {
        const loadDeviceId = async () => {
            const id = await getDeviceId();
            setDeviceId(id);
        }
        loadDeviceId();
    }, []);

    const { data: routine, isLoading, error } = useQuery({
        queryKey: ['routine', routineId],
        queryFn: () => getRoutineById(routineId)
    });

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error || !routine) {
        return (
            <View style={styles.centerContainer}>
                <Text variant="body" color="danger.main" align="center">
                    Error cargando rutina
                </Text>
            </View>
        );
    }

    const day = routine.days?.find(d => d._id === dayId);

    if (!day || !day.exercises || day.exercises.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text variant="body" color="danger.main" align="center">
                    No hay ejercicios en este día
                </Text>
            </View>
        );
    }

    const exercises = day.exercises.sort((a, b) => a.order - b.order);
    const currentExercise = exercises[exerciseIndex];

    if (!currentExercise) {
        return (
            <View style={styles.centerContainer}>
                <Text variant="body" color="danger.main" align="center">
                    Ejercicio no encontrado
                </Text>
            </View>
        );
    }

    const { data: lastWorkout } = useQuery({
        queryKey: ['lastWorkout', currentExercise.name, sessionNumber],
        queryFn: () => getLastWorkout(currentExercise.name, sessionNumber),
    })

    const isLastExercise = exerciseIndex >= exercises.length - 1;

    const goToNextExercise = async () => {
        if (isLastExercise) {
            try {
                await completeCurrentSession();
                console.log('✅ Sesión completada y guardada');

                if (deviceId) {
                    await clearWorkoutProgress(deviceId, routineId, sessionNumber);
                    console.log('🗑️ Progreso de workout limpiado');
                }
            } catch (error) {
                console.error('❌ Error al completar sesión:', error);
            }

            router.back();
        } else {
            const nextIndex = exerciseIndex + 1;

            if (deviceId) {
                await saveWorkoutProgress(deviceId, routineId, sessionNumber, {
                    exerciseIndex: nextIndex,
                    dayId,
                    dayName,
                    totalExercises
                });
            }

            router.replace({
                pathname: '/workout',
                params: {
                    routineId,
                    sessionNumber,
                    dayId,
                    dayName,
                    totalExercises,
                    exerciseIndex: nextIndex
                }
            });
        }
    };

    return (
        <ScrollView style={styles.container}
            contentContainerStyle={{ paddingBottom: 400 }}>
            <Stack.Screen
                options={{
                    title: `Sesión ${sessionNumber}: ${dayName}`,
                    headerBackTitle: 'Rutina'
                }}
            />

            {/* Progreso */}
            <View style={styles.progressHeader}>
                <Text
                    variant="body"
                    color="neutral.gray500"
                    style={{ marginBottom: spacing.sm }}
                >
                    Ejercicio {exerciseIndex + 1} de {totalExercises}
                </Text>
                <View style={styles.progressBar}>
                    <View style={[
                        styles.progressFill,
                        { width: `${((exerciseIndex + 1) / totalExercises) * 100}%` }
                    ]} />
                </View>
            </View>

            {/* Banner Read-Only */}
            {isReadOnly && (
                <View style={styles.readOnlyBanner}>
                    <Text variant="h3" style={styles.readOnlyTitle}>
                        📖 Modo Vista Previa
                    </Text>
                    <Text variant="bodySmall" style={styles.readOnlySubtitle}>
                        {parseInt(sessionNumber) < currentSession
                            ? `✅ Sesión completada anteriormente`
                            : `⏭️ Sesión futura - Aún no disponible`
                        }
                    </Text>
                    <Text variant="caption" style={styles.readOnlyHint}>
                        Solo puedes ver el historial. No puedes agregar sets.
                    </Text>
                </View>
            )}

            <Card style={{ marginBottom: spacing.sm + 2 }}>
                <Text
                    variant="h1"
                    color="neutral.gray600"
                    style={{ marginBottom: spacing.sm }}
                >
                    {currentExercise.name}
                </Text>
                <Text
                    variant="h3"
                    color="primary.main"
                    style={{ marginBottom: spacing.xs }}
                >
                    Target: {currentExercise.targetSets} × {currentExercise.targetReps} reps
                </Text>
                <Text
                    variant="bodySmall"
                    color="neutral.gray500"
                    style={{ marginBottom: spacing.xs }}
                >
                    {currentExercise.muscle} • {currentExercise.equipment}
                </Text>
                {currentExercise.restTime && (
                    <Text variant="bodySmall" color="warning.main">
                        ⏱️ Descanso: {currentExercise.restTime}s
                    </Text>
                )}
            </Card>

            {/* Input para nuevo set - Solo si NO es read-only */}
            {!isReadOnly && (
                <NewSetInput
                    exerciseName={currentExercise.name}
                    routineExerciseId={currentExercise._id}
                    sessionNumber={sessionNumber}
                    restTime={currentExercise.restTime || 90}
                />
            )}

            {/* Estadísticas - Solo en Read-Only */}
            {isReadOnly && (() => {
                // Obtener sets actuales
                const { data: allSets } = useQuery({
                    queryKey: ['sets'],
                    queryFn: getSets
                });

                const sets = allSets?.filter(set => {
                    const matchesExercise = set.exercise === currentExercise.name;
                    const matchesSession = sessionNumber ? set.sessionNumber === parseInt(sessionNumber) : true;
                    return matchesExercise && matchesSession;
                });

                // Calcular estadísticas
                const stats = getWorkoutStats(
                    sets,
                    lastWorkout?.sets || [],
                    currentExercise.targetSets
                );

                // Si no hay datos, no mostrar nada
                if (!stats) return null;

                return (
                    <View style={styles.statsContainer}>
                        <Text variant="bodySmall" color="neutral.gray600" bold style={{ marginBottom: spacing.xs, paddingHorizontal: spacing.sm + 2 }}>
                            📊 Estadísticas - Sesión {sessionNumber}
                        </Text>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.badgesContainer}
                        >
                            {/* 💪 Mejor Set */}
                            <View style={[styles.statBadge, { backgroundColor: colors.primary.light }]}>
                                <Text variant="caption" color="neutral.gray500">💪 Mejor Set</Text>
                                <Text variant="body" color="primary.main" bold>
                                    {stats.bestSet.weight}kg × {stats.bestSet.reps}
                                </Text>
                                <Text variant="caption" color="neutral.gray500">
                                    = {stats.bestSet.weight * stats.bestSet.reps}kg
                                </Text>
                            </View>

                            {/* 📊 Volumen Total */}
                            <View style={[styles.statBadge, { backgroundColor: colors.success.light }]}>
                                <Text variant="caption" color="neutral.gray500">📊 Volumen</Text>
                                <Text variant="body" color="success.main" bold>
                                    {stats.totalVolume.toLocaleString()}kg
                                </Text>
                                <Text variant="caption" color="neutral.gray500">
                                    {stats.totalSets} sets
                                </Text>
                            </View>

                            {/* 🎯 Sets Completados */}
                            {stats.completionRate !== null && (
                                <View style={[styles.statBadge, { backgroundColor: colors.neutral.gray100 }]}>
                                    <Text variant="caption" color="neutral.gray500">🎯 Completados</Text>
                                    <Text variant="body" color="neutral.gray600" bold>
                                        {stats.totalSets}/{currentExercise.targetSets}
                                    </Text>
                                    <Text variant="caption" color="neutral.gray500">
                                        {stats.completionRate}%
                                    </Text>
                                </View>
                            )}

                            {/* 📈 vs Sesión Anterior */}
                            {stats.volumeChange !== null && (
                                <View style={[
                                    styles.statBadge,
                                    { backgroundColor: stats.volumeChange >= 0 ? colors.success.light : colors.danger.light }
                                ]}>
                                    <Text variant="caption" color="neutral.gray500">📈 vs Anterior</Text>
                                    <Text
                                        variant="body"
                                        color={stats.volumeChange >= 0 ? "success.main" : "danger.main"}
                                        bold
                                    >
                                        {stats.volumeChange >= 0 ? '+' : ''}{stats.volumeChange}%
                                    </Text>
                                    <Text variant="caption" color="neutral.gray500">
                                        {stats.volumeChange >= 0 ? '🔥' : '⚠️'}
                                    </Text>
                                </View>
                            )}

                            {/* 🏆 Personal Record */}
                            {stats.isPersonalRecord && (
                                <View style={[styles.statBadge, { backgroundColor: colors.special.gold }]}>
                                    <Text variant="caption" color="neutral.gray600">🏆 PR!</Text>
                                    <Text variant="body" color="neutral.gray600" bold>
                                        Nuevo
                                    </Text>
                                    <Text variant="caption" color="neutral.gray600">
                                        Récord
                                    </Text>
                                </View>
                            )}

                            {/* ⚖️ Peso Promedio */}
                            <View style={[styles.statBadge, { backgroundColor: colors.neutral.gray100 }]}>
                                <Text variant="caption" color="neutral.gray500">⚖️ Promedio</Text>
                                <Text variant="body" color="neutral.gray600" bold>
                                    {stats.avgWeight}kg
                                </Text>
                                <Text variant="caption" color="neutral.gray500">
                                    {stats.avgReps} reps
                                </Text>
                            </View>

                            {/* 🔢 Rango de Reps */}
                            {stats.repsRange && (
                                <View style={[styles.statBadge, { backgroundColor: colors.neutral.gray100 }]}>
                                    <Text variant="caption" color="neutral.gray500">🔢 Rango</Text>
                                    <Text variant="body" color="neutral.gray600" bold>
                                        {stats.repsRange.min}-{stats.repsRange.max}
                                    </Text>
                                    <Text variant="caption" color="neutral.gray500">
                                        reps
                                    </Text>
                                </View>
                            )}

                            {/* 💯 1RM Estimado */}
                            <View style={[styles.statBadge, { backgroundColor: colors.primary.light }]}>
                                <Text variant="caption" color="neutral.gray500">💯 1RM Est.</Text>
                                <Text variant="body" color="primary.main" bold>
                                    {stats.estimated1RM}kg
                                </Text>
                                <Text variant="caption" color="neutral.gray500">
                                    Epley
                                </Text>
                            </View>
                        </ScrollView>
                    </View>
                );
            })()}

            <SetsList
                exerciseName={currentExercise.name}
                routineExerciseId={currentExercise._id}
                sessionNumber={sessionNumber}
            />

            {/* Botón siguiente ejercicio - Condicional */}
            <View style={styles.navigationSection}>
                {isReadOnly ? (
                    // Modo Read-Only: Solo botón de volver
                    <Button
                        variant="secondary"
                        fullWidth
                        onPress={() => router.back()}
                    >
                        ← Volver al Programa
                    </Button>
                ) : (
                    // Modo Normal: Navegación de workout
                    <>
                        {!isLastExercise ? (
                            <Button
                                variant="primary"
                                fullWidth
                                onPress={goToNextExercise}
                            >
                                → Siguiente: {exercises[exerciseIndex + 1]?.name}
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                fullWidth
                                onPress={goToNextExercise}
                                loading={isCompleting}
                            >
                                ✅ Completar Sesión
                            </Button>
                        )}
                    </>
                )}
                
            {/* Último entrenamiento */}
            {lastWorkout?.hasHistory ? (
                <View style={styles.historyCard}>
                    <Text
                        variant="body"
                        color="neutral.gray600"
                        bold
                        style={{ marginBottom: spacing.xs }}
                    >
                        📊 Último entrenamiento (Sesión {lastWorkout.sessionNumber})
                    </Text>
                    {lastWorkout.sets.map((set, idx) => (
                        <Text
                            key={set._id}
                            variant="bodySmall"
                            color="neutral.gray600"
                        >
                            • Set {idx + 1}: {set.weight}kg × {set.reps} reps
                        </Text>
                    ))}
                </View>
            ) : (
                <View style={styles.historyCard}>
                    <Text
                        variant="body"
                        color="neutral.gray600"
                        bold
                        style={{ marginBottom: spacing.xs }}
                    >
                        📊 Primer entrenamiento
                    </Text>
                    <Text variant="bodySmall" color="neutral.gray600">
                        Este es tu primer registro de este ejercicio. ¡Dale con todo! 💪
                    </Text>
                </View>
            )}
            </View>
        </ScrollView>
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
    progressHeader: {
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
        backgroundColor: colors.success.main,
    },
    historyCard: {
        backgroundColor: colors.neutral.gray50,
        padding: spacing.base,
        marginBottom: spacing.sm + 2,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary.main,
    },
    navigationSection: {
        padding: spacing.sm + 2,
        marginBottom: spacing.lg,
    },
    readOnlyBanner: {
        backgroundColor: colors.warning.main,
        padding: spacing.base,
        marginBottom: spacing.sm + 2,
        marginHorizontal: spacing.sm + 2,
        borderRadius: radius.lg,
    },
    readOnlyTitle: {
        color: colors.neutral.white,
        marginBottom: spacing.xs,
    },
    readOnlySubtitle: {
        color: colors.neutral.white,
        opacity: 0.95,
        marginBottom: spacing.xs,
    },
    readOnlyHint: {
        color: colors.neutral.white,
        opacity: 0.8,
    },
    statsContainer: {
        marginBottom: spacing.sm + 2,
    },
    badgesContainer: {
        paddingHorizontal: spacing.sm + 2,
        gap: spacing.sm,
    },
    statBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.lg,
        alignItems: 'center',
        minWidth: 100,
        marginRight: spacing.xs,
    },

});