import { View, StyleSheet, FlatList, Pressable, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSets, deleteSet } from "../api/workoutApi";

// Design System
import { colors, spacing, radius } from '@/design-systems/tokens';
import { Text } from '@/design-systems/components';

const SetsList = ({ exerciseName, routineExerciseId, sessionNumber }) => {
    const queryClient = useQueryClient();

    const { data: allSets, isLoading, error } = useQuery({
        queryKey: ['sets'],
        queryFn: getSets
    });



    // Filtrar sets en el cliente
    const sets = allSets?.filter(set => {
        const matchesExercise = set.exercise === exerciseName;
        const matchesSession = sessionNumber ? set.sessionNumber === parseInt(sessionNumber) : true;

        return matchesExercise && matchesSession;
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSet,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sets'] });
            console.log('✅ Set deleted successfully!');
        },
        onError: (error) => {
            console.error('❌ Error deleting set:', error);
        }
    });

    const handleDelete = (setId) => {
        Alert.alert(
            'Eliminar Set',
            '¿Estás seguro de eliminar este set?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => deleteMutation.mutate(setId)
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text variant="bodySmall" color="neutral.gray500" align="center">
                    Cargando sets...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text variant="bodySmall" color="danger.main" align="center">
                    Error: {error.message}
                </Text>
            </View>
        );
    }

    if (!sets || sets.length === 0) {
        return (
            <View style={styles.container}>
                <Text variant="bodySmall" color="neutral.gray500" align="center">
                    No hay sets registrados aún
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text variant="body" color="neutral.gray600" bold style={styles.title}>
                Sets completados ({sets.length})
            </Text>

            <FlatList
                data={sets}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                    <Pressable
                        onLongPress={() => handleDelete(item._id)}
                        style={({ pressed }) => [
                            styles.setItem,
                            pressed && styles.setItemPressed
                        ]}
                    >
                        <View style={styles.setContent}>
                            <View style={styles.setNumber}>
                                <Text variant="body" color="primary.main" bold>
                                    {index + 1}
                                </Text>
                            </View>
                            <View style={styles.setDetails}>
                                <Text variant="body" color="neutral.gray600">
                                    {item.weight}kg × {item.reps} reps
                                </Text>
                                {item.notes && (
                                    <Text variant="caption" color="neutral.gray400">
                                        📝 {item.notes}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </Pressable>
                )}
            />

            <Text variant="caption" color="neutral.gray400" align="center" style={styles.hint}>
                💡 Mantén presionado para eliminar
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    title: {
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.sm + 2,
    },
    setItem: {
        backgroundColor: colors.neutral.white,
        marginBottom: spacing.xs,
        borderRadius: radius.base,
        marginHorizontal: spacing.sm + 2,
    },
    setItemPressed: {
        backgroundColor: colors.neutral.gray50,
    },
    setContent: {
        flexDirection: 'row',
        padding: spacing.md,
        alignItems: 'center',
    },
    setNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary.light,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    setDetails: {
        flex: 1,
    },
    hint: {
        marginTop: spacing.sm,
        paddingHorizontal: spacing.sm + 2,
    },
});

export default SetsList;