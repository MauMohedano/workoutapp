import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import exercises from "../../assets/data/exercises.json";
import { useState } from "react";

export default function ExerciseDetailsScreen() {
    const params = useLocalSearchParams();

    const [isInstructionExpanded, setIsInstructionExpanded] = useState(false);

    const exercise = exercises.find(ex => ex.name === params.name);

    if (!exercise) {
        return <Text>Exercise not found</Text>

    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Stack.Screen options={{ title: exercise.name }} />
            <View style={styles.panel}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseSubtitle}>
                    <Text style={styles.exerciseSubtitle}>{exercise.muscle} </Text>|
                    Equipment: <Text style={styles.exerciseSubtitle}>{exercise.equipment}</Text>
                </Text>
            </View>
            <View style={styles.panel}>
                <Text numberOfLines={isInstructionExpanded ? 0 : 3} style={styles.instructions}> {exercise.instructions}</Text>
            </View>
            <Text onPress={() => setIsInstructionExpanded(!isInstructionExpanded)} style={styles.seeMore}>
                {isInstructionExpanded ? 'See Less' : 'See More'}
            </Text>
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