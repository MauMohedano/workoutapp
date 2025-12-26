import { View, StyleSheet, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getRoutineById } from '../../../api/routineApi';
import { colors, spacing, radius, Icon } from '@/design-systems/tokens';
import { Text, Card } from '@/design-systems/components';
import { ActivityIndicator } from 'react-native';
import { getDayForSession } from '@/utils/sessionHelpers';
import { getDayNameForSession } from '@/utils/routineHelpers';
import { useState, useEffect } from 'react';  // ← AGREGAR useEffect
import { getDeviceId } from '../../../utils/deviceId';

export default function SessionPreviewScreen() {
  const { id, sessionNumber } = useLocalSearchParams();
  const router = useRouter();
  
  // Estados
  const [deviceId, setDeviceId] = useState(null);
  const [routine, setRoutine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar routine con deviceId de forma manual
useEffect(() => {
  const loadRoutineWithProgress = async () => {
    try {
      setIsLoading(true);
      
        
      
      
      // 1. Obtener deviceId
      const deviceIdValue = await getDeviceId();
      
      setDeviceId(deviceIdValue);
      
      // 2. Llamar API CON deviceId
       
      const routineData = await getRoutineById(id, deviceIdValue);  
      
      setRoutine(routineData);
      
    } catch (error) {
      console.error('❌ Error cargando routine:', error);
      console.error('❌ Error details:', error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (id) { 
    loadRoutineWithProgress();
  } else {
      
  }
}, [id]);

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

  const estimatedTime = day.exercises?.length * 8 || 0;

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
});