import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { colors, spacing, radius, Icon } from '@/design-systems/tokens';
import { Text, Card } from '@/design-systems/components';
import { Dimensions } from 'react-native';
import { useState } from 'react';

const screenWidth = Dimensions.get('window').width;

export default function OverviewTab({ stats, onPeriodChange, currentPeriod }) {


  const { volume, muscleDistribution, consistency } = stats;

  const periods = [
    { key: 'week', label: 'Semana' },
    { key: 'month', label: 'Mes' },
    { key: 'year', label: 'Año' },
    { key: 'all', label: 'Todo' },
  ];

  // Preparar datos para pie chart
  const muscleColors = {
    chest: colors.primary.main,      // Naranja
    back: '#3B82F6',                 // Azul
    legs: colors.success.main,       // Verde
    shoulders: colors.warning.main,  // Amarillo
    arms: '#8B5CF6',                 // Morado
    core: colors.neutral.gray600,    // Gris
    other: colors.neutral.gray400,   // Gris claro
  };

  const muscleLabels = {
    chest: 'Pecho',
    back: 'Espalda',
    legs: 'Piernas',
    shoulders: 'Hombros',
    arms: 'Brazos',
    core: 'Core',
    other: 'Otros'
  };

  // Filtrar músculos con porcentaje > 0 para el pie chart
  const pieData = Object.entries(muscleDistribution)
    .filter(([_, percentage]) => percentage > 0)
    .map(([muscle, percentage]) => ({
       name: `${muscleLabels[muscle]}`,
      population: percentage,
      color: muscleColors[muscle],
      legendFontColor: colors.neutral.gray700,
      legendFontSize: 12,
    }));

  const chartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Filtro Global de Período */}
      <View style={styles.globalFilterContainer}>
        <Text variant="bodySmall" color="neutral.gray600" bold>
          Período:
        </Text>
        <View style={styles.periodFilter}>
          {periods.map((period) => (
            <Pressable
              key={period.key}
              onPress={() => onPeriodChange(period.key)}
              style={[
                styles.periodButton,
                currentPeriod === period.key && styles.periodButtonActive
              ]}
            >
              <Text
                variant="caption"
                color={currentPeriod === period.key ? "primary.main" : "neutral.gray600"}
                bold={currentPeriod === period.key}
              >
                {period.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* 1. Volumen Total (sin filtro individual) */}
      <Card shadow="lg" style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="dumbbell" size={24} color={colors.primary.main} />
          <Text variant="bodyLarge" color="neutral.gray800" bold>
            Volumen Total
          </Text>
        </View>

        <View style={styles.volumeMain}>
          <Text variant="h1" color="primary.main" style={{ fontSize: 48, lineHeight: 56, }}>
            {volume.totalWeight.toLocaleString()}
          </Text>
          <Text variant="bodyMedium" color="neutral.gray600" style={{ marginTop: spacing.xs }}>
            kg levantados
          </Text>
        </View>

        <View style={styles.volumeStats}>
          <View style={styles.volumeStat}>
            <Icon name="target" size={20} color={colors.primary.main} />
            <View>
              <Text variant="h3" color="neutral.gray800">
                {volume.totalSets}
              </Text>
              <Text variant="caption" color="neutral.gray500">
                sets totales
              </Text>
            </View>
          </View>

          <View style={styles.volumeDivider} />

          <View style={styles.volumeStat}>
            <Icon name="checkmark" size={20} color={colors.success.main} />
            <View>
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

      {/* 2. Distribución Muscular (sin filtro individual) */}

      <Card shadow="lg" style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="target" size={24} color={colors.primary.main} />
          <Text variant="bodyLarge" color="neutral.gray800" bold>
            Distribución Muscular
          </Text>
        </View>

        {pieData.length > 0 ? (
          <View style={styles.chartContainer}>
            <PieChart
              data={pieData}
              width={screenWidth - spacing.base * 4}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              //absolute
            />
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Icon name="dumbbell" size={48} color={colors.neutral.gray300} />
            <Text variant="body" color="neutral.gray500" style={{ marginTop: spacing.sm }}>
              No hay datos para este período
            </Text>
          </View>
        )}
      </Card>

      {/* 3. Consistencia (sin filtro - siempre muestra "Todo") */}
      <Card shadow="lg" style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="flame" size={24} color={colors.warning.main} />
          <Text variant="bodyLarge" color="neutral.gray800" bold>
            Consistencia
          </Text>
        </View>

        {/* Stats en fila con dividers - Estilo Strava */}
        <View style={styles.consistencyRow}>
          {/* Sesiones completadas */}
          <View style={styles.consistencyColumn}>
            <Text variant="h2" color="success.main" style={{ fontSize: 32 }}>
              {consistency.totalCompleted}
            </Text>
            <Text variant="caption" color="neutral.gray500" align="center">
              completadas
            </Text>
          </View>

          <View style={styles.consistencyDivider} />

          {/* Tasa de finalización */}
          <View style={styles.consistencyColumn}>
            <Text variant="h2" color="neutral.gray800" style={{ fontSize: 32 }}>
              {consistency.completionRate}%
            </Text>
            <Text variant="caption" color="neutral.gray500" align="center">
              finalización
            </Text>
          </View>

          <View style={styles.consistencyDivider} />

          {/* Racha */}
          <View style={styles.consistencyColumn}>
            <View style={styles.streakInline}>
              <Icon name="flame" size={20} color={colors.warning.main} />
              <Text variant="h2" color="warning.main" style={{ fontSize: 32 }}>
                {consistency.streak}
              </Text>
            </View>
            <Text variant="caption" color="neutral.gray500" align="center">
              días racha
            </Text>
          </View>
        </View>

        {/* Footer con última sesión */}
        <View style={styles.consistencyFooter}>
          <Icon name="calendar" size={14} color={colors.neutral.gray400} />
          <Text variant="caption" color="neutral.gray500">
            {consistency.daysSinceLastWorkout === 0
              ? '¡Entrenaste hoy!'
              : consistency.daysSinceLastWorkout === 1
                ? 'Último entrenamiento: ayer'
                : `Último entrenamiento: hace ${consistency.daysSinceLastWorkout} días`
            }
          </Text>
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

  // Filtro Global
  globalFilterContainer: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
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

  // Period Filter
  periodFilter: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.base,
    backgroundColor: colors.neutral.gray100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.gray200,
  },
  periodButtonActive: {
    backgroundColor: colors.primary.main + '15',
    borderColor: colors.primary.main,
  },

  // Volumen
  volumeMain: {
    alignItems: 'center',
    paddingVertical: spacing.lg + 4,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary.main + '10',
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    minHeight: 120,
  },
  volumeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  volumeStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.neutral.gray50,
    borderRadius: radius.lg,
  },
  volumeDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral.gray200,
  },

  // Consistencia
  consistencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  consistencyColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  consistencyDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral.gray200,
  },
  streakInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  consistencyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },

  // Pie Chart
  chartContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  legendContainer: {
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emptyChart: {
    padding: spacing.xl,
    alignItems: 'center',
  },
});