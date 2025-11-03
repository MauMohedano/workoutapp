import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
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
                <Text style={styles.errorText}>Error cargando rutina</Text>
            </View>
        );
    }

    // Encontrar el día correcto
    const day = routine.days?.find(d => d._id === dayId);

    if (!day || !day.exercises || day.exercises.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>No hay ejercicios en este día</Text>
            </View>
        );
    }

    const exercises = day.exercises.sort((a, b) => a.order - b.order);
    const currentExercise = exercises[exerciseIndex];

    if (!currentExercise) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Ejercicio no encontrado</Text>
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
            // Es el último ejercicio → Completar sesión
            try {
                await completeCurrentSession();
                console.log('✅ Sesión completada y guardada');

                // ✅ NUEVO: Limpiar progreso de workout al completar
                if (deviceId) {
                    await clearWorkoutProgress(deviceId, routineId, sessionNumber);
                    console.log('🗑️ Progreso de workout limpiado');
                }
            } catch (error) {
                console.error('❌ Error al completar sesión:', error);
            }

            router.back();
        } else {
            // No es el último → Avanzar al siguiente ejercicio
            const nextIndex = exerciseIndex + 1;

            // ✅ NUEVO: Guardar progreso antes de cambiar de ejercicio
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

            {/* Progreso */}
            <View style={styles.progressHeader}>
                <Text style={styles.progressText}>
                    Ejercicio {exerciseIndex + 1} de {totalExercises}
                </Text>
                <View style={styles.progressBar}>
                    <View style={[
                        styles.progressFill,
                        { width: `${((exerciseIndex + 1) / totalExercises) * 100}%` }
                    ]} />
                </View>
            </View>

            {/* Ejercicio actual */}
            <View style={styles.exerciseCard}>
                <Text style={styles.exerciseName}>{currentExercise.name}</Text>
                <Text style={styles.exerciseTarget}>
                    Target: {currentExercise.targetSets} × {currentExercise.targetReps} reps
                </Text>
                <Text style={styles.exerciseMeta}>
                    {currentExercise.muscle} • {currentExercise.equipment}
                </Text>
                {currentExercise.restTime && (
                    <Text style={styles.restTime}>
                        ⏱️ Descanso: {currentExercise.restTime}s
                    </Text>
                )}
            </View>

            {/* Historial del último entrenamiento */}
            {lastWorkout?.hasHistory ? (
                <View style={styles.historyCard}>
                    <Text style={styles.historyTitle}>
                        📊 Último entrenamiento (Sesión {lastWorkout.sessionNumber})
                    </Text>
                    {lastWorkout.sets.map((set, idx) => (
                        <Text key={set._id} style={styles.historySet}>
                            • Set {idx + 1}: {set.weight}kg × {set.reps} reps
                        </Text>
                    ))}
                </View>
            ) : (
                <View style={styles.historyCard}>
                    <Text style={styles.historyTitle}>📊 Primer entrenamiento</Text>
                    <Text style={styles.historySubtext}>
                        Este es tu primer registro de este ejercicio. ¡Dale con todo! 💪
                    </Text>
                </View>
            )}

            {/* Input para nuevo set */}
            <NewSetInput
                exerciseName={currentExercise.name}
                routineExerciseId={currentExercise._id}
                sessionNumber={sessionNumber}
                restTime={currentExercise.restTime || 90}
            />

            {/* Lista de sets de esta sesión */}
            <SetsList
                exerciseName={currentExercise.name}
                routineExerciseId={currentExercise._id}
                sessionNumber={sessionNumber}
            />

            {/* Botón siguiente ejercicio */}
            <View style={styles.navigationSection}>
                {!isLastExercise ? (
                    <Pressable
                        style={styles.nextButton}
                        onPress={goToNextExercise}
                    >
                        <Text style={styles.nextButtonText}>
                            → Siguiente: {exercises[exerciseIndex + 1]?.name}
                        </Text>
                    </Pressable>
                ) : (
                    <Pressable
                        style={styles.completeButton}
                        onPress={goToNextExercise}
                    >
                        <Text style={styles.completeButtonText}>
                            ✅ Completar Sesión
                        </Text>
                    </Pressable>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 16,
        textAlign: 'center',
    },
    progressHeader: {
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 10,
    },
    progressText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#34C759',
    },
    exerciseCard: {
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 10,
    },
    exerciseName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    exerciseTarget: {
        fontSize: 18,
        color: '#007AFF',
        marginBottom: 4,
    },
    exerciseMeta: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    restTime: {
        fontSize: 14,
        color: '#FF9500',
        marginTop: 4,
    },
    historyCard: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    historySubtext: {
        fontSize: 14,
        color: '#333',
        marginTop: 4,
    },
    navigationSection: {
        padding: 10,
        marginBottom: 20,
    },
    nextButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    completeButton: {
        backgroundColor: '#34C759',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    completeButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});