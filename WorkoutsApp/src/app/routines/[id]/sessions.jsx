import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getRoutineById } from '../../../api/routineApi';
import { getWorkoutProgress } from '../../../api/workoutApi';
import { colors, spacing, radius } from '@/design-systems/tokens';
import { Text } from '@/design-systems/components';
import { ActivityIndicator } from 'react-native';
import { useState, useRef } from 'react';
import { getDayForSession, getSessionProgress } from '@/utils/sessionHelpers';
import SessionCard from '../../../components/routines/SessionCard';
import CollapsibleSection from '../../../components/routines/CollapsibleSection';
import { getDeviceId } from '../../../utils/deviceId';

export default function AllSessionsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Estados
  const [deviceId, setDeviceId] = useState(null);
  const [routine, setRoutine] = useState(null);
  const [routineLoading, setRoutineLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState({});
  const expandedAnimations = useRef({}).current;

  // Cargar routine con deviceId de forma manual
  useEffect(() => {
    const loadRoutineWithProgress = async () => {
      try {
        setRoutineLoading(true);

        // 1. Obtener deviceId
        const deviceIdValue = await getDeviceId();
        setDeviceId(deviceIdValue);

        // 2. Llamar API CON deviceId
        const routineData = await getRoutineById(id, deviceIdValue);
        setRoutine(routineData);

      } catch (error) {
        console.error('❌ Error cargando routine:', error);
      } finally {
        setRoutineLoading(false);
      }
    };

    if (id) {
      loadRoutineWithProgress();
    }
  }, [id]);

  // Fetch workout progress (MANTENER con React Query)
  const { data: workoutProgress } = useQuery({
    queryKey: ['workoutProgress', id],
    queryFn: () => getWorkoutProgress(id),
    enabled: !!id,
  });

  // Toggle sesión
  const toggleSession = (sessionNum) => {
    const key = `session-${sessionNum}`;
    const isCurrentlyExpanded = expandedSessions[key];

    if (!expandedAnimations[key]) {
      expandedAnimations[key] = new Animated.Value(isCurrentlyExpanded ? 1 : 0);
    }

    Animated.timing(expandedAnimations[key], {
      toValue: isCurrentlyExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setExpandedSessions(prev => ({
      ...prev,
      [key]: !isCurrentlyExpanded
    }));
  };

  if (routineLoading) {
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
          No se pudo cargar la rutina
        </Text>
      </View>
    );
  }

  const currentSession = routine.progress?.currentSession || 1;
  const sessions = Array.from({ length: routine.totalSessions }, (_, i) => i + 1);

  // Separar sesiones por categoría
  const previousSessions = sessions.filter(s => s < currentSession);
  const currentSessionNum = currentSession;
  const upcomingSessions = sessions.filter(s => s > currentSession);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Programa Completo',
          headerBackTitle: 'Atrás',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 📊 Sesiones Anteriores */}
        {previousSessions.length > 0 && (
          <CollapsibleSection
            title="Sesiones Anteriores"
            count={previousSessions.length}
           iconName="checkmark-done" 
            defaultExpanded={false}
            variant="secondary"
          >
            <View style={styles.sessionsList}>
              {previousSessions.map(sessionNum => {
                const day = getDayForSession(sessionNum, routine.days);
                if (!day) return null;

                return (
                  <SessionCard
                    key={sessionNum}
                    sessionNum={sessionNum}
                    day={day}
                    currentSession={currentSession}
                    workoutProgress={workoutProgress}
                    completedSessions={routine.progress?.completedSessions || []}
                    isExpanded={expandedSessions[`session-${sessionNum}`]}
                    onToggle={() => toggleSession(sessionNum)}
                    onStartSession={() => {
                      router.push({
                        pathname: '/workout',
                        params: {
                          routineId: routine._id,
                          sessionNumber: sessionNum,
                          dayId: day._id,
                          dayName: day.name,
                          totalExercises: day.exercises.length,
                          exerciseIndex: 0,
                          isReadOnly: 'true'
                        }
                      });
                    }}
                    router={router}
                    routine={routine}
                    expandedAnimations={expandedAnimations}
                     deviceId={deviceId}
                  />
                );
              })}
            </View>
          </CollapsibleSection>
        )}

        {/* 🎯 Sesión Actual */}
        <CollapsibleSection
          title="Sesión Actual"
          count={1}
           iconName="flame"
          defaultExpanded={false}
          variant="primary"
        >
          <View style={styles.sessionsList}>
            {(() => {
              const day = getDayForSession(currentSessionNum, routine.days);
              if (!day) return null;

              return (
                <SessionCard
                  key={currentSessionNum}
                  sessionNum={currentSessionNum}
                  day={day}
                  currentSession={currentSession}
                  workoutProgress={workoutProgress}
                  completedSessions={routine.progress?.completedSessions || []}
                  isExpanded={expandedSessions[`session-${currentSessionNum}`]}
                  onToggle={() => toggleSession(currentSessionNum)}
                  onStartSession={() => {
                    router.push({
                      pathname: '/workout',
                      params: {
                        routineId: routine._id,
                        sessionNumber: currentSessionNum,
                        dayId: day._id,
                        dayName: day.name,
                        totalExercises: day.exercises.length,
                        exerciseIndex: 0,
                        isReadOnly: 'false'
                      }
                    });
                  }}
                  router={router}
                  routine={routine}
                  expandedAnimations={expandedAnimations}
                   deviceId={deviceId}
                />
              );
            })()}
          </View>
        </CollapsibleSection>

        {/* 📅 Próximas Sesiones */}
        {upcomingSessions.length > 0 && (
          <CollapsibleSection
            title="Próximas Sesiones"
            count={upcomingSessions.length}
            iconName="calendar"
            defaultExpanded={true}
            variant="default"
          >
            <View style={styles.sessionsList}>
              {upcomingSessions.map(sessionNum => {
                const day = getDayForSession(sessionNum, routine.days);
                if (!day) return null;

                return (
                  <SessionCard
                    key={sessionNum}
                    sessionNum={sessionNum}
                    day={day}
                    currentSession={currentSession}
                    workoutProgress={workoutProgress}
                    completedSessions={routine.progress?.completedSessions || []}
                    isExpanded={expandedSessions[`session-${sessionNum}`]}
                    onToggle={() => toggleSession(sessionNum)}
                    onStartSession={() => {
                      router.push({
                        pathname: '/workout',
                        params: {
                          routineId: routine._id,
                          sessionNumber: sessionNum,
                          dayId: day._id,
                          dayName: day.name,
                          totalExercises: day.exercises.length,
                          exerciseIndex: 0,
                          isReadOnly: 'false'
                        }
                      });
                    }}
                    router={router}
                    routine={routine}
                    expandedAnimations={expandedAnimations}
                    deviceId={deviceId}
                  />
                );
              })}
            </View>
          </CollapsibleSection>
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
  sessionsList: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
});