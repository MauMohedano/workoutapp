import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createSet, getSets } from "../api/workoutApi";
import ResetTimer from "./ResetTimer";

// Design System
import { colors, spacing, radius, shadows, Icon } from '@/design-systems/tokens';
import { Button, Text } from '@/design-systems/components';

const NewSetInput = ({ 
  exerciseName, 
  routineExerciseId, 
  sessionNumber, 
  resetTime = 90,
  targetSets = 4,
  targetReps = 10 
}) => {
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [showTimer, setShowTimer] = useState(false);

  const queryClient = useQueryClient();

 


  const mutation = useMutation({
    mutationFn: createSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sets'] });

      // Limpiar inputs
      setReps('');
      setWeight('');

      // Mostrar timer automáticamente
      setShowTimer(true);

      console.log('✅ Set added successfully!');
    },
    onError: (error) => {
      console.error('❌ Error adding set:', error.message);
    }
  });

  const addSet = () => {
    if (!reps || !weight) {
      console.log('Please enter reps and weight');
      return;
    }

    if (!exerciseName) {
      console.log('Exercise name is missing');
      return;
    }

    mutation.mutate({
      exercise: exerciseName,
      reps: parseInt(reps),
      weight: parseInt(weight),
      sessionNumber: sessionNumber ? parseInt(sessionNumber) : undefined,
      routineExerciseId: routineExerciseId || undefined
    });
  };

  const handleTimerComplete = () => {
    setShowTimer(false);
    console.log('⏱️ Rest complete!');
  };

  // Funciones de incremento/decremento
  const adjustWeight = (delta) => {
    const currentWeight = parseInt(weight) || 0;
    const newWeight = Math.max(0, currentWeight + delta);
    setWeight(newWeight.toString());
  };

  const adjustReps = (delta) => {
    const currentReps = parseInt(reps) || 0;
    const newReps = Math.max(0, currentReps + delta);
    setReps(newReps.toString());
  };


  return (
    <>
      {/* Timer de descanso */}
      {showTimer && (
        <ResetTimer
          restTime={resetTime}
          onComplete={handleTimerComplete}
        />
      )}

          {/* Input principal */}
      <View style={styles.container}>
        <Text variant="h3" color="neutral.gray800" style={styles.title}>
          Agregar Set
        </Text>

        {/* Input de Peso */}
        <View style={styles.inputSection}>
          <Text variant="bodySmall" color="neutral.gray500" style={styles.label}>
            Peso (kg)
          </Text>
          <View style={styles.inputRow}>
            <Pressable
              style={styles.adjustButton}
              onPress={() => adjustWeight(-2.5)}
            >
              <Icon name="remove" size={24} color={colors.primary.main} />
            </Pressable>

            <TextInput
              value={weight}
              onChangeText={setWeight}
              placeholder="0"
              style={styles.inputLarge}
              keyboardType="numeric"
              placeholderTextColor={colors.neutral.gray400}
              maxLength={4}
            />

            <Pressable
              style={styles.adjustButton}
              onPress={() => adjustWeight(2.5)}
            >
              <Icon name="add" size={24} color={colors.primary.main} />
            </Pressable>
          </View>
        </View>

        {/* Input de Reps */}
        <View style={styles.inputSection}>
          <Text variant="bodySmall" color="neutral.gray500" style={styles.label}>
            Repeticiones
          </Text>
          <View style={styles.inputRow}>
            <Pressable
              style={styles.adjustButton}
              onPress={() => adjustReps(-1)}
            >
              <Icon name="remove" size={24} color={colors.primary.main} />
            </Pressable>

            <TextInput
              value={reps}
              onChangeText={setReps}
              placeholder={targetReps?.toString() || "0"}
              style={styles.inputLarge}
              keyboardType="numeric"
              placeholderTextColor={colors.neutral.gray400}
              maxLength={3}
            />

            <Pressable
              style={styles.adjustButton}
              onPress={() => adjustReps(1)}
            >
              <Icon name="add" size={24} color={colors.primary.main} />
            </Pressable>
          </View>
        </View>

        {/* Botón de agregar */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon="success"
          onPress={addSet}
          disabled={mutation.isPending || !weight || !reps}
          loading={mutation.isPending}
          style={styles.addButton}
        >
          {mutation.isPending ? "Agregando..." : "✓ Completar Set"}
        </Button>

        {/* Hint de target */}
        {targetSets && targetReps && (
          <View style={styles.targetHint}>
            <Icon name="target" size={14} color={colors.neutral.gray400} />
            <Text variant="caption" color="neutral.gray400">
              Target: {targetSets} sets × {targetReps} reps
            </Text>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  // Main container
  container: {
    backgroundColor: colors.neutral.white,
    padding: spacing.lg,
    borderRadius: radius.xl,
    marginHorizontal: spacing.sm + 2,
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  title: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },

  // Input sections
  inputSection: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  adjustButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  inputLarge: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.neutral.gray800,
    backgroundColor: colors.neutral.gray50,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderColor: colors.neutral.gray200,
  },

  // Add button
  addButton: {
    marginTop: spacing.sm,
    ...shadows.md,
  },

  // Target hint
  targetHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs - 2,
    marginTop: spacing.md,
  },
});

export default NewSetInput;