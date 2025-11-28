import { View, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, radius, Icon } from '@/design-systems/tokens';
import { Text, Card } from '@/design-systems/components';

export default function RecordsTab({ stats }) {
  const { personalRecords, consistency, volume } = stats;

  // Logros basados en las métricas actuales
  const achievements = [
    {
      id: 'first_routine',
      title: 'Primera Rutina',
      description: 'Completaste tu primera rutina',
      icon: 'checkmark',
      color: colors.success.main,
      unlocked: consistency.totalCompleted >= 1,
      progress: Math.min(consistency.totalCompleted, 1),
      total: 1,
    },
    {
      id: 'ten_sessions',
      title: '10 Sesiones',
      description: 'Completa 10 entrenamientos',
      icon: 'flame',
      color: colors.warning.main,
      unlocked: consistency.totalCompleted >= 10,
      progress: Math.min(consistency.totalCompleted, 10),
      total: 10,
    },
    {
      id: 'volume_50k',
      title: '50,000 kg',
      description: 'Levanta 50,000 kg en total',
      icon: 'trophy',
      color: colors.primary.main,
      unlocked: volume.totalWeight >= 50000,
      progress: Math.min(volume.totalWeight, 50000),
      total: 50000,
    },
    {
      id: 'streak_7',
      title: 'Racha Semanal',
      description: 'Entrena 7 días seguidos',
      icon: 'flame',
      color: '#FF6B6B',
      unlocked: consistency.streak >= 7,
      progress: Math.min(consistency.streak, 7),
      total: 7,
    },
    {
      id: 'hundred_workouts',
      title: 'Centenario',
      description: 'Completa 100 entrenamientos',
      icon: 'star',
      color: '#FFD700',
      unlocked: consistency.totalCompleted >= 100,
      progress: Math.min(consistency.totalCompleted, 100),
      total: 100,
    },
  ];

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Personal Records Podium */}
      <Card shadow="lg" style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="trophy" size={24} color={colors.warning.main} />
          <Text variant="bodyLarge" color="neutral.gray800" bold>
            Máximos Personales
          </Text>
        </View>

        {personalRecords.length > 0 ? (
          <View style={styles.podiumContainer}>
            {personalRecords.slice(0, 3).map((record, index) => {
              const medals = ['🥇', '🥈', '🥉'];
              const colors_bg = [
                colors.warning.main + '15',
                colors.neutral.gray300 + '30',
                '#CD7F32' + '30',
              ];
              
              return (
                <View 
                  key={index} 
                  style={[
                    styles.podiumCard,
                    { backgroundColor: colors_bg[index] }
                  ]}
                >
                  <Text style={styles.medal}>{medals[index]}</Text>
                  
                  <View style={styles.podiumInfo}>
                    <Text variant="bodyMedium" color="neutral.gray800" bold numberOfLines={2}>
                      {record.exercise}
                    </Text>
                    <Text variant="caption" color="neutral.gray500" style={{ marginTop: 2 }}>
                      {new Date(record.date).toLocaleDateString('es-MX', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </Text>
                  </View>

                  <View style={styles.podiumStats}>
                    <Text variant="h2" color="primary.main">
                      {record.weight}
                    </Text>
                    <Text variant="bodySmall" color="neutral.gray600">
                      kg × {record.reps}
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Resto de records */}
            {personalRecords.slice(3).map((record, index) => (
              <View key={index + 3} style={styles.recordRow}>
                <View style={styles.recordRank}>
                  <Text variant="bodyMedium" color="neutral.gray600" bold>
                    {index + 4}
                  </Text>
                </View>
                
                <View style={styles.recordInfo}>
                  <Text variant="bodyMedium" color="neutral.gray800" bold>
                    {record.exercise}
                  </Text>
                  <Text variant="caption" color="neutral.gray500">
                    {new Date(record.date).toLocaleDateString('es-MX', { 
                      day: 'numeric', 
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>

                <View style={styles.recordStats}>
                  <Text variant="bodyLarge" color="primary.main" bold>
                    {record.weight} kg
                  </Text>
                  <Text variant="caption" color="neutral.gray500">
                    × {record.reps} reps
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="trophy" size={48} color={colors.neutral.gray300} />
            <Text variant="body" color="neutral.gray500" style={{ marginTop: spacing.sm }}>
              Aún no tienes records personales
            </Text>
          </View>
        )}
      </Card>

      {/* Logros */}
      <Card shadow="lg" style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="star" size={24} color={colors.accent.main} />
          <Text variant="bodyLarge" color="neutral.gray800" bold>
            Logros
          </Text>
        </View>

        <View style={styles.achievementsList}>
          {achievements.map((achievement) => (
            <View 
              key={achievement.id} 
              style={[
                styles.achievementCard,
                !achievement.unlocked && styles.achievementLocked
              ]}
            >
              <View style={[
                styles.achievementIcon,
                { backgroundColor: achievement.unlocked ? achievement.color + '20' : colors.neutral.gray200 }
              ]}>
                <Icon 
                  name={achievement.icon} 
                  size={24} 
                  color={achievement.unlocked ? achievement.color : colors.neutral.gray400}
                />
              </View>

              <View style={styles.achievementInfo}>
                <Text 
                  variant="bodyMedium" 
                  color={achievement.unlocked ? "neutral.gray800" : "neutral.gray500"}
                  bold
                >
                  {achievement.title}
                </Text>
                <Text 
                  variant="caption" 
                  color={achievement.unlocked ? "neutral.gray600" : "neutral.gray400"}
                >
                  {achievement.description}
                </Text>

                {/* Progress bar */}
                {!achievement.unlocked && (
                  <View style={styles.achievementProgress}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${(achievement.progress / achievement.total) * 100}%` }
                        ]} 
                      />
                    </View>
                    <Text variant="caption" color="neutral.gray500">
                      {achievement.progress} / {achievement.total}
                    </Text>
                  </View>
                )}
              </View>

              {achievement.unlocked && (
                <View style={styles.unlockedBadge}>
                  <Icon name="checkmark" size={16} color={colors.success.main} />
                </View>
              )}
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
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
  
  // Podium
  podiumContainer: {
    gap: spacing.md,
  },
  podiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  medal: {
    fontSize: 32,
  },
  podiumInfo: {
    flex: 1,
  },
  podiumStats: {
    alignItems: 'flex-end',
  },
  
  // Records list
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral.gray50,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
  },
  recordRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordInfo: {
    flex: 1,
  },
  recordStats: {
    alignItems: 'flex-end',
  },
  
  // Achievements
  achievementsList: {
    gap: spacing.md,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral.gray50,
    borderRadius: radius.lg,
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
    gap: 4,
  },
  achievementProgress: {
    marginTop: spacing.xs,
    gap: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.neutral.gray200,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: radius.full,
  },
  unlockedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success.main + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Empty state
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
});