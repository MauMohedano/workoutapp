import { View, Text, StyleSheet, ActivityIndicator, Pressable, Alert, FlatList, LogBox } from "react-native";
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getRoutineById } from "../../api/routineApi";
import { useState, useEffect } from "react";
import { useSessionProgress } from "../../hooks/useSessionProgress";
import { getWorkoutProgress } from "../../utils/workoutProgressCache";

import React from "react";

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
                <Text style={styles.errorText}>Error: {error.message}</Text>
            </View>
        );
    }

    if (!routine) {
        return (
            <View style={styles.centerContainer}>
                <Text>Rutina no encontrada</Text>
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

    // Calcular qué día corresponde a la sesión actual
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
                        <Text style={styles.routineName}>{routine.name}</Text>
                        {routine.description ? (
                            <Text style={styles.description}>{routine.description}</Text>
                        ) : null}

                        {/* Progreso de sesiones */}
                        <View style={styles.progressCard}>
                            <Text style={styles.progressTitle}>Progreso del Programa</Text>
                            <Text style={styles.progressText}>
                                Sesión {currentSession} de 21
                            </Text>
                            <Text style={styles.progressSubtext}>
                                {routine.days?.sort((a, b) => a.order - b.order)[currentDayIndex]?.name}
                            </Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${(currentSession / 21) * 100}%` }]} />
                            </View>
                        </View>
                    </View>

                    {/* Próxima sesión destacada */}
                    <View style={styles.nextSessionCard}>
                        <Text style={styles.nextSessionTitle}>📍 Próxima Sesión</Text>
                        <Text style={styles.nextSessionDay}>
                            {routine.days?.sort((a, b) => a.order - b.order)[currentDayIndex]?.name}
                        </Text>
                        <Pressable
                            style={[
                                styles.startNextButton,
                                workoutProgress && styles.continueButton
                            ]}
                            onPress={() => startWorkout(currentSession)}
                            disabled={loadingProgress}
                        >
                            <Text style={styles.startNextButtonText}>
                                {loadingProgress ? '⏳ Cargando...' :
                                    workoutProgress ?
                                        `▶️ Continuar Sesión ${currentSession}` :
                                        `🏋️ Iniciar Sesión ${currentSession}`
                                }
                            </Text>
                        </Pressable>

                        {workoutProgress && !loadingProgress && (
                            <Text style={styles.progressIndicator}>
                                📍 Ejercicio {workoutProgress.exerciseIndex + 1} de {workoutProgress.totalExercises}
                            </Text>
                        )}

                        {currentSession < 21 && (
                            <Pressable
                                style={styles.skipButton}
                                onPress={handleSkipSession}
                            >
                                <Text style={styles.skipButtonText}>
                                    ⏭️ Saltar a Sesión {currentSession + 1}
                                </Text>
                            </Pressable>
                        )}
                    </View>

                    {/* Título de la sección */}
                    <View style={styles.daysSection}>
                        <Text style={styles.sectionTitle}>Programa Completo (21 Sesiones)</Text>
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
                    <View style={[
                        styles.dayCard,
                        isCurrent && styles.currentSessionCard
                    ]}>
                        {/* Header colapsable */}
                        <Pressable
                            style={styles.dayHeader}
                            onPress={() => toggleDay(`session-${sessionNum}`)}
                        >
                            <View style={styles.dayHeaderLeft}>
                                <Text style={styles.dayName}>
                                    {isCompleted ? '✅' : isCurrent ? '📍' : '⚪'} Sesión {sessionNum}: {day.name}
                                </Text>
                                <Text style={styles.exerciseCount}>
                                    {day.exercises?.length || 0} ejercicios
                                </Text>
                            </View>
                            <Text style={styles.expandIcon}>
                                {isExpanded ? '▼' : '▶'}
                            </Text>
                        </Pressable>

                        {/* Contenido expandido */}
                        {isExpanded && (
                            <View style={styles.dayContent}>
                                {/* Warm up */}
                                {day.warm_up && day.warm_up.length > 0 && (
                                    <View style={styles.section}>
                                        <Text style={styles.subsectionTitle}>🔥 Calentamiento:</Text>
                                        {day.warm_up.map((item, idx) => (
                                            <Text key={idx} style={styles.sectionItem}>• {item}</Text>
                                        ))}
                                    </View>
                                )}

                                {/* Ejercicios */}
                                <View style={styles.exercisesContainer}>
                                    {day.exercises?.sort((a, b) => a.order - b.order).map((exercise, idx) => (
                                        <View key={exercise._id} style={styles.exerciseItem}>
                                            <Text style={styles.exerciseName}>
                                                {idx + 1}. {exercise.name}
                                            </Text>
                                            <Text style={styles.exerciseDetails}>
                                                {exercise.targetSets} × {exercise.targetReps} reps
                                            </Text>
                                            <Text style={styles.exerciseMeta}>
                                                {exercise.muscle} • {exercise.equipment}
                                                {exercise.restTime ? ` • ${exercise.restTime}s descanso` : ''}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Cool down */}
                                {day.cool_down && day.cool_down.length > 0 && (
                                    <View style={styles.section}>
                                        <Text style={styles.subsectionTitle}>❄️ Enfriamiento:</Text>
                                        {day.cool_down.map((item, idx) => (
                                            <Text key={idx} style={styles.sectionItem}>• {item}</Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                );
            }}
        />
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
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 16,
    },
    header: {
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 10,
    },
    routineName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    progressCard: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
    },
    progressTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    progressText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 2,
    },
    progressSubtext: {
        fontSize: 14,
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
        backgroundColor: '#007AFF',
    },
    nextSessionCard: {
        backgroundColor: '#007AFF',
        padding: 16,
        marginBottom: 10,
    },
    nextSessionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
        opacity: 0.9,
        marginBottom: 4,
    },
    nextSessionDay: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 12,
    },
    startNextButton: {
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    startNextButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    daysSection: {
        padding: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        paddingHorizontal: 6,
    },
    dayCard: {
        backgroundColor: '#FFF',
        marginBottom: 10,
        borderRadius: 8,
        overflow: 'hidden',
    },
    currentSessionCard: {
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    dayHeaderLeft: {
        flex: 1,
    },
    dayName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    exerciseCount: {
        fontSize: 14,
        color: '#666',
    },
    expandIcon: {
        fontSize: 16,
        color: '#007AFF',
        marginLeft: 10,
    },
    dayContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    section: {
        marginBottom: 12,
        paddingTop: 12,
    },
    subsectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    sectionItem: {
        fontSize: 13,
        color: '#666',
        marginBottom: 2,
        paddingLeft: 8,
    },
    exercisesContainer: {
        paddingTop: 12,
    },
    exerciseItem: {
        marginBottom: 12,
        paddingLeft: 8,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    exerciseDetails: {
        fontSize: 14,
        color: '#007AFF',
        marginBottom: 2,
    },
    exerciseMeta: {
        fontSize: 12,
        color: '#999',
    },
    skipButton: {
        backgroundColor: '#FF9500',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    skipButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    continueButton: {
        backgroundColor: '#FF9500',  // Naranja para diferenciar
    },
    progressIndicator: {
        textAlign: 'center',
        fontSize: 14,
        color: '#FFF',
        marginTop: 8,
        opacity: 0.9,
    },
});