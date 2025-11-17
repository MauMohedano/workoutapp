import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
  const { routineName, description, totalDays } = useLocalSearchParams();
  const daysCount = parseInt(totalDays);

  // Estado de días
  const [days, setDays] = useState(
    Array.from({ length: daysCount }, (_, i) => ({
      id: `day-${i + 1}`,
      name: '',
      order: i + 1,
      exercises: [],
    }))
  );

  // Validación
  const [errors, setErrors] = useState({});

  const [exercisePickerVisible, setExercisePickerVisible] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(null);

  // Mutation para crear rutina
  const createMutation = useMutation({
    mutationFn: createRoutine,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });

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

    // Confirmar creación
    Alert.alert(
      'Crear Rutina',
      '¿Deseas crear esta rutina sin ejercicios? Podrás agregarlos después.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Crear',
          onPress: async () => {
            const routineData = {
              name: routineName,
              description: description || undefined,
              days: days.map((day) => ({
                name: day.name,
                order: day.order,
                exercises: [], // Por ahora vacío - se agregarán después
              })),
              isActive: true,
            };

            createMutation.mutate(routineData);
          },
        },
      ]
    );
  };

  const navigateToAddExercises = (dayIndex) => {
    setCurrentDayIndex(dayIndex);
    setExercisePickerVisible(true);
  };

  const handleSelectExercise = (exercise) => {
    // Agregar ejercicio al día actual
    const newDays = [...days];
    const newExercise = {
      id: `exercise-${Date.now()}`,
      name: exercise.name,
      muscle: exercise.muscle,
      equipment: exercise.equipment,
      targetSets: exercise.defaultSets || 3,
      targetReps: exercise.defaultReps || 10,
      restTime: exercise.defaultRest || 90,
      order: newDays[currentDayIndex].exercises.length + 1,
    };

    newDays[currentDayIndex].exercises.push(newExercise);
    setDays(newDays);

    Alert.alert(
      'Ejercicio Agregado ✅',
      `${exercise.name} agregado a ${newDays[currentDayIndex].name || `Día ${currentDayIndex + 1}`}`
    );
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
            Paso 2 de 3: Configura tus {daysCount} días
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
        </Card>

        {/* Days list */}
        {days.map((day, index) => (
          <Card key={day.id} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <View style={styles.dayNumber}>
                <Text variant="h3" color="neutral.white">
                  {index + 1}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <FormInput
                  label={`Día ${index + 1}`}
                  value={day.name}
                  onChangeText={(text) => updateDayName(index, text)}
                  placeholder={getDayPlaceholder(index)}
                  required
                  maxLength={30}
                  error={errors[`day-${index}`]}
                  style={{ marginBottom: 0 }}
                />
              </View>
            </View>

            {/* Exercises count */}
            {/* Exercises section */}
            <View style={styles.exercisesSection}>
              <View style={styles.exercisesHeader}>
                <View style={styles.exercisesCount}>
                  <Icon name="barbell" size={16} color={colors.neutral.gray500} />
                  <Text variant="bodySmall" color="neutral.gray600">
                    {day.exercises.length} ejercicio{day.exercises.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="add"
                  onPress={() => navigateToAddExercises(index)}
                >
                  Agregar
                </Button>
              </View>

              {/* Lista de ejercicios agregados */}
              {day.exercises.length > 0 && (
                <View style={styles.exercisesList}>
                  {day.exercises.map((exercise) => (
                    <View key={exercise.id} style={styles.exerciseItem}>
                      <View style={{ flex: 1 }}>
                        <Text variant="bodySmall" color="neutral.gray800" bold>
                          • {exercise.name}
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
              )}
            </View>
          </Card>
        ))}

        {/* Quick tips */}
        <Card style={styles.tipsCard}>
          <Text variant="bodySmall" color="neutral.gray700" bold style={{ marginBottom: spacing.xs }}>
            💡 Sugerencias de nombres:
          </Text>
          <Text variant="caption" color="neutral.gray600">
            • PPL: Push, Pull, Legs{'\n'}
            • Upper/Lower: Tren Superior, Tren Inferior{'\n'}
            • Grupos musculares: Pecho, Espalda, Piernas, etc.
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
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  dayNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24, // Alineado con el input
  },
  exercisesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  addButton: {
    marginLeft: 'auto',
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
  /*
  // Exercises section
  exercisesSection: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  exercisesCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
  },*/
});