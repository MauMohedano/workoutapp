import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, radius, Icon } from '@/design-systems/tokens';
import { Text, Card } from '@/design-systems/components';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;


export default function PerformanceTab({ stats, onPeriodChange, currentPeriod }) {
  const { topExercises, weeklyVolume } = stats;

  const periods = [
    { key: 'week', label: 'Semana' },
    { key: 'month', label: 'Mes' },
    { key: 'year', label: 'Año' },
    { key: 'all', label: 'Todo' },
  ];

  // Labels dinámicos según período
  const getPeriodLabels = (period) => {
    switch (period) {
      case 'week':
        return { title: 'Progreso Semanal', unit: 'kg/semana' };
      case 'month':
        return { title: 'Progreso Mensual', unit: 'kg/mes' };
      case 'year':
        return { title: 'Progreso Anual', unit: 'kg/año' };
      case 'all':
        return { title: 'Progreso Total', unit: 'kg/semana' };
      default:
        return { title: 'Progreso', unit: 'kg' };
    }
  };

  const periodLabels = getPeriodLabels(currentPeriod);

  // Preparar datos para gráfica de volumen semanal
  const hasWeeklyData = weeklyVolume && weeklyVolume.length > 1;

  const chartData = hasWeeklyData ? {
    labels: weeklyVolume.map(w => {
      const date = new Date(w.week);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [{
      data: weeklyVolume.map(w => w.volume),
      color: (opacity = 1) => colors.primary.main,
      strokeWidth: 3,
    }],
  } : null;

  const chartConfig = {
    backgroundColor: colors.neutral.gray100,  // 👈 Color de fondo de la app
    backgroundGradientFrom: colors.neutral.gray100,  // 👈 Mismo color
    backgroundGradientTo: colors.neutral.gray100,  // 👈 Mismo color
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary.main,
    labelColor: (opacity = 1) => colors.neutral.gray600,
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.accent.main,
      fill: colors.primary.main,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.neutral.gray200,
      strokeWidth: 1,
    },
    propsForLabels: {
      fontWeight: 'bold',  // 👈 Labels en negrita
    },
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

      {/* Progreso */}
      {hasWeeklyData && (
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Icon name="analytics" size={24} color={colors.primary.main} />
            <Text variant="bodyLarge" color="neutral.gray800" bold>
              {periodLabels.title}
            </Text>
          </View>
          {/* Stats arriba de la gráfica */}
          <Card shadow="lg" style={styles.weeklyStatsCard}>
            <View style={styles.weeklyStatsTop}>
              <View style={styles.weeklyStatTopItem}>
                <Text variant="caption" color="neutral.gray500" bold>
                  Promedio
                </Text>
                <Text variant="h3" color="neutral.gray800" bold>
                  {Math.round(weeklyVolume.reduce((sum, w) => sum + w.volume, 0) / weeklyVolume.length).toLocaleString()}
                </Text>
                <Text variant="caption" color="neutral.gray500" bold>
                  {periodLabels.unit}
                </Text>
              </View>

              <View style={styles.weeklyStatDivider} />

              <View style={styles.weeklyStatTopItem}>
                <Text variant="caption" color="neutral.gray500" bold>
                  Mejor
                </Text>
                <Text variant="h3" color="primary.main" bold>
                  {Math.max(...weeklyVolume.map(w => w.volume)).toLocaleString()}
                </Text>
                <Text variant="caption" color="neutral.gray500" bold>
                  kg
                </Text>
              </View>

              <View style={styles.weeklyStatDivider} />

              <View style={styles.weeklyStatTopItem}>
                <Text variant="caption" color="neutral.gray500" bold>
                  Total
                </Text>
                <Text variant="h3" color="success.main" bold>
                  {weeklyVolume.reduce((sum, w) => sum + w.volume, 0).toLocaleString()}
                </Text>
                <Text variant="caption" color="neutral.gray500" bold>
                  kg
                </Text>
              </View>
            </View>
          </Card>

          {/* Gráfica sin fondo blanco */}
          <View style={styles.chartWrapper}>
            <LineChart
              data={chartData}
              width={screenWidth - 32}
              height={200}
              chartConfig={{
                ...chartConfig,
                propsForLabels: {
                  fontWeight: 'bold',  // 👈 Labels en negrita
                },
              }}
              bezier
              style={styles.chart}
              fromZero={false}
              segments={3}
              yAxisSuffix="kg"
              yAxisInterval={1}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines={true}
              withDots={true}
              withShadow={false}
              getDotColor={() => colors.primary.main}
              renderDotContent={({ x, y, index }) => (
                <View
                  key={index}
                  style={{
                    position: 'absolute',
                    top: y - 20,
                    left: x - 20,
                  }}
                >
                  <View style={styles.dotLabel}>
                    <Text variant="caption" color="primary.main" bold style={{ fontWeight: 'bold' }}>
                      {weeklyVolume[index].volume.toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      )}

      {/* Top Ejercicios */}
      <Card shadow="lg" style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="trophy" size={24} color={colors.warning.main} />
          <Text variant="bodyLarge" color="neutral.gray800" bold>
            Top 5 Ejercicios
          </Text>
        </View>

        {topExercises.length > 0 ? (
          <View style={styles.exercisesList}>
            {topExercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseCard}>
                {/* Ranking badge */}
                {/* Ejercicio info */}
                <View style={styles.exerciseInfo}>
                  <Text variant="bodyMedium" color="neutral.gray800" bold numberOfLines={1}>
                    {exercise.exercise}
                  </Text>
                  <Text variant="caption" color="neutral.gray500">
                    {exercise.totalSets} sets • Volumen: {exercise.totalVolume.toLocaleString()} kg
                  </Text>
                </View>

                {/* Stats grid */}
                <View style={styles.exerciseStats}>
                  <View style={styles.exerciseStat}>
                    <Text variant="caption" color="neutral.gray500">
                      Máximo
                    </Text>
                    <Text variant="bodyMedium" color="neutral.gray800" bold>
                      {exercise.maxWeight} kg
                    </Text>
                    <Text variant="caption" color="neutral.gray500">
                      × {exercise.maxWeightReps} reps
                    </Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.exerciseStat}>
                    <Text variant="caption" color="neutral.gray500">
                      1RM Est.
                    </Text>
                    <Text variant="h3" color="primary.main">
                      {exercise.estimated1RM}
                    </Text>
                    <Text variant="caption" color="neutral.gray500">
                      kg
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="dumbbell" size={48} color={colors.neutral.gray300} />
            <Text variant="body" color="neutral.gray500" style={{ marginTop: spacing.sm }}>
              No hay ejercicios registrados
            </Text>
          </View>
        )}
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

  // Period Filter
  periodFilter: {
    flexDirection: 'row',
    gap: spacing.xs,
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

  // Cards
  card: {
    padding: spacing.lg,
    paddingHorizontal: spacing.xs,  // 👈 AGREGAR ESTA LÍNEA (reduce padding izq/der)
    marginBottom: spacing.md,
  },
  chartCard: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md,
    marginHorizontal: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  // Chart
  chart: {

    marginBottom: spacing.md,
  },
  weeklyStats: {
    flexDirection: 'row',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  weeklyStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  weeklyDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral.gray200,
  },

  // Ejercicios
  exercisesList: {
    gap: spacing.md,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral.gray50,
    borderRadius: radius.lg,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadgeGold: {
    backgroundColor: '#FFD700',
  },
  rankBadgeSilver: {
    backgroundColor: '#C0C0C0',
  },
  rankBadgeBronze: {
    backgroundColor: '#CD7F32',
  },
  exerciseInfo: {
    flex: 1,
    gap: 2,
  },
  exerciseStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  exerciseStat: {
    alignItems: 'center',
    minWidth: 70,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.neutral.gray200,
  },

  // Empty state
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  // Chart
  chartWrapper: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingHorizontal: 0,  // 👈 Sin padding horizontal
    width: '100%',  // 👈 AGREGAR ESTO
    overflow: 'visible',

  },
  chart: {
    borderRadius: radius.lg,
  },
  weeklyStatsTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral.gray50,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  weeklyStatTopItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  weeklyStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral.gray200,
  },
  dotLabel: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
});