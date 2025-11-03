import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getRoutineById } from '../../api/routineApi';
import { getLastWorkout } from '../../api/workoutApi';
import NewSetInput from '../../components/NewSetInput';
import SetsList from '../../components/SetsList';
import { useSessionProgress } from '../../hooks/useSessionProgress';
import { saveWorkoutProgress, clearWorkoutProgress } from '../../utils/workoutProgressCache';
import { getDeviceId } from '../../utils/deviceId';
import { useState, useEffect } from 'react';

// Design System
import { colors, spacing, radius } from '@/design-systems/tokens';
import { Text, Button, Card } from '@/design-systems/components';

export default function WorkoutScreen() {
    const router = useRouter();
    const {
        routineId,
        sessionNumber,
        dayId,
        dayName,
        totalExercises,
        exerciseIndex: exerciseIndexParam
    } = useLocalSearchParams();
    const { completeCurrentSession, isCompleting } = useSessionProgress(routineId);

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
        <ScrollView style={styles.container}>
            <Stack.Screen
                options={{
                    title: `Sesión ${sessionNumber}: ${dayName}`,
                    headerBackTitle: 'Rutina'
                }}
            />

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

            <NewSetInput
                exerciseName={currentExercise.name}
                routineExerciseId={currentExercise._id}
                sessionNumber={sessionNumber}
                restTime={currentExercise.restTime || 90}
            />

            <SetsList
                exerciseName={currentExercise.name}
                routineExerciseId={currentExercise._id}
                sessionNumber={sessionNumber}
            />

            <View style={styles.navigationSection}>
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
});