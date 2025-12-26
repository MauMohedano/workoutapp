import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, radius, shadows } from '../../design-systems/tokens';
import Text from '../../design-systems/components/Text';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSessionSummary } from '../../hooks/useSessionSummary';

export default function WorkoutSummary() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parámetros recibidos de la navegación
  const { 
    duration,
    routineId, 
    sessionNumber,
    dayName 
  } = params;

  // Obtener estadísticas
  const {
    totalSets,
    totalVolume,
    volumeChange,
    streak,
    highlights,
    isLoading,
    hasPreviousSession,
  } = useSessionSummary(routineId, parseInt(sessionNumber));

  const handleContinue = () => {
    router.push('/');
  };

  const handleShare = () => {
    // TODO: Implementar funcionalidad de compartir
    console.log('📤 Compartir estadísticas');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Celebratorio */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="check-circle" size={64} color={colors.primary.main} />
          </View>
          <Text variant="h1" style={styles.title} bold>
            ¡SESIÓN COMPLETADA!
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            {dayName || 'Entrenamiento'}
          </Text>
        </View>

        {/* Stat Principal: Tiempo */}
        <View style={styles.mainStatCard}>
          <Icon name="timer-outline" size={32} color={colors.primary.main} />
          <Text variant="h1" style={styles.mainStatValue} bold>
            {formatDuration(duration)}
          </Text>
          <Text variant="bodyMedium" style={styles.mainStatLabel}>
            Tiempo Total
          </Text>
        </View>

        {/* Grid de Estadísticas */}
        <View style={styles.statsGrid}>
          {/* Sets */}
          <View style={styles.statCard}>
            <Text variant="h2" style={styles.statValue} bold>
              {isLoading ? '...' : totalSets}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              💪 Sets
            </Text>
          </View>

          {/* Volumen */}
          <View style={styles.statCard}>
            <Text variant="h2" style={styles.statValue} bold>
              {isLoading ? '...' : formatVolume(totalVolume)}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              🏋️ Volumen
            </Text>
          </View>

          {/* Progreso */}
          <View style={styles.statCard}>
            <Text variant="h2" style={styles.statValue} bold>
              {isLoading ? '...' : hasPreviousSession ? formatChange(volumeChange) : '--'}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              📊 Progreso
            </Text>
          </View>

          {/* Racha */}
          <View style={styles.statCard}>
            <Text variant="h2" style={styles.statValue} bold>
              {isLoading ? '...' : `${streak}d`}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              🔥 Racha
            </Text>
          </View>
        </View>

        {/* Highlight Card */}
        {!isLoading && highlights && (
          <View style={styles.highlightCard}>
            <Text style={styles.highlightIcon}>{highlights.icon}</Text>
            <View style={styles.highlightContent}>
              <Text variant="bodyMedium" style={styles.highlightText} bold>
                {highlights.title}
              </Text>
              <Text variant="bodySmall" style={styles.highlightSubtext}>
                {highlights.subtitle}
              </Text>
            </View>
          </View>
        )}

        {/* Botón Compartir */}
        <Pressable
          style={({ pressed }) => [
            styles.shareButton,
            pressed && styles.buttonPressed
          ]}
          onPress={handleShare}
        >
          <Icon name="share-variant" size={20} color={colors.neutral.gray700} />
          <Text variant="bodyMedium" style={styles.shareButtonText} bold>
            COMPARTIR
          </Text>
        </Pressable>

        {/* Botón Continuar */}
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            pressed && styles.buttonPressed
          ]}
          onPress={handleContinue}
        >
          <Text variant="h3" style={styles.continueButtonText} bold>
            CONTINUAR
          </Text>
        </Pressable>

        {/* Espaciado inferior */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

// Helper para formatear duración
function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '--:--';
  
  const secs = parseInt(seconds);
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const remainingSeconds = secs % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Helper para formatear volumen
function formatVolume(volume) {
  if (!volume || volume === 0) return '0kg';
  
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k`;
  }
  return `${volume.toFixed(0)}kg`;
}

// Helper para formatear cambio porcentual
function formatChange(change) {
  if (!change || change === 0) return '0%';
  
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(0)}%`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgrounds.default,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  title: {
    color: colors.neutral.gray900,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: colors.neutral.gray600,
    textAlign: 'center',
  },

  // Stat Principal
  mainStatCard: {
    backgroundColor: colors.backgrounds.elevated,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  mainStatValue: {
    color: colors.primary.main,
    fontSize: 56,
    marginVertical: spacing.sm,
  },
  mainStatLabel: {
    color: colors.neutral.gray600,
  },

  // Grid de Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.backgrounds.elevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  statValue: {
    color: colors.neutral.gray900,
    marginBottom: spacing.xs,
  },
  statLabel: {
    color: colors.neutral.gray600,
    textAlign: 'center',
  },

  // Highlight Card
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning.light,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  highlightIcon: {
    fontSize: 32,
  },
  highlightContent: {
    flex: 1,
  },
  highlightText: {
    color: colors.warning.dark,
    marginBottom: spacing.xs,
  },
  highlightSubtext: {
    color: colors.warning.dark,
  },

  // Botones
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.backgrounds.elevated,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  shareButtonText: {
    color: colors.neutral.gray700,
    letterSpacing: 0.5,
  },
  continueButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    ...shadows.lg,
  },
  continueButtonText: {
    color: colors.neutral.white,
    letterSpacing: 0.5,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});