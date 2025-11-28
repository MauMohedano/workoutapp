import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, radius, Icon } from '@/design-systems/tokens';
import { Text, Card } from '@/design-systems/components';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const screenWidth = Dimensions.get('window').width;

/**
 * 📊 WEIGHT CHART COMPONENT
 * Gráfica de línea mostrando evolución del peso
 */
export default function WeightChart({ measurements }) {
    // Filtrar solo mediciones con peso y ordenar por fecha
    const measurementsWithWeight = measurements
        .filter(m => m.weight)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Si hay menos de 2 mediciones con peso, no mostrar gráfica
    if (measurementsWithWeight.length < 2) {
        return null;
    }

    // Preparar datos para la gráfica
    const weights = measurementsWithWeight.map(m => m.weight);
    const labels = measurementsWithWeight.map(m =>
        format(new Date(m.date), 'd MMM', { locale: es })
    );

    // Calcular min y max para escala
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const weightRange = maxWeight - minWeight;
    const padding = weightRange * 0.1 || 5; // 10% de padding o 5kg mínimo

    // Calcular cambio total
    const firstWeight = weights[0];
    const lastWeight = weights[weights.length - 1];
    const weightChange = lastWeight - firstWeight;

    const chartData = {
        labels: labels,
        datasets: [
            {
                data: weights,
                color: (opacity = 1) => colors.primary.main,
                strokeWidth: 3,
            }
        ],
    };

    const chartConfig = {
        backgroundColor: colors.neutral.white,
        backgroundGradientFrom: colors.neutral.white,
        backgroundGradientTo: colors.neutral.white,
        decimalPlaces: 1,
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
        style: {
            borderRadius: radius.lg,
        },
    };

    return (
        <Card shadow="md" style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <Icon name="analytics" size={20} color={colors.primary.main} />
                    <Text variant="bodyLarge" color="neutral.gray800" bold>
                        Progreso de Peso
                    </Text>
                </View>
                <View style={styles.changeIndicator}>
                    <Text
                        variant="bodySmall"
                        color={weightChange >= 0 ? "danger.main" : "success.main"}
                        bold
                    >
                        {weightChange >= 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                    </Text>
                </View>
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
                <LineChart
                    data={chartData}
                    width={screenWidth - spacing.base * 4} // Padding del card
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    fromZero={false}
                    segments={4}
                    yAxisSuffix=" kg"
                    yAxisInterval={1}
                    withInnerLines={true}
                    withOuterLines={false}
                    withVerticalLines={false}
                    withHorizontalLines={true}
                    withDots={true}
                    withShadow={false}
                    getDotColor={() => colors.primary.main}
                />
            </View>

            {/* Footer Info */}
            <View style={styles.footer}>
                <View style={styles.footerItem}>
                    <Text variant="caption" color="neutral.gray500">
                        Inicio
                    </Text>
                    <Text variant="bodyMedium" color="neutral.gray800" bold>
                        {firstWeight} kg
                    </Text>
                </View>
                <View style={styles.footerDivider} />
                <View style={styles.footerItem}>
                    <Text variant="caption" color="neutral.gray500">
                        Actual
                    </Text>
                    <Text variant="bodyMedium" color="neutral.gray800" bold>
                        {lastWeight} kg
                    </Text>
                </View>
                <View style={styles.footerDivider} />
                <View style={styles.footerItem}>
                    <Text variant="caption" color="neutral.gray500">
                        Mediciones
                    </Text>
                    <Text variant="bodyMedium" color="neutral.gray800" bold>
                        {measurementsWithWeight.length}
                    </Text>
                </View>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
    changeIndicator: {
        backgroundColor: colors.neutral.gray50,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs - 2,
        borderRadius: radius.base,
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: spacing.sm,
    },
    chart: {
        borderRadius: radius.lg,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.neutral.gray200,
    },
    footerItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    footerDivider: {
        width: 1,
        height: 30,
        backgroundColor: colors.neutral.gray200,
    },
});