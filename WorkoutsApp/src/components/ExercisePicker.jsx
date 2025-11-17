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
  const [selectedMuscle, setSelectedMuscle] = useState('');

  // Muscle groups disponibles
  const muscleGroups = [
    'abdominals', 'abductors', 'adductors', 'biceps', 'calves',
    'chest', 'forearms', 'glutes', 'hamstrings', 'lats',
    'lower_back', 'middle_back', 'neck', 'quadriceps', 'traps', 'triceps'
  ];

  // Query para buscar ejercicios
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['exercise-search', searchQuery, selectedMuscle],
    queryFn: () => searchExercises({
      q: searchQuery,
      muscle: selectedMuscle,
      limit: 50
    }),
    enabled: visible, // Solo buscar cuando el modal está visible
  });

  // Refetch cuando cambian los filtros
  useEffect(() => {
    if (visible) {
      refetch();
    }
  }, [searchQuery, selectedMuscle, visible]);

  // Filtrar ejercicios ya seleccionados
  const exercises = data?.exercises?.filter(
    ex => !selectedExerciseIds.includes(ex._id || ex.name)
  ) || [];

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
            <Icon name="dumbbell" size={12} color={colors.neutral.gray600} />
            <Text variant="caption" color="neutral.gray600">
              {item.equipment}
            </Text>
          </View>
          {item.difficulty && (
            <View style={styles.metaBadge}>
              <Text variant="caption" color="neutral.gray500">
                {item.difficulty}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Icon name="chevron-forward" size={20} color={colors.neutral.gray400} />
    </Pressable>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="h2" color="neutral.gray900">
              Seleccionar Ejercicio
            </Text>
            <Text variant="bodySmall" color="neutral.gray600">
              {data?.count || 0} ejercicios • {data?.source === 'hybrid' ? 'DB + API Ninja' : data?.source || ''}
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={28} color={colors.neutral.gray800} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.neutral.gray500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ejercicio... (ej: bench press)"
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

        {/* Muscle filter */}
        <View style={styles.filters}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={['Todos', ...muscleGroups]}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.filterChip,
                  (item === 'Todos' && !selectedMuscle) && styles.filterChipActive,
                  selectedMuscle === item && styles.filterChipActive,
                ]}
                onPress={() => setSelectedMuscle(item === 'Todos' ? '' : item)}
              >
                <Text
                  variant="caption"
                  color={
                    (item === 'Todos' && !selectedMuscle) || selectedMuscle === item
                      ? 'neutral.white'
                      : 'neutral.gray700'
                  }
                  bold={(item === 'Todos' && !selectedMuscle) || selectedMuscle === item}
                >
                  {item.replace('_', ' ')}
                </Text>
              </Pressable>
            )}
            contentContainerStyle={styles.filterList}
          />
        </View>

        {/* Exercise list */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text variant="body" color="neutral.gray600" style={{ marginTop: spacing.md }}>
              Buscando ejercicios...
            </Text>
          </View>
        ) : (
          <FlatList
            data={exercises}
            keyExtractor={(item) => item._id || item.name}
            renderItem={renderExercise}
            contentContainerStyle={styles.exerciseList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon name="search" size={48} color={colors.neutral.gray400} />
                <Text variant="body" color="neutral.gray600" align="center">
                  No se encontraron ejercicios
                </Text>
                <Text variant="bodySmall" color="neutral.gray500" align="center">
                  {searchQuery ? 'Intenta con otro término' : 'Ajusta los filtros'}
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
    alignItems: 'flex-start',
    padding: spacing.lg,
    paddingTop: spacing.xl + 20,
    backgroundColor: colors.neutral.white,
    ...shadows.sm,
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

  // Filters
  filters: {
    marginBottom: spacing.md,
  },
  filterList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
  },
  filterChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },

  // Exercise list
  exerciseList: {
    padding: spacing.lg,
    paddingTop: 0,
  },
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