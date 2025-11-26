import { View, StyleSheet, ScrollView, Alert, Pressable, Modal, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeviceId } from '../../utils/deviceId';
import ExercisePicker from '../../components/ExercisePicker';
// API
import { createRoutine } from '../../api/routineApi';

// Design System
import { colors, spacing, radius, shadows, Icon } from '@/design-systems/tokens';
import { Text, Button, Card } from '@/design-systems/components';

// Components
import FormInput from '../../components/FormInput';

export default function ConfigureDaysScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Recibir parámetros del paso anterior
  const { routineName, description, totalDays, totalSessions } = useLocalSearchParams();
  const daysCount = parseInt(totalDays);

  console.log('Params recibidos:', { routineName, description, totalDays, totalSessions });

  // Estado de días
  const [days, setDays] = useState(
    Array.from({ length: daysCount }, (_, i) => ({
      id: `day-${i + 1}`,
      name: '',
      order: i + 1,
      exercises: [],
    }))
  );

  // Estado para día expandido
  const [expandedDay, setExpandedDay] = useState(0);

  // Validación
  const [errors, setErrors] = useState({});

  // Exercise Picker
  const [exercisePickerVisible, setExercisePickerVisible] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    const loadDeviceId = async () => {
      const id = await getDeviceId();
      setDeviceId(id);
    };
    loadDeviceId();
  }, []);

  // Modal de configuración de ejercicio
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseConfig, setExerciseConfig] = useState({
    sets: '3',
    reps: '10',
    restTime: '90',
  });

  // Mutation para crear rutina
  const createMutation = useMutation({
    mutationFn: createRoutine,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['routines'], exact: false });

      Alert.alert(
        '¡Rutina Creada! 🎉',
        `"${routineName}" ha sido creada exitosamente`,
        [
          {
            text: 'Ver Rutina',
            onPress: () => {
              router.replace('/');
              router.push(`/routines/${data._id}`);
            },
          },
        ]
      );
    },
    onError: (error) => {
      Alert.alert('Error', 'No se pudo crear la rutina. Intenta de nuevo.');
      console.error('Error creating routine:', error);
    },
  });

  const updateDayName = (index, name) => {
    const newDays = [...days];
    newDays[index].name = name;
    setDays(newDays);
  };

  const toggleDay = (index) => {
    setExpandedDay(expandedDay === index ? null : index);
  };

  const validateForm = () => {
    const newErrors = {};

    days.forEach((day, index) => {
      if (!day.name.trim()) {
        newErrors[`day-${index}`] = 'El nombre del día es obligatorio';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateRoutine = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor completa los nombres de todos los días');
      return;
    }

    const routineData = {
      deviceId,
      name: routineName,
      description: description || undefined,
      totalSessions: parseInt(totalSessions),
      days: days.map((day) => ({
        name: day.name,
        order: day.order,
        exercises: day.exercises,
      })),
      isActive: true,
    };
    // Debug temporal
    console.log('routineData a enviar:', routineData);
    createMutation.mutate(routineData);
  };

  const navigateToAddExercises = (dayIndex) => {
    setCurrentDayIndex(dayIndex);
    setExercisePickerVisible(true);
  };

  // Cuando se selecciona un ejercicio del picker
  const handleSelectExercise = (exercise) => {
    setSelectedExercise(exercise);
    setExerciseConfig({
      sets: '3',
      reps: '10',
      restTime: '90',
    });
    setConfigModalVisible(true);
  };

  // Confirmar y agregar ejercicio con la configuración
  const handleConfirmExercise = () => {
    if (!selectedExercise) return;

    const newDays = [...days];
    const newExercise = {
      id: `exercise-${Date.now()}`,
      name: selectedExercise.name,
      muscle: selectedExercise.muscle,
      equipment: selectedExercise.equipment,
      targetSets: parseInt(exerciseConfig.sets) || 3,
      targetReps: exerciseConfig.reps || '10',
      restTime: parseInt(exerciseConfig.restTime) || 90,
      order: newDays[currentDayIndex].exercises.length + 1,
    };

    newDays[currentDayIndex].exercises.push(newExercise);
    setDays(newDays);

    // Cerrar modal y limpiar
    setConfigModalVisible(false);
    setSelectedExercise(null);
  };

  const removeExercise = (dayIndex, exerciseId) => {
    const newDays = [...days];
    newDays[dayIndex].exercises = newDays[dayIndex].exercises.filter(
      ex => ex.id !== exerciseId
    );
    setDays(newDays);
  };

  const getDayPlaceholder = (index) => {
    const suggestions = {
      3: ['Push', 'Pull', 'Legs'],
      4: ['Upper', 'Lower', 'Push', 'Pull'],
      5: ['Push', 'Pull', 'Legs', 'Upper', 'Lower'],
      6: ['Push', 'Pull', 'Legs', 'Shoulders', 'Arms', 'Core'],
    };

    return suggestions[daysCount]?.[index] || `Día ${index + 1}`;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Configurar Días',
          headerBackTitle: 'Atrás',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h1" color="neutral.gray900">
            Días de la Rutina 📅
          </Text>
          <Text variant="body" color="neutral.gray600" style={{ marginTop: spacing.xs }}>
            Configura tus {daysCount} días
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>

        {/* Rutina info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="fitness" size={20} color={colors.primary.main} />
            <Text variant="bodyMedium" color="neutral.gray800" bold>
              {routineName}
            </Text>
          </View>
          {description && (
            <Text variant="bodySmall" color="neutral.gray600" style={{ marginTop: spacing.xs }}>
              {description}
            </Text>
          )}
          <View style={[styles.infoRow, { marginTop: spacing.sm }]}>
            <Icon name="calendar" size={16} color={colors.neutral.gray500} />
            <Text variant="bodySmall" color="neutral.gray600">
              {totalSessions} sesiones programadas
            </Text>
          </View>
        </Card>

        {/* Days list */}
        {days.map((day, index) => {
          const isExpanded = expandedDay === index;

          return (
            <Card key={day.id} style={styles.dayCard}>
              {/* Header clickeable */}
              <Pressable onPress={() => toggleDay(index)}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayNumber}>
                    <Text variant="h3" color="neutral.white">
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.dayInfo}>
                    <Text variant="bodyMedium" color="neutral.gray800" bold>
                      {day.name || `Día ${index + 1}`}
                    </Text>
                    <Text variant="caption" color="neutral.gray500">
                      {day.exercises.length} ejercicio{day.exercises.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Icon
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={colors.neutral.gray400}
                  />
                </View>
              </Pressable>

              {/* Contenido expandible */}
              {isExpanded && (
                <View style={styles.expandedContent}>
                  {/* Input para nombre */}
                  <FormInput
                    label="Nombre del día"
                    value={day.name}
                    onChangeText={(text) => updateDayName(index, text)}
                    placeholder={getDayPlaceholder(index)}
                    required
                    maxLength={30}
                    error={errors[`day-${index}`]}
                    style={{ marginBottom: spacing.md }}
                  />

                  {/* Sección de ejercicios */}
                  <View style={styles.exercisesSection}>
                    <View style={styles.exercisesHeader}>
                      <Text variant="bodySmall" color="neutral.gray700" bold>
                        Ejercicios
                      </Text>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="add"
                        onPress={() => navigateToAddExercises(index)}
                      >
                        Agregar
                      </Button>
                    </View>

                    {/* Lista de ejercicios */}
                    {day.exercises.length > 0 ? (
                      <View style={styles.exercisesList}>
                        {day.exercises.map((exercise) => (
                          <View key={exercise.id} style={styles.exerciseItem}>
                            <View style={{ flex: 1 }}>
                              <Text variant="bodySmall" color="neutral.gray800" bold>
                                {exercise.name}
                              </Text>
                              <Text variant="caption" color="neutral.gray500">
                                {exercise.targetSets}×{exercise.targetReps} • {exercise.restTime}s rest
                              </Text>
                            </View>
                            <Pressable
                              onPress={() => removeExercise(index, exercise.id)}
                              style={styles.removeButton}
                            >
                              <Icon name="trash" size={16} color={colors.danger.main} />
                            </Pressable>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={styles.emptyExercises}>
                        <Icon name="barbell" size={24} color={colors.neutral.gray300} />
                        <Text variant="caption" color="neutral.gray400">
                          Sin ejercicios agregados
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </Card>
          );
        })}

        {/* Quick tips */}
        <Card style={styles.tipsCard}>
          <Text variant="bodySmall" color="neutral.gray700" bold style={{ marginBottom: spacing.xs }}>
            💡 Tip
          </Text>
          <Text variant="caption" color="neutral.gray600">
            Toca cada día para expandirlo y configurar su nombre y ejercicios.
          </Text>
        </Card>
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomActions}>
        <Button
          variant="secondary"
          onPress={() => router.back()}
          style={{ flex: 1 }}
        >
          ← Atrás
        </Button>

        <Button
          variant="primary"
          onPress={handleCreateRoutine}
          loading={createMutation.isPending}
          icon="checkmark"
          style={{ flex: 2 }}
        >
          Crear Rutina
        </Button>
      </View>

      {/* Exercise Picker Modal */}
      <ExercisePicker
        visible={exercisePickerVisible}
        onClose={() => setExercisePickerVisible(false)}
        onSelectExercise={handleSelectExercise}
        selectedExerciseIds={
          currentDayIndex !== null
            ? days[currentDayIndex].exercises.map(ex => ex.name)
            : []
        }
      />

      {/* Modal de configuración de ejercicio */}
      <Modal
        visible={configModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setConfigModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.configModal}>
                {/* Header del modal */}
                <View style={styles.configHeader}>
                  <Text variant="h3" color="neutral.gray900">
                    Configurar Ejercicio
                  </Text>
                  <Pressable onPress={() => setConfigModalVisible(false)}>
                    <Icon name="close" size={24} color={colors.neutral.gray600} />
                  </Pressable>
                </View>

                {/* Nombre del ejercicio */}
                {selectedExercise && (
                  <View style={styles.exercisePreview}>
                    <Text variant="bodyMedium" color="neutral.gray800" bold>
                      {selectedExercise.name}
                    </Text>
                    <Text variant="caption" color="neutral.gray500">
                      {selectedExercise.muscle} • {selectedExercise.equipment}
                    </Text>
                  </View>
                )}

                {/* Inputs de configuración */}
                <View style={styles.configInputs}>
                  {/* Sets */}
                  <View style={styles.configRow}>
                    <Text variant="body" color="neutral.gray700">
                      Series
                    </Text>
                    <View style={styles.numberInput}>
                      <Pressable
                        style={styles.numberButton}
                        onPress={() => setExerciseConfig(prev => ({
                          ...prev,
                          sets: String(Math.max(1, parseInt(prev.sets) - 1))
                        }))}
                      >
                        <Icon name="remove" size={20} color={colors.primary.main} />
                      </Pressable>
                      <TextInput
                        style={styles.numberValue}
                        value={exerciseConfig.sets}
                        onChangeText={(text) => setExerciseConfig(prev => ({ ...prev, sets: text }))}
                        KeyboardType="numeric"
                        maxLength={2}
                        onSubmitEditing={() => Keyboard.dismiss()}
                      />
                      <Pressable
                        style={styles.numberButton}
                        onPress={() => setExerciseConfig(prev => ({
                          ...prev,
                          sets: String(parseInt(prev.sets) + 1)
                        }))}
                      >
                        <Icon name="add" size={20} color={colors.primary.main} />
                      </Pressable>
                    </View>
                  </View>

                  {/* Reps */}
                  <View style={styles.configRow}>
                    <Text variant="body" color="neutral.gray700">
                      Repeticiones
                    </Text>
                    <TextInput
                      style={styles.repsInput}
                      value={exerciseConfig.reps}
                      onChangeText={(text) => setExerciseConfig(prev => ({ ...prev, reps: text }))}
                      placeholder="10"
                      placeholderTextColor={colors.neutral.gray400}
                      KeyboardType="numeric"
                      returnKeyType="done"
                      onSubmitEditing={() => Keyboard.dismiss()}
                    />
                  </View>

                  {/* Rest Time */}
                  <View style={styles.configRow}>
                    <Text variant="body" color="neutral.gray700">
                      Descanso (seg)
                    </Text>
                    <View style={styles.numberInput}>
                      <Pressable
                        style={styles.numberButton}
                        onPress={() => setExerciseConfig(prev => ({
                          ...prev,
                          restTime: String(Math.max(15, parseInt(prev.restTime) - 15))
                        }))}
                      >
                        <Icon name="remove" size={20} color={colors.primary.main} />
                      </Pressable>
                      <TextInput
                        style={styles.numberValue}
                        value={exerciseConfig.restTime}
                        onChangeText={(text) => setExerciseConfig(prev => ({ ...prev, restTime: text }))}
                        KeyboardType="numeric"
                        maxLength={3}
                        returnKeyType="done"
                        onSubmitEditing={() => Keyboard.dismiss()}
                      />
                      <Pressable
                        style={styles.numberButton}
                        onPress={() => setExerciseConfig(prev => ({
                          ...prev,
                          restTime: String(parseInt(prev.restTime) + 15)
                        }))}
                      >
                        <Icon name="add" size={20} color={colors.primary.main} />
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* Botones de acción */}
                <View style={styles.configActions}>
                  <Button
                    variant="secondary"
                    onPress={() => setConfigModalVisible(false)}
                    containerStyle={{ flex: 1 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onPress={handleConfirmExercise}
                    containerStyle={{ flex: 1 }}
                  >
                    Agregar
                  </Button>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray100,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },

  // Header
  header: {
    marginBottom: spacing.lg,
  },

  // Progress bar
  progressBar: {
    height: 6,
    backgroundColor: colors.neutral.gray200,
    borderRadius: radius.base,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
  },

  // Info card
  infoCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.primary.main + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  // Day card
  dayCard: {
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  dayNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayInfo: {
    flex: 1,
  },

  // Expanded content
  expandedContent: {
    padding: spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },

  // Exercises section
  exercisesSection: {
    marginTop: spacing.sm,
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  exercisesList: {
    gap: spacing.xs,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray50,
    padding: spacing.sm,
    borderRadius: radius.base,
    gap: spacing.sm,
  },
  removeButton: {
    padding: spacing.xs,
  },
  emptyExercises: {
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.xs,
  },

  // Tips card
  tipsCard: {
    padding: spacing.md,
    backgroundColor: colors.neutral.gray50,
    marginTop: spacing.md,
  },

  // Bottom actions
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral.white,
    padding: spacing.lg,
    ...shadows.xl,
    flexDirection: 'row',
    gap: spacing.sm,
  },

  // Modal de configuración
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  configModal: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  exercisePreview: {
    backgroundColor: colors.neutral.gray50,
    padding: spacing.md,
    borderRadius: radius.base,
    marginBottom: spacing.lg,
  },
  configInputs: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  numberInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray100,
    borderRadius: radius.base,
    overflow: 'hidden',
  },
  numberButton: {
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  numberValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.neutral.gray800,
    textAlign: 'center',
    minWidth: 50,
    paddingVertical: spacing.sm,
  },
  repsInput: {
    backgroundColor: colors.neutral.gray100,
    borderRadius: radius.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.neutral.gray800,
    textAlign: 'center',
    width: 140,
  },
  configActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});