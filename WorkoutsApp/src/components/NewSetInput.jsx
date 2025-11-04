import { View, StyleSheet, TextInput } from "react-native";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSet } from "../api/workoutApi";
import ResetTimer from "./ResetTimer";

// Design System
import { colors, spacing, radius } from '@/design-systems/tokens';
import { Button } from '@/design-systems/components';

const NewSetInput = ({ exerciseName, routineExerciseId, sessionNumber, resetTime = 90 }) => {
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

    return (
        <>
            {/* Timer de descanso */}
            {showTimer && (
                <ResetTimer
                    resetTime={resetTime}
                    onComplete={handleTimerComplete}
                />
            )}

            {/* Input de sets */}
            <View style={styles.container}>
                <TextInput
                    value={reps}
                    onChangeText={setReps}
                    placeholder="Reps"
                    style={styles.input}
                    keyboardType="numeric"
                    placeholderTextColor={colors.neutral.gray400}
                />
                <TextInput
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="Weight"
                    style={styles.input}
                    keyboardType="numeric"
                    placeholderTextColor={colors.neutral.gray400}
                />
                <Button
                    variant="primary"
                    size="md"
                    onPress={addSet}
                    disabled={mutation.isPending}
                    loading={mutation.isPending}
                    style={styles.addButton}
                >
                    {mutation.isPending ? "Adding..." : "Add"}
                </Button>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.neutral.white,
        padding: spacing.sm + 2,
        borderRadius: radius.base,
        flexDirection: 'row',
        gap: spacing.sm + 2,
        marginBottom: spacing.sm + 2,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.neutral.gray200,
        backgroundColor: colors.neutral.white,
        padding: spacing.sm + 2,
        flex: 1,
        borderRadius: radius.sm,
        fontSize: 16,
        color: colors.neutral.gray600,
    },
    addButton: {
        minWidth: 80,
    }
});

export default NewSetInput;