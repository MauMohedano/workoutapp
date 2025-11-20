import { View, StyleSheet, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getRoutineById } from '../../api/routineApi';
import { getLastWorkout, getSets } from '../../api/workoutApi';
import NewSetInput from '../../components/NewSetInput';
import SetTracker from '../../components/SetTracker';
import { useSessionProgress } from '../../hooks/useSessionProgress';
import { saveWorkoutProgress, clearWorkoutProgress } from '../../utils/workoutProgressCache';
import { getDeviceId } from '../../utils/deviceId';
import { useState, useEffect } from 'react';

// Design System
import { colors, spacing, radius, shadows, Icon } from '@/design-systems/tokens';  
import { Text, Button, Card, CircularProgress } from '@/design-systems/components'; 

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
            {/* Header de Progreso Mejorado */}
            <View style={styles.progressHeader}>
                <View style={styles.progressContent}>
                    {/* CircularProgress */}
                    <CircularProgress
                        percentage={Math.round(((exerciseIndex + 1) / totalExercises) * 100)}
                        size={80}
                        strokeWidth={6}
                        showPercentage={true}
                    />

                    {/* Info del ejercicio */}
                    <View style={styles.exerciseHeaderInfo}>
                        <Text variant="overline" color="neutral.gray500">
                            EJERCICIO {exerciseIndex + 1} DE {totalExercises}
                        </Text>
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
                                <Icon name="dumbbell" size={14} color={colors.primary.main} />
                                <Text variant="caption" color="neutral.gray600">
                                    {currentExercise.equipment}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Target y Rest Time */}
                <View style={styles.targetRow}>
                    <View style={styles.targetBadge}>
                        <Icon name="target" size={16} color={colors.primary.main} />
                        <Text variant="bodySmall" color="neutral.gray700" bold>
                            {currentExercise.targetSets} × {currentExercise.targetReps} reps
                        </Text>
                    </View>
                    {currentExercise.restTime && (
                        <View style={styles.restBadge}>
                            <Icon name="timer" size={16} color={colors.warning.main} />
                            <Text variant="bodySmall" color="neutral.gray700" bold>
                                {currentExercise.restTime}s descanso
                            </Text>
                        </View>
                    )}
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



            {/* Input para nuevo set - Solo si NO es read-only */}
            {!isReadOnly && (
                <NewSetInput
                    exerciseName={currentExercise.name}
                    routineExerciseId={currentExercise._id}
                    sessionNumber={sessionNumber}
                    restTime={currentExercise.restTime || 90}
                />
            )}



            <SetTracker
                exerciseName={currentExercise.name}
                routineExerciseId={currentExercise._id}
                sessionNumber={sessionNumber}
                targetSets={currentExercise.targetSets}
                targetReps={currentExercise.targetReps}
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
                        <View style={styles.historyHeader}>
                            <Icon name="history" size={20} color={colors.primary.main} />
                            <Text variant="bodySmall" color="neutral.gray700" bold>
                                Último entrenamiento
                            </Text>
                            <View style={styles.sessionBadge}>
                                <Text variant="caption" color="primary.main" bold>
                                    Sesión {lastWorkout.sessionNumber}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.setsContainer}>
                            {lastWorkout.sets.map((set, idx) => (
                                <View key={set._id} style={styles.setRow}>
                                    <Text variant="caption" color="neutral.gray500">
                                        Set {idx + 1}
                                    </Text>
                                    <View style={styles.setValues}>
                                        <Text variant="bodySmall" color="neutral.gray800" bold>
                                            {set.weight}kg
                                        </Text>
                                        <Text variant="caption" color="neutral.gray400">
                                            ×
                                        </Text>
                                        <Text variant="bodySmall" color="neutral.gray800" bold>
                                            {set.reps} reps
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={styles.historyCard}>
                        <View style={styles.historyHeader}>
                            <Icon name="flame" size={20} color={colors.primary.main} />
                            <Text variant="bodySmall" color="neutral.gray700" bold>
                                Primer entrenamiento
                            </Text>
                        </View>
                        <Text variant="bodySmall" color="neutral.gray500" style={{ marginTop: spacing.sm }}>
                            Este es tu primer registro de este ejercicio. ¡Dale con todo!
                        </Text>
                    </View>
                )}
            </View>

            {/* Estadísticas del workout */}
            {(() => {
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

                // Si no hay sets, no mostrar nada
                if (!sets || sets.length === 0) return null;

                // Calcular estadísticas
                const stats = getWorkoutStats(
                    sets,
                    lastWorkout?.sets || [],
                    currentExercise.targetSets
                );

                if (!stats) return null;

                const fadeAnim = new Animated.Value(0);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }).start();

                return (
                    <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
                        <Text
                            variant="bodyMedium"
                            color="neutral.gray800"
                            bold
                            style={styles.statsTitle}
                        >
                            📊 Estadísticas de Hoy
                        </Text>

                        {/* Grid de stats 2x2 */}
                        <View style={styles.statsGrid}>
                            {/* 📦 Volumen Total */}
                            <View style={[styles.statCard, { backgroundColor: colors.primary.main + '10' }]}>
                                <Text variant="h1" style={{ fontSize: 32, color: colors.primary.main }}>
                                    {stats.totalVolume}
                                </Text>
                                <Text variant="caption" color="neutral.gray600" bold>
                                    kg VOLUMEN
                                </Text>
                                <Text variant="caption" color="neutral.gray500">
                                    {sets.length} sets
                                </Text>
                            </View>

                            {/* 🔥 Cambio de Volumen */}
                            {stats.volumeChange !== null && (
                                <View style={[
                                    styles.statCard,
                                    { backgroundColor: stats.volumeChange >= 0 ? colors.success.main + '10' : colors.danger.main + '10' }
                                ]}>
                                    <Text
                                        variant="h1"
                                        style={{
                                            fontSize: 32,
                                            color: stats.volumeChange >= 0 ? colors.success.main : colors.danger.main
                                        }}
                                    >
                                        {stats.volumeChange >= 0 ? '+' : ''}{stats.volumeChange}%
                                    </Text>
                                    <Text variant="caption" color="neutral.gray600" bold>
                                        {stats.volumeChange >= 0 ? '🔥 PROGRESO' : '⚠️ CAMBIO'}
                                    </Text>
                                    <Text variant="caption" color="neutral.gray500">
                                        vs última vez
                                    </Text>
                                </View>
                            )}

                            {/* 🏆 Personal Record */}
                            {stats.isPersonalRecord && (
                                <View style={[styles.statCard, { backgroundColor: colors.special.gold + '15' }]}>
                                    <Text variant="h1" style={{ fontSize: 40, color: colors.special.gold }}>
                                        🏆
                                    </Text>
                                    <Text variant="caption" style={{ color: colors.special.gold }} bold>
                                        RÉCORD PERSONAL
                                    </Text>
                                    <Text variant="caption" color="neutral.gray600">
                                        ¡Nuevo PR!
                                    </Text>
                                </View>
                            )}

                            {/* ⚖️ Peso Promedio */}
                            <View style={[styles.statCard, { backgroundColor: colors.neutral.gray100 }]}>
                                <Text variant="h1" style={{ fontSize: 32, color: colors.neutral.gray800 }}>
                                    {stats.avgWeight}
                                </Text>
                                <Text variant="caption" color="neutral.gray600" bold>
                                    kg PROMEDIO
                                </Text>
                                <Text variant="caption" color="neutral.gray500">
                                    {stats.avgReps} reps/set
                                </Text>
                            </View>

                            {/* 💯 1RM Estimado */}
                            <View style={[styles.statCard, { backgroundColor: colors.primary.light + '30' }]}>
                                <Text variant="h1" style={{ fontSize: 32, color: colors.primary.main }}>
                                    {stats.estimated1RM}
                                </Text>
                                <Text variant="caption" color="neutral.gray600" bold>
                                    kg 1RM EST.
                                </Text>
                                <Text variant="caption" color="neutral.gray500">
                                    Fórmula Epley
                                </Text>
                            </View>

                            {/* 🔢 Rango de Reps (si existe) */}
                            {stats.repsRange && (
                                <View style={[styles.statCard, { backgroundColor: colors.neutral.gray100 }]}>
                                    <Text variant="h1" style={{ fontSize: 32, color: colors.neutral.gray800 }}>
                                        {stats.repsRange.min}-{stats.repsRange.max}
                                    </Text>
                                    <Text variant="caption" color="neutral.gray600" bold>
                                        RANGO REPS
                                    </Text>
                                    <Text variant="caption" color="neutral.gray500">
                                        Min-Max
                                    </Text>
                                </View>
                            )}
                        </View>
                    </Animated.View>
                );
            })()}
        </ScrollView>
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
        padding: spacing.lg,
    },

    // ===== PROGRESS HEADER MEJORADO =====
    progressHeader: {
        backgroundColor: colors.neutral.white,
        padding: spacing.lg,
        marginBottom: spacing.sm + 2,
        ...shadows.sm,
    },
    progressContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        marginBottom: spacing.md,
    },
    exerciseHeaderInfo: {
        flex: 1,
        gap: spacing.xs - 2,
    },
    exerciseMetaTags: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs - 2,
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

    // Target row
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

    // ===== READ-ONLY BANNER =====
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

    // ===== STATS CONTAINER =====
    statsContainer: {
        marginBottom: spacing.md,
        paddingHorizontal: spacing.sm + 2,
    },
    statsTitle: {
        marginBottom: spacing.md,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    statCard: {
        flex: 1,
        minWidth: '47%', // 2 columnas en mobile
        padding: spacing.lg,
        borderRadius: radius.xl,
        alignItems: 'center',
        gap: spacing.xs - 2,
        ...shadows.md,
    },

    // ===== HISTORY CARD =====
    historyCard: {
    backgroundColor: colors.neutral.gray50,
    padding: spacing.base,
    marginBottom: spacing.sm + 2,
    borderRadius: radius.base,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
},
historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
},
sessionBadge: {
    backgroundColor: colors.primary.main + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginLeft: 'auto',
},
setsContainer: {
    gap: spacing.xs,
},
setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    padding: spacing.sm,
    borderRadius: radius.base,
},
setValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
},

    // ===== NAVIGATION =====
    navigationSection: {
        padding: spacing.sm + 2,
        marginBottom: spacing.lg,
    },
});