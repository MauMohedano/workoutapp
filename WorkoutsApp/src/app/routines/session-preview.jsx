import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getRoutineById } from '../../api/routineApi';
import { colors, spacing, radius, Icon } from '@/design-systems/tokens';
import { Text, Card, Button } from '@/design-systems/components';
import { ActivityIndicator } from 'react-native';
import { getDayForSession } from '@/utils/sessionHelpers';
import { getDayNameForSession } from '@/utils/routineHelpers';

export default function SessionPreviewScreen() {
  const { routineId, sessionNumber, deviceId } = useLocalSearchParams();
  const router = useRouter();

  // Fetch routine data
  const { data: routine, isLoading } = useQuery({
    queryKey: ['routine', routineId],
    queryFn: () => getRoutineById(routineId),
    enabled: !!routineId,
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!routine) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="body" color="neutral.gray500">
          No se pudo cargar la sesión
        </Text>
      </View>
    );
  }

  const day = getDayForSession(parseInt(sessionNumber), routine.days);
  const dayName = getDayNameForSession(routine, parseInt(sessionNumber));

  if (!day) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="body" color="neutral.gray500">
          No hay información para esta sesión
        </Text>
      </View>
    );
  }

  const estimatedTime = day.exercises?.length * 8 || 0; // ~8 min por ejercicio

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `Sesión ${sessionNumber}`,
          headerBackTitle: 'Atrás',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header de la sesión */}
        <View style={styles.header}>
          <Text variant="h1" color="neutral.gray800">
            {dayName}
          </Text>
          <Text variant="bodyMedium" color="neutral.gray600" style={{ marginTop: spacing.xs }}>
            {day.name.includes('(') ? day.name.match(/\(([^)]+)\)/)?.[1] : ''}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="dumbbell" size={18} color={colors.primary.main} />
              <Text variant="bodySmall" color="neutral.gray600">
                {day.exercises?.length || 0} ejercicios
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="time" size={18} color={colors.neutral.gray500} />
              <Text variant="bodySmall" color="neutral.gray600">
                ~{estimatedTime} min
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Calentamiento */}
        {day.warm_up && day.warm_up.length > 0 && (
          <Card shadow="sm" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="flame" size={20} color={colors.warning.main} />
              <Text variant="bodyLarge" color="neutral.gray800" bold>
                Calentamiento
              </Text>
            </View>
            {day.warm_up.map((item, idx) => (
              <Text key={idx} variant="bodySmall" color="neutral.gray600" style={styles.listItem}>
                • {item}
              </Text>
            ))}
          </Card>
        )}

        {/* Ejercicios */}
        <Card shadow="sm" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="dumbbell" size={20} color={colors.primary.main} />
            <Text variant="bodyLarge" color="neutral.gray800" bold>
              Ejercicios
            </Text>
          </View>

          {day.exercises?.sort((a, b) => a.order - b.order).map((exercise, index) => (
            <View key={exercise._id} style={styles.exerciseItem}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseNumber}>
                  <Text variant="bodySmall" color="primary.main" bold>
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text variant="bodyMedium" color="neutral.gray800" bold>
                    {exercise.name}
                  </Text>
                  <View style={styles.exerciseDetails}>
                    <Text variant="caption" color="neutral.gray600">
                      {exercise.targetSets} sets × {exercise.targetReps} reps
                    </Text>
                    {exercise.restTime && (
                      <>
                        <Text variant="caption" color="neutral.gray400"> • </Text>
                        <Text variant="caption" color="neutral.gray600">
                          Descanso: {Math.floor(exercise.restTime / 60)}:{(exercise.restTime % 60).toString().padStart(2, '0')} min
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))}
        </Card>

        {/* Enfriamiento */}
        {day.cool_down && day.cool_down.length > 0 && (
          <Card shadow="sm" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="snow" size={20} color={colors.primary.light} />
              <Text variant="bodyLarge" color="neutral.gray800" bold>
                Enfriamiento
              </Text>
            </View>
            {day.cool_down.map((item, idx) => (
              <Text key={idx} variant="bodySmall" color="neutral.gray600" style={styles.listItem}>
                • {item}
              </Text>
            ))}
          </Card>
        )}

        {/* Spacer para botones flotantes */}
       
      </ScrollView>

     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.gray100,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },

  // Header
  header: {
    marginBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.gray200,
    marginBottom: spacing.lg,
  },

  // Sections
  section: {
    padding: spacing.xs,
    marginBottom: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  listItem: {
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },

  // Exercises
  exerciseItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  exerciseHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.main + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
    gap: 4,
  },
  exerciseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  // Floating buttons
  floatingButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.base,
    paddingBottom: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
    gap: spacing.sm,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
  },
});