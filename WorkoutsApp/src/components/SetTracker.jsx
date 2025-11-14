import { View, StyleSheet, FlatList, Pressable, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSets, deleteSet } from "../api/workoutApi";

// Design System
import { colors, spacing, radius, shadows, Icon } from '@/design-systems/tokens';
import { Text, Card } from '@/design-systems/components';

/**
 * 📊 SET TRACKER COMPONENT
 * 
 * Muestra progreso de sets con estados visuales:
 * - ✓ Completados (verde)
 * - → Siguiente (destacado)
 * - ○ Pendientes (gris)
 */
const SetTracker = ({ 
  exerciseName, 
  routineExerciseId, 
  sessionNumber,
  targetSets = 4,
  targetReps = 10 
}) => {
  const queryClient = useQueryClient();

  const { data: allSets, isLoading, error } = useQuery({
    queryKey: ['sets'],
    queryFn: getSets
  });

  // Filtrar sets de este ejercicio/sesión
  const completedSets = allSets?.filter(set => {
    const matchesExercise = set.exercise === exerciseName;
    const matchesSession = sessionNumber ? set.sessionNumber === parseInt(sessionNumber) : true;
    return matchesExercise && matchesSession;
  }) || [];

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

  const handleDelete = (setId, setNumber) => {
    Alert.alert(
      'Eliminar Set',
      `¿Eliminar el Set ${setNumber}?`,
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

  // Calcular progreso
  const completedCount = completedSets.length;
  const remainingCount = Math.max(0, targetSets - completedCount);
  const progressPercentage = targetSets > 0 ? (completedCount / targetSets) * 100 : 0;
  const isComplete = completedCount >= targetSets;

  // Generar array de sets (completados + pendientes)
  const allSetsDisplay = [
    ...completedSets.map((set, idx) => ({
      id: set._id,
      number: idx + 1,
      status: 'completed',
      weight: set.weight,
      reps: set.reps,
      notes: set.notes,
      data: set
    })),
    ...Array.from({ length: remainingCount }, (_, idx) => ({
      id: `pending-${idx}`,
      number: completedCount + idx + 1,
      status: completedCount + idx === 0 ? 'next' : 'pending',
      weight: null,
      reps: null
    }))
  ];

  if (isLoading) {
    return (
      <Card style={styles.container}>
        <Text variant="bodySmall" color="neutral.gray500" align="center">
          Cargando sets...
        </Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={styles.container}>
        <Text variant="bodySmall" color="danger.main" align="center">
          Error cargando sets
        </Text>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      {/* Header con progreso */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="h3" color="neutral.gray800">
            Sets Completados
          </Text>
          <Text variant="bodySmall" color="neutral.gray500">
            {completedCount} de {targetSets} sets
          </Text>
        </View>

        {/* Badge de progreso */}
        <View style={[
          styles.progressBadge,
          isComplete && styles.progressBadgeComplete
        ]}>
          <Text 
            variant="h3" 
            style={{ 
              color: isComplete ? colors.success.main : colors.primary.main 
            }}
          >
            {Math.round(progressPercentage)}%
          </Text>
        </View>
      </View>

      {/* Barra de progreso */}
      <View style={styles.progressBarContainer}>
        <View style={[
          styles.progressBarFill,
          { 
            width: `${progressPercentage}%`,
            backgroundColor: isComplete ? colors.success.main : colors.primary.main
          }
        ]} />
      </View>

      {/* Lista de sets */}
      <FlatList
        data={allSetsDisplay}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        style={styles.list}
        renderItem={({ item }) => {
          const isCompleted = item.status === 'completed';
          const isNext = item.status === 'next';
          const isPending = item.status === 'pending';

          return (
            <Pressable
              onLongPress={() => isCompleted && handleDelete(item.data._id, item.number)}
              disabled={!isCompleted}
              style={({ pressed }) => [
                styles.setRow,
                isNext && styles.setRowNext,
                isPending && styles.setRowPending,
                pressed && styles.setRowPressed
              ]}
            >
              {/* Número e icono */}
              <View style={[
                styles.setIcon,
                isCompleted && styles.setIconCompleted,
                isNext && styles.setIconNext,
                isPending && styles.setIconPending
              ]}>
                {isCompleted ? (
                  <Icon name="success" size={20} color={colors.neutral.white} />
                ) : isNext ? (
                  <Icon name="play" size={18} color={colors.primary.main} />
                ) : (
                  <Text variant="bodySmall" color="neutral.gray400" bold>
                    {item.number}
                  </Text>
                )}
              </View>

              {/* Info del set */}
              <View style={styles.setInfo}>
                {isCompleted ? (
                  <>
                    <Text variant="bodyMedium" color="neutral.gray800" bold>
                      {item.weight}kg × {item.reps} reps
                    </Text>
                    {item.notes && (
                      <Text variant="caption" color="neutral.gray500">
                        📝 {item.notes}
                      </Text>
                    )}
                  </>
                ) : isNext ? (
                  <Text variant="bodyMedium" color="primary.main" bold>
                    Próximo set
                  </Text>
                ) : (
                  <Text variant="bodySmall" color="neutral.gray400">
                    Set {item.number} pendiente
                  </Text>
                )}
              </View>

              {/* Badge de estado */}
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <Icon name="checkmark" size={14} color={colors.success.main} />
                </View>
              )}
              {isNext && (
                <View style={styles.nextBadge}>
                  <Text variant="caption" color="primary.main" bold>
                    AHORA
                  </Text>
                </View>
              )}
            </Pressable>
          );
        }}
      />

      {/* Hint */}
      {completedCount > 0 && (
        <Text variant="caption" color="neutral.gray400" align="center" style={styles.hint}>
          💡 Mantén presionado para eliminar un set
        </Text>
      )}

      {/* Mensaje de completado */}
      {isComplete && (
        <View style={styles.completeMessage}>
          <Icon name="trophy" size={20} color={colors.special.gold} />
          <Text variant="bodyMedium" style={{ color: colors.special.gold }} bold>
            ¡Sets completados! 🎉
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.sm + 2,
    marginBottom: spacing.md,
    padding: spacing.base,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  progressBadge: {
    backgroundColor: colors.primary.main + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.primary.main + '30',
  },
  progressBadgeComplete: {
    backgroundColor: colors.success.main + '15',
    borderColor: colors.success.main + '30',
  },

  // Progress bar
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.neutral.gray200,
    borderRadius: radius.base,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.base,
    transition: 'width 0.3s ease',
  },

  // List
  list: {
    marginBottom: spacing.sm,
  },

  // Set row
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.neutral.gray50,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  setRowNext: {
    backgroundColor: colors.primary.main + '10',
    borderColor: colors.primary.main,
    ...shadows.md,
  },
  setRowPending: {
    backgroundColor: colors.neutral.gray50,
    opacity: 0.6,
  },
  setRowPressed: {
    opacity: 0.7,
    backgroundColor: colors.danger.main + '10',
  },

  // Set icon
  setIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  setIconCompleted: {
    backgroundColor: colors.success.main,
  },
  setIconNext: {
    backgroundColor: colors.neutral.white,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  setIconPending: {
    backgroundColor: colors.neutral.gray200,
  },

  // Set info
  setInfo: {
    flex: 1,
    gap: 2,
  },

  // Badges
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success.main + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBadge: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 2,
    borderRadius: radius.base,
  },

  // Hint
  hint: {
    marginTop: spacing.xs,
  },

  // Complete message
  completeMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.special.gold + '15',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
    borderWidth: 2,
    borderColor: colors.special.gold + '30',
  },
});

export default SetTracker;