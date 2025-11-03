import { View, Text, ActivityIndicator, FlatList, StyleSheet, Pressable, Modal, TextInput, Button } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSets, updateSet } from "../api/workoutApi";
import { useState } from 'react';

const SetsList = ({ exerciseName, sessionNumber }) => {
    const queryClient = useQueryClient();
    const [editingSet, setEditingSet] = useState(null);
    const [editReps, setEditReps] = useState('');
    const [editWeight, setEditWeight] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['sets', exerciseName, sessionNumber],
        queryFn: getSets
    });

    // Mutation para actualizar
    const updateMutation = useMutation({
        mutationFn: ({ id, updates }) => updateSet(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sets'] });
            setEditingSet(null);
            console.log('✅ Set updated successfully!');
        },
        onError: (error) => {
            console.error('❌ Error updating set:', error.message);
        }
    });

    if (isLoading) { 
        return <ActivityIndicator /> 
    }

      const filteredSets = data?.filter(set => {
        const matchesExercise = set.exercise === exerciseName;
        const matchesSession = !sessionNumber || set.sessionNumber === Number(sessionNumber);
        
        /*console.log('🔍 Filtrando set:', {
            exercise: set.exercise,
            sessionNumber: set.sessionNumber,
            matchesExercise,
            matchesSession,
            shouldShow: matchesExercise && matchesSession
        }); */
        
        return matchesExercise && matchesSession;
    }) || [];

    /*console.log('📊 Sets filtrados para', exerciseName, 'sesión', sessionNumber, ':', filteredSets.length);*/

    if (filteredSets.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No sets recorded yet</Text>
            </View>
        );
    }

    const handleEdit = (item) => {
        setEditingSet(item);
        setEditReps(item.reps.toString());
        setEditWeight(item.weight.toString());
    };

    const handleSave = () => {
        if (!editReps || !editWeight) {
            console.log('Please enter reps and weight');
            return;
        }

        updateMutation.mutate({
            id: editingSet._id,
            updates: {
                exercise: exerciseName,
                reps: parseInt(editReps),
                weight: parseInt(editWeight)
            }
        });
    };

    const handleCancel = () => {
        setEditingSet(null);
        setEditReps('');
        setEditWeight('');
    };

    return (
        <View style={styles.container}>
              <Text style={styles.title}>
                Sets de hoy ({filteredSets.length})
            </Text>

            <FlatList 
                data={filteredSets}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.setItem}>
                        <View style={styles.setInfo}>
                            <Text style={styles.setText}>
                                {item.reps} reps × {item.weight} kg
                            </Text>
                            {item.createdAt && (
                                <Text style={styles.dateText}>
                                    {new Date(item.createdAt).toLocaleString()}
                                </Text>
                            )}
                        </View>
                        <Pressable 
                            style={styles.editButton}
                            onPress={() => handleEdit(item)}
                        >
                            <Text style={styles.editText}>Edit</Text>
                        </Pressable>
                    </View>
                )}
            />

            {/* Modal de edición */}
            <Modal
                visible={editingSet !== null}
                transparent={true}
                animationType="slide"
                onRequestClose={handleCancel}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Set</Text>
                        
                        <TextInput
                            value={editReps}
                            onChangeText={setEditReps}
                            placeholder="Reps"
                            style={styles.input}
                            keyboardType="numeric"
                        />
                        
                        <TextInput
                            value={editWeight}
                            onChangeText={setEditWeight}
                            placeholder="Weight"
                            style={styles.input}
                            keyboardType="numeric"
                        />

                        <View style={styles.modalButtons}>
                            <Button 
                                title="Cancel" 
                                onPress={handleCancel}
                                color="#999"
                            />
                            <Button 
                                title={updateMutation.isPending ? "Saving..." : "Save"}
                                onPress={handleSave}
                                disabled={updateMutation.isPending}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 6,
        gap: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 5,
    },
    setItem: {
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 4,
        marginBottom: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    setInfo: {
        flex: 1,
    },
    setText: {
        fontSize: 16,
        fontWeight: '500',
    },
    dateText: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    editButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    editText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    emptyContainer: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 6,
        alignItems: 'center',
    },
    emptyText: {
        color: 'gray',
        fontSize: 16,
    },
    // Estilos del modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        gap: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: 'gainsboro',
        padding: 10,
        borderRadius: 5,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    }
});

export default SetsList;