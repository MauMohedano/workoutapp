import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSet } from "../api/workoutApi";
import ResetTimer from "./ResetTimer";

// Design System
import { colors, spacing, radius, shadows, Icon } from '@/design-systems/tokens';
import { Button, Text } from '@/design-systems/components';

const NewSetInput = ({ 
  exerciseName, 
  routineExerciseId, 
  sessionNumber,
  deviceId,        
  routineId,      
  restTime = 90,
  targetSets = 4,
  targetReps = 10,
  variant = 'default',  // 'default' | 'compact'
  onSetAdded  // Callback opcional cuando se agrega un set
}) => {
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [showTimer, setShowTimer] = useState(false);

  const queryClient = useQueryClient();

 const mutation = useMutation({
    mutationFn: createSet,
    onSuccess: () => {
      // ✅ Invalidar queries específicas
      queryClient.invalidateQueries({ queryKey: ['sets'] });
      queryClient.invalidateQueries({ queryKey: ['sessionSets', deviceId, routineId, sessionNumber] }); // ← AGREGAR ESTO
      queryClient.invalidateQueries({ queryKey: ['allSets', deviceId, routineId] }); // ← AGREGAR ESTO

      // Limpiar inputs
      setReps('');
      setWeight('');

      // Mostrar timer automáticamente (solo en default)
      if (variant === 'default') {
        setShowTimer(true);
      }

      // Callback opcional
      if (onSetAdded) {
        onSetAdded();
      }

      
    },
    onError: (error) => {
      console.error('❌ Error adding set:', error.message);
    }
  });

  const addSet = () => {
    if (!reps || !weight) {
      
      return;
    }

    if (!exerciseName) {
      
      return;
    }

    mutation.mutate({
      exercise: exerciseName,
      reps: parseInt(reps),
      weight: parseFloat(weight),
      sessionNumber: sessionNumber ? parseInt(sessionNumber) : undefined,
      routineExerciseId: routineExerciseId || undefined,
      deviceId,      
      routineId      
    });
  };

  const handleTimerComplete = () => {
    setShowTimer(false);
    
  };

  // Funciones de incremento/decremento (solo para default)
  const adjustWeight = (delta) => {
    const currentWeight = parseFloat(weight) || 0;
    const newWeight = Math.max(0, currentWeight + delta);
    setWeight(newWeight.toString());
  };

  const adjustReps = (delta) => {
    const currentReps = parseInt(reps) || 0;
    const newReps = Math.max(0, currentReps + delta);
    setReps(newReps.toString());
  };

  // ===== COMPACT VARIANT =====
  if (variant === 'compact') {
    return (
      <>
        {showTimer && (
          <ResetTimer
            restTime={restTime}
            onComplete={handleTimerComplete}
          />
        )}

        <View style={styles.compactContainer}>
          {/* Weight Input */}
          <View style={styles.compactInputGroup}>
            <TextInput
              style={styles.compactInput}
              placeholder="Peso"
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={setWeight}
              placeholderTextColor={colors.neutral.gray400}
            />
            <Text variant="caption" color="neutral.gray600" style={styles.compactUnit}>
              kg
            </Text>
          </View>

          {/* Reps Input */}
          <View style={styles.compactInputGroup}>
            <TextInput
              style={styles.compactInput}
              placeholder="Reps"
              keyboardType="number-pad"
              value={reps}
              onChangeText={setReps}
              placeholderTextColor={colors.neutral.gray400}
            />
            <Text variant="caption" color="neutral.gray600" style={styles.compactUnit}>
              reps
            </Text>
          </View>

          {/* Button */}
          <Button
            variant="primary"
            size="md"
            onPress={addSet}
            disabled={mutation.isPending || !weight || !reps}
            loading={mutation.isPending}
            style={styles.compactButton}
          >
            {mutation.isPending ? "..." : "GUARDAR"}
          </Button>
        </View>
      </>
    );
  }

  // ===== DEFAULT VARIANT =====
  return (
    <>
      {/* Timer de descanso */}
      {showTimer && (
        <ResetTimer
          restTime={restTime}
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
              keyboardType="decimal-pad"
              placeholderTextColor={colors.neutral.gray400}
              maxLength={5}
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
              keyboardType="number-pad"
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
          icon="checkmark-circle"
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
  // ===== DEFAULT VARIANT STYLES =====
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
  addButton: {
    marginTop: spacing.sm,
    ...shadows.md,
  },
  targetHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs - 2,
    marginTop: spacing.md,
  },

  // ===== COMPACT VARIANT STYLES =====
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral.white,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
    marginHorizontal: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  compactInputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray50,
    borderRadius: radius.base,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  compactInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray800,
    paddingVertical: spacing.sm,
    textAlign: 'center',
  },
  compactUnit: {
    marginLeft: spacing.xs - 2,
  },
  compactButton: {
    flex: 1.2,
    minWidth: 100,
  },
});

export default NewSetInput;