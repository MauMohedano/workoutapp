import { View, StyleSheet, Modal, FlatList, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// Design System
import { colors, spacing, radius, shadows, Icon } from '@/design-systems/tokens';
import { Text, Button } from '@/design-systems/components';

// API
import { searchExercises } from '../api/exerciseCatalogApi';

export default function ExercisePicker({ visible, onClose, onSelectExercise, selectedExerciseIds = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState(null); // null = mostrar grupos

  // Muscle groups con iconos y nombres display
  const muscleGroups = [
    { id: 'chest', name: 'Chest', icon: 'body' },
    { id: 'back', name: 'Back', icon: 'body' },
    { id: 'shoulders', name: 'Shoulders', icon: 'body' },
    { id: 'biceps', name: 'Biceps', icon: 'arm' },
    { id: 'triceps', name: 'Triceps', icon: 'arm' },
    { id: 'forearms', name: 'Forearms', icon: 'arm' },
    { id: 'quadriceps', name: 'Quadriceps', icon: 'body' },
    { id: 'hamstrings', name: 'Hamstrings', icon: 'body' },
    { id: 'glutes', name: 'Glutes', icon: 'body' },
    { id: 'calves', name: 'Calves', icon: 'body' },
    { id: 'abdominals', name: 'Abdominals', icon: 'body' },
    { id: 'lats', name: 'Lats', icon: 'body' },
    { id: 'lower_back', name: 'Lower Back', icon: 'body' },
    { id: 'middle_back', name: 'Middle Back', icon: 'body' },
    { id: 'traps', name: 'Traps', icon: 'body' },
    { id: 'neck', name: 'Neck', icon: 'body' },
  ];

  // Query para buscar ejercicios (solo cuando hay músculo seleccionado o búsqueda)
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['exercise-search', searchQuery, selectedMuscle],
    queryFn: () => searchExercises({
      q: searchQuery,
      muscle: selectedMuscle || '',
      limit: 50
    }),
    enabled: visible && (!!selectedMuscle || searchQuery.length > 0),
  });

  // Refetch cuando cambian los filtros
  useEffect(() => {
    if (visible && (selectedMuscle || searchQuery)) {
      refetch();
    }
  }, [searchQuery, selectedMuscle, visible]);

  // Reset al cerrar
  useEffect(() => {
    if (!visible) {
      setSelectedMuscle(null);
      setSearchQuery('');
    }
  }, [visible]);

  // Filtrar ejercicios ya seleccionados
  const exercises = data?.exercises?.filter(
    ex => !selectedExerciseIds.includes(ex._id || ex.name)
  ) || [];

  const handleBack = () => {
    setSelectedMuscle(null);
    setSearchQuery('');
  };

  const renderMuscleGroup = ({ item }) => (
    <Pressable
      style={styles.muscleItem}
      onPress={() => setSelectedMuscle(item.id)}
    >
      <View style={styles.muscleIcon}>
        <Icon name="barbell" size={24} color={colors.primary.main} />
      </View>
      <Text variant="bodyMedium" color="neutral.gray800" bold style={{ flex: 1 }}>
        {item.name}
      </Text>
      <Icon name="chevron-forward" size={20} color={colors.neutral.gray400} />
    </Pressable>
  );

  const renderExercise = ({ item }) => (
    <Pressable
      style={styles.exerciseItem}
      onPress={() => {
        onSelectExercise(item);
        onClose();
      }}
    >
      <View style={styles.exerciseIcon}>
        <Icon name="barbell" size={24} color={colors.primary.main} />
      </View>

      <View style={styles.exerciseInfo}>
        <Text variant="bodyMedium" color="neutral.gray800" bold>
          {item.name}
        </Text>
        <View style={styles.exerciseMeta}>
          <View style={styles.metaBadge}>
            <Icon name="body" size={12} color={colors.neutral.gray600} />
            <Text variant="caption" color="neutral.gray600">
              {item.muscle}
            </Text>
          </View>
          <View style={styles.metaBadge}>
            <Icon name="fitness" size={12} color={colors.neutral.gray600} />
            <Text variant="caption" color="neutral.gray600">
              {item.equipment}
            </Text>
          </View>
        </View>
      </View>

      <Icon name="add-circle" size={24} color={colors.primary.main} />
    </Pressable>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {selectedMuscle && (
              <Pressable onPress={handleBack} style={styles.backButton}>
                <Icon name="arrow-back" size={24} color={colors.neutral.gray800} />
              </Pressable>
            )}
            <View>
              <Text variant="h2" color="neutral.gray900">
                {selectedMuscle 
                  ? muscleGroups.find(m => m.id === selectedMuscle)?.name 
                  : 'Seleccionar Ejercicio'}
              </Text>
              {selectedMuscle && data && (
                <Text variant="bodySmall" color="neutral.gray600">
                  {data.count || 0} ejercicios
                </Text>
              )}
            </View>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={28} color={colors.neutral.gray800} />
          </Pressable>
        </View>

        {/* Search - Solo visible cuando hay músculo seleccionado o queremos buscar global */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.neutral.gray500} />
          <TextInput
            style={styles.searchInput}
            placeholder={selectedMuscle ? "Buscar en este grupo..." : "Buscar ejercicio..."}
            placeholderTextColor={colors.neutral.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={colors.neutral.gray400} />
            </Pressable>
          )}
        </View>

        {/* Content */}
        {!selectedMuscle && !searchQuery ? (
          // Vista de grupos musculares
          <FlatList
            data={muscleGroups}
            keyExtractor={(item) => item.id}
            renderItem={renderMuscleGroup}
            contentContainerStyle={styles.listContent}
          />
        ) : isLoading ? (
          // Loading
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text variant="body" color="neutral.gray600" style={{ marginTop: spacing.md }}>
              Buscando ejercicios...
            </Text>
          </View>
        ) : (
          // Lista de ejercicios
          <FlatList
            data={exercises}
            keyExtractor={(item) => item._id || item.name}
            renderItem={renderExercise}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon name="search" size={48} color={colors.neutral.gray400} />
                <Text variant="body" color="neutral.gray600" align="center">
                  No se encontraron ejercicios
                </Text>
                <Text variant="bodySmall" color="neutral.gray500" align="center">
                  Intenta con otro término de búsqueda
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray100,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl + 20,
    backgroundColor: colors.neutral.white,
    ...shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  closeButton: {
    padding: spacing.xs,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.neutral.gray800,
  },

  // List content
  listContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },

  // Muscle group item
  muscleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadows.sm,
  },
  muscleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Exercise item
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadows.sm,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
    gap: spacing.xs - 2,
  },
  exerciseMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty state
  emptyState: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
    gap: spacing.md,
  },
});