import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getExerciseByName } from "../api/workoutApi";
import NewSetInput from "../components/NewSetInput";
import SetsList from "../components/SetsList";
import { colors, spacing, radius } from '@/design-systems/tokens';
import { Text } from '@/design-systems/components';

export default function ExerciseDetailsScreen() {
    const { name } = useLocalSearchParams();
    const { data, isLoading, error } = useQuery({
        queryKey: ['exercises', name],
        queryFn: () => getExerciseByName(name)
    })

    const [isInstructionExpanded, setIsInstructionExpanded] = useState(false);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text variant="body" color="danger.main">
                    Something went wrong: {error.message}
                </Text>
            </View>
        );
    }

    const exercise = data[0]

    if (!exercise) {
        return (
            <View style={styles.centerContainer}>
                <Text variant="body" color="neutral.gray600">
                    Exercise not found
                </Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Stack.Screen options={{ title: exercise.name }} />
            
            <View style={styles.panel}>
                <Text variant="h2" color="neutral.gray800" style={styles.exerciseName}>
                    {exercise.name}
                </Text>
                <Text variant="bodySmall" color="neutral.gray500" style={styles.exerciseSubtitle}>
                    <Text variant="bodySmall" color="primary.main" style={styles.subValue}>
                        {exercise.muscle}
                    </Text> | Equipment: <Text variant="bodySmall" color="primary.main" style={styles.subValue}>
                        {exercise.equipment}
                    </Text>
                </Text>
            </View>
            
            <View style={styles.panel}>
                <Text 
                    numberOfLines={isInstructionExpanded ? 0 : 3} 
                    variant="body"
                    color="neutral.gray600"
                    style={styles.instructions}
                >
                    {exercise.instructions}
                </Text>
                <Text 
                    onPress={() => setIsInstructionExpanded(!isInstructionExpanded)} 
                    variant="bodySmall"
                    color="primary.main"
                    style={styles.seeMore}
                >
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
        padding: spacing.sm + 2,
        gap: spacing.sm + 2,
        backgroundColor: colors.neutral.gray100,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
        backgroundColor: colors.neutral.gray100,
    },
    panel: {
        backgroundColor: colors.backgrounds?.elevated || colors.neutral.white,
        padding: spacing.sm + 2,
        borderRadius: radius.base,
        gap: spacing.xs,
    },
    exerciseName: {
        marginBottom: spacing.xs,
    },
    exerciseSubtitle: {
        textTransform: 'capitalize',
    },
    subValue: {
        fontWeight: '600',
    },
    instructions: {
        lineHeight: 22,
    },
    seeMore: {
        alignSelf: 'center',
        padding: spacing.sm + 2,
        fontWeight: '600',
    }
});