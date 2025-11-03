import { View, Text, StyleSheet, TextInput, Button, Alert } from "react-native"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createSet } from "../api/workoutApi"
import ResetTimer from "./ResetTimer"

const NewSetInput = ({ exerciseName, routineExerciseId, sessionNumber, resetTime = 90 }) => {
    const [reps, setReps] = useState('')
    const [weight, setWeight] = useState('')
    const [showTimer, setShowTimer] = useState(false)

    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: createSet,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sets'] })

            // Limpiar inputs
            setReps('')
            setWeight('')

            // Mostrar timer automáticamente
            setShowTimer(true)

            console.log('✅ Set added successfully!')
        },
        onError: (error) => {
            console.error('❌ Error adding set:', error.message)
        }
    })

    const addSet = () => {
        if (!reps || !weight) {
            console.log('Please enter reps and weight')
            return
        }

        if (!exerciseName) {
            console.log('Exercise name is missing')
            return
        }

        mutation.mutate({
            exercise: exerciseName,
            reps: parseInt(reps),
            weight: parseInt(weight),
            sessionNumber: sessionNumber ? parseInt(sessionNumber) : undefined,
            routineExerciseId: routineExerciseId || undefined
        })
    }

    const handleTimerComplete = () => {
        setShowTimer(false)
        console.log('⏱️ Rest complete!')
    }

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
                />
                <TextInput
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="Weight"
                    style={styles.input}
                    keyboardType="numeric"
                />
                <Button
                    title={mutation.isPending ? "Adding..." : "Add"}
                    onPress={addSet}
                    disabled={mutation.isPending}
                />
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 6,
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    input: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'gainsboro',
        padding: 10,
        flex: 1,
        borderRadius: 5,
    }
})

export default NewSetInput