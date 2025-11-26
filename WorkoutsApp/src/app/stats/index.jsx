import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useWorkoutStats } from '../../hooks/useWorkoutStats';
import { colors, spacing, radius, shadows, Icon } from '@/design-systems/tokens';
import { Text, Button, Card } from '@/design-systems/components';

export default function StatsScreen() {
  const router = useRouter();
  const { deviceId } = useLocalSearchParams();
  
  const { data: stats, isLoading, error } = useWorkoutStats(deviceId);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text variant="bodyMedium" color="neutral.gray500" style={{ marginTop: spacing.md }}>
          Calculando estadísticas...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="error" size={48} color={colors.danger.main} />
        <Text variant="h3" color="danger.main" style={{ marginTop: spacing.md }}>
          Error al cargar
        </Text>
        <Text variant="body" color="neutral.gray500" align="center" style={{ marginTop: spacing.sm }}>
          {error.message}
        </Text>
      </View>
    );
  }

  // Empty state
  if (!stats || stats.totalWorkouts === 0) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="dumbbell" size={64} color={colors.neutral.gray300} />
        <Text variant="h3" color="neutral.gray800" style={{ marginTop: spacing.lg }}>
          Sin estadísticas aún
        </Text>
        <Text variant="body" color="neutral.gray500" align="center" style={{ marginTop: spacing.sm, maxWidth: 280 }}>
          Completa algunos entrenamientos para ver tus estadísticas
        </Text>
        <Button
          variant="primary"
          size="md"
          onPress={() => router.back()}
          style={{ marginTop: spacing.lg }}
        >
          Volver al inicio
        </Button>
      </View>
    );
  }

  const { volume, muscleDistribution, consistency, personalRecords } = stats;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Estadísticas',
          headerBackTitle: 'Atrás',
        }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Stats */}
        <View style={styles.headerSection}>
          <Text variant="h1" color="neutral.gray900">
            Tu Progreso
          </Text>
          <Text variant="body" color="neutral.gray500">
            {stats.totalWorkouts} {stats.totalWorkouts === 1 ? 'entrenamiento' : 'entrenamientos'} completados
          </Text>
        </View>

        {/* Volumen Total */}
        <Card shadow="lg" style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="barbell" size={24} color={colors.primary.main} />
            <Text variant="h3" color="neutral.gray800">
              Volumen Total
            </Text>
          </View>
          
          <View style={styles.volumeGrid}>
            <View style={styles.volumeItem}>
              <Text variant="h1" color="primary.main" style={{ fontSize: 40 }}>
                {volume.totalWeight}
              </Text>
              <Text variant="bodySmall" color="neutral.gray500">
                kg levantados
              </Text>
            </View>
            
            <View style={styles.volumeStats}>
              <View style={styles.volumeStat}>
                <Text variant="h3" color="neutral.gray800">
                  {volume.totalSets}
                </Text>
                <Text variant="caption" color="neutral.gray500">
                  sets totales
                </Text>
              </View>
              <View style={styles.volumeStat}>
                <Text variant="h3" color="neutral.gray800">
                  {volume.totalReps}
                </Text>
                <Text variant="caption" color="neutral.gray500">
                  repeticiones
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Distribución Muscular */}
        <Card shadow="lg" style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="body" size={24} color={colors.primary.main} />
            <Text variant="h3" color="neutral.gray800">
              Distribución Muscular
            </Text>
          </View>
          
          <View style={styles.muscleList}>
            {Object.entries(muscleDistribution)
              .filter(([_, percentage]) => percentage > 0)
              .sort(([_, a], [__, b]) => b - a)
              .map(([muscle, percentage]) => (
                <View key={muscle} style={styles.muscleItem}>
                  <View style={styles.muscleInfo}>
                    <Text variant="bodyMedium" color="neutral.gray800" style={{ textTransform: 'capitalize' }}>
                      {getMuscleLabel(muscle)}
                    </Text>
                    <Text variant="bodyMedium" color="primary.main" bold>
                      {percentage}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                  </View>
                </View>
              ))}
          </View>
        </Card>

        {/* Consistencia */}
        <Card shadow="lg" style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="flame" size={24} color={colors.warning.main} />
            <Text variant="h3" color="neutral.gray800">
              Consistencia
            </Text>
          </View>
          
          <View style={styles.consistencyGrid}>
            <View style={styles.consistencyItem}>
              <Text variant="h1" color="success.main" style={{ fontSize: 48 }}>
                {consistency.totalCompleted}
              </Text>
              <Text variant="bodySmall" color="neutral.gray500">
                sesiones completadas
              </Text>
            </View>
            
            <View style={styles.consistencyItem}>
              <Text variant="h1" color="neutral.gray800" style={{ fontSize: 48 }}>
                {consistency.completionRate}%
              </Text>
              <Text variant="bodySmall" color="neutral.gray500">
                tasa de finalización
              </Text>
            </View>
          </View>
        </Card>

        {/* Personal Records */}
        {personalRecords.length > 0 && (
          <Card shadow="lg" style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="trophy" size={24} color={colors.warning.main} />
              <Text variant="h3" color="neutral.gray800">
                Records Personales
              </Text>
            </View>
            
            <View style={styles.prList}>
              {personalRecords.map((pr, index) => (
                <View key={index} style={styles.prItem}>
                  <View style={styles.prRank}>
                    <Text variant="h3" color="warning.main">
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.prInfo}>
                    <Text variant="bodyMedium" color="neutral.gray800" bold>
                      {pr.exercise}
                    </Text>
                    <Text variant="caption" color="neutral.gray500">
                      {new Date(pr.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.prStats}>
                    <Text variant="h3" color="primary.main">
                      {pr.weight}kg
                    </Text>
                    <Text variant="caption" color="neutral.gray500">
                      × {pr.reps} reps
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

// Helper para traducir nombres de músculos
function getMuscleLabel(muscle) {
  const labels = {
    chest: 'Pecho',
    back: 'Espalda',
    legs: 'Piernas',
    shoulders: 'Hombros',
    arms: 'Brazos',
    core: 'Core',
    other: 'Otros'
  };
  return labels[muscle] || muscle;
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
    padding: spacing.xl,
  },
  
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
  
  // Header
  headerSection: {
    marginBottom: spacing.lg,
  },
  
  // Cards
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  
  // Volumen
  volumeGrid: {
    gap: spacing.lg,
  },
  volumeItem: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.main + '10',
    borderRadius: radius.lg,
  },
  volumeStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  volumeStat: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.neutral.gray50,
    borderRadius: radius.lg,
  },
  
  // Músculos
  muscleList: {
    gap: spacing.md,
  },
  muscleItem: {
    gap: spacing.xs,
  },
  muscleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral.gray200,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: radius.full,
  },
  
  // Consistencia
  consistencyGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  consistencyItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.neutral.gray50,
    borderRadius: radius.lg,
  },
  
  // Personal Records
  prList: {
    gap: spacing.sm,
  },
  prItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral.gray50,
    borderRadius: radius.lg,
  },
  prRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.warning.main + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prInfo: {
    flex: 1,
  },
  prStats: {
    alignItems: 'flex-end',
  },
});