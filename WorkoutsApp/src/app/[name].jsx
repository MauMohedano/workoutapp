import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getExerciseByName } from "../api/workoutApi";
import NewSetInput from "../components/NewSetInput";
import SetsList from "../components/SetsList";


export default function ExerciseDetailsScreen() {
    const { name } = useLocalSearchParams();
    const { data, isLoading, error } = useQuery({
        queryKey: ['exercises', name],
        queryFn: () => getExerciseByName(name)
    })

    const [isInstructionExpanded, setIsInstructionExpanded] = useState(false);

    if (isLoading) {
        return <ActivityIndicator />
    }

    if (error) {
        return <Text>Something went wrong: {error.message}</Text>
    }

    const exercise = data[0]

    if (!exercise) {
        return <Text>Exercise not found</Text>

    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Stack.Screen options={{ title: exercise.name }} />
            <View style={styles.panel}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseSubtitle}>
                    <Text style={styles.subValue}>{exercise.muscle} </Text>|
                    Equipment: <Text style={styles.subValue}>{exercise.equipment}</Text>
                </Text>
            </View>
            <View style={styles.panel}>
                <Text numberOfLines={isInstructionExpanded ? 0 : 3} style={styles.instructions}> {exercise.instructions}</Text>
                <Text onPress={() => setIsInstructionExpanded(!isInstructionExpanded)} style={styles.seeMore}>
                    {isInstructionExpanded ? 'See Less' : 'See More'}
                </Text>
            </View>
            <NewSetInput exerciseName={exercise.name} />
            <SetsList exerciseName={exercise.name} />

        </ScrollView>
    )
}




const styles = StyleSheet.create({
    container: {
        padding: 10,
        gap: 10,
    },
    panel: {
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 6,
        gap: 4,

    },
    exerciseName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    exerciseSubtitle: {
        color: 'gray',
    },
    exerciseSubtitle: {
        textTransform: 'capitalize'
    },
    instructions: {
        fontSize: 16,
        lineHeight: 22,
    },
    seeMore: {
        alignSelf: 'center',
        padding: 10,
        fontWeight: '600',
        color: 'gray'
    }
})