import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { colors, spacing, radius, Icon } from '@/design-systems/tokens';
import { Text, Card } from '@/design-systems/components';
import { getSessionProgress, getProgressColor } from '@/utils/sessionHelpers';
import { useState, useEffect } from 'react';
import { getSetsBySession } from '@/api/workoutApi';
import { calculateSessionProgress, getSessionProgressSummary } from '@/utils/sessionProgressCalculator';
import ExerciseCard from '@/components/ExerciseCard';

export default function SessionCard({
  sessionNum,
  day,
  currentSession,
  workoutProgress,
  completedSessions,
  isExpanded,
  onToggle,
  onStartSession,
  router,
  routine,
  expandedAnimations,
  deviceId
}) {
  const isCurrent = sessionNum === currentSession;
  const isCompleted = completedSessions?.includes(sessionNum);
  const isPrevious = sessionNum < currentSession;

  const [sessionSets, setSessionSets] = useState([]);
  const [realProgress, setRealProgress] = useState(null);
  const [loadingSets, setLoadingSets] = useState(false);

  //  Cargar sets de sesiones anteriores
  useEffect(() => {
    const loadSessionSets = async () => {
      // Solo cargar sets para sesiones anteriores completadas
      if (!isPrevious || !isCompleted || !deviceId) return;

      try {
        setLoadingSets(true);
        const sets = await getSetsBySession(deviceId, routine._id, sessionNum);
        setSessionSets(sets);

        // Calcular progreso real
        const summary = getSessionProgressSummary(day, sets);
        setRealProgress(summary);

      } catch (error) {
        console.error('Error loading session sets:', error);
      } finally {
        setLoadingSets(false);
      }
    };

    loadSessionSets();
  }, [sessionNum, isPrevious, isCompleted, deviceId, routine._id, day]);

  const sessionProgress = getSessionProgress(sessionNum, currentSession, workoutProgress, day);
  const progressColor = getProgressColor(sessionProgress, colors);

  const getExerciseProgress = (exerciseName, targetSets) => {
    if (!sessionSets || sessionSets.length === 0) {
      return { completedSets: 0, percentage: 0 };
    }

    const completedSets = sessionSets.filter(
      set => set.exercise === exerciseName
    ).length;

    // Cap a targetSets (si hizo más, solo cuenta hasta el objetivo)
    const cappedSets = Math.min(completedSets, targetSets);
    const percentage = Math.round((cappedSets / targetSets) * 100);

    return {
      completedSets: cappedSets,
      totalSets: targetSets,
      percentage: Math.min(percentage, 100)
    };
  };

  return (
    <Card shadow="sm" style={styles.sessionCard}>
      {/* Header de la sesión */}
      <Pressable
        style={styles.sessionHeader}
        onPress={onToggle}
      >
        <View style={styles.sessionTitleRow}>
          <View style={[
            styles.sessionBadge,
            isCurrent && styles.sessionBadgeCurrent,
            isCompleted && styles.sessionBadgeCompleted,
          ]}>
            <Text
              variant="caption"
              color={isCurrent ? "primary.main" : isCompleted ? "success.main" : "neutral.gray500"}
              bold
            >
              {sessionNum}
            </Text>
          </View>

          <View style={styles.sessionInfo}>
            <Text variant="bodyMedium" color="neutral.gray800" bold>
              {day.name}
            </Text>
            <Text variant="caption" color="neutral.gray500">
              {day.exercises?.length || 0} ejercicios
            </Text>
          </View>

          <Icon
            name={isExpanded ? "eye-off" : "eye"}
            size={20}
            color={colors.neutral.gray400}
          />
        </View>


        {/* Progreso de sesiones anteriores (con sets reales) */}
        {isPrevious && isCompleted && realProgress && (
          <View style={styles.progressSection}>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${realProgress.percentage}%`,
                    backgroundColor: realProgress.isComplete ? colors.success.main : colors.warning.main
                  }
                ]}
              />
            </View>
            <View style={styles.progressText}>
              <Text variant="caption" color={realProgress.isComplete ? "success.main" : "warning.main"} bold>
                {realProgress.percentage}% completado
              </Text>
              <Text variant="caption" color="neutral.gray500">
                {realProgress.completedSets}/{realProgress.totalSets} sets
              </Text>
            </View>
          </View>
        )}

        {/* Barra de progreso de sesión actual (en curso) */}
        {isCurrent && sessionProgress > 0 && sessionProgress < 100 && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${sessionProgress}%`, backgroundColor: progressColor }
              ]}
            />
          </View>
        )}
      </Pressable>

      {/* Contenido expandible */}
      {isExpanded && (
        <Animated.View
          style={[
            styles.sessionContent,
            {
              opacity: expandedAnimations[`session-${sessionNum}`],
              maxHeight: expandedAnimations[`session-${sessionNum}`]?.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 2000],
              }),
            }
          ]}
        >
          {/* Barra de progreso de ejercicios (solo si tiene progreso) */}
          {isCurrent && workoutProgress && (
            <View style={styles.exerciseProgress}>
              <View style={styles.progressBarContainer}>
                <View style={[
                  styles.progressBarFill,
                  { width: `${((workoutProgress.exerciseIndex + 1) / (day.exercises?.length || 1)) * 100}%` }
                ]} />
              </View>
              <Text variant="caption" color="primary.main" style={{ fontWeight: '600' }}>
                {workoutProgress.exerciseIndex + 1}/{day.exercises?.length || 0} ejercicios
              </Text>
            </View>
          )}

          {/* Warm up */}
          {day.warm_up && day.warm_up.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Icon name="flame" size={18} color={colors.warning.main} />
                <Text variant="bodySmall" color="neutral.gray700" style={{ fontWeight: '600' }}>
                  Calentamiento
                </Text>
              </View>
              {day.warm_up.map((item, idx) => (
                <Text key={idx} variant="bodySmall" color="neutral.gray600" style={styles.listItem}>
                  • {item}
                </Text>
              ))}
            </View>
          )}

          {/* Ejercicios */}
          <View style={styles.exercisesContainer}>
            <View style={styles.sectionHeader}>
              <Icon name="dumbbell" size={18} color={colors.primary.main} />
              <Text variant="bodySmall" color="neutral.gray700" style={{ fontWeight: '600' }}>
                Ejercicios
              </Text>
            </View>
            {day.exercises?.sort((a, b) => a.order - b.order).map((exercise, exIndex) => {
              // Calcular progreso de este ejercicio
              const exerciseProgress = isPrevious && isCompleted
                ? getExerciseProgress(exercise.name, exercise.targetSets)
                : null;

              return (
                <ExerciseCard
                  key={exercise._id}
                  exercise={exercise}
                  index={exIndex + 1}
                  variant="default"
                  current={sessionNum === currentSession && workoutProgress?.exerciseIndex === exIndex}
                  completed={sessionNum < currentSession}
                  disabled={false}
                  progress={exerciseProgress}  
                  onPress={(ex) => {
                    router.push({
                      pathname: '/workout',
                      params: {
                        routineId: routine._id,
                        sessionNumber: sessionNum,
                        dayId: day._id,
                        dayName: day.name,
                        totalExercises: day.exercises.length,
                        exerciseIndex: exIndex,
                        isReadOnly: sessionNum !== currentSession ? 'true' : 'false'
                      }
                    });
                  }}
                />
              );
            })}
          </View>

          {/* Cool down */}
          {day.cool_down && day.cool_down.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Icon name="snow" size={18} color={colors.primary.light} />
                <Text variant="bodySmall" color="neutral.gray700" style={{ fontWeight: '600' }}>
                  Enfriamiento
                </Text>
              </View>
              {day.cool_down.map((item, idx) => (
                <Text key={idx} variant="bodySmall" color="neutral.gray600" style={styles.listItem}>
                  • {item}
                </Text>
              ))}
            </View>
          )}
        </Animated.View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  sessionCard: {
    padding: 0,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  sessionHeader: {
    padding: spacing.lg,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sessionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionBadgeCurrent: {
    backgroundColor: colors.primary.main + '20',
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  sessionBadgeCompleted: {
    backgroundColor: colors.success.main + '20',
  },
  sessionInfo: {
    flex: 1,
    gap: 2,
  },
  progressSection: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  progressText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.neutral.gray200,
    borderRadius: radius.full,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: radius.full,
  },
  sessionContent: {
    paddingHorizontal: 0,
    paddingBottom: spacing.lg,
    overflow: 'hidden',
  },
  exerciseProgress: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  sectionBlock: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  listItem: {
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  exercisesContainer: {
    marginBottom: spacing.md,
  },
});