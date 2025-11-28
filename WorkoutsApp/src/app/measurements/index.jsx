import { View, StyleSheet, ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMeasurements, useLatestMeasurement, useDeleteMeasurement } from '../../hooks/useMeasurements';
import { colors, spacing, radius, shadows, Icon } from '@/design-systems/tokens';
import { Text, Button, Card } from '@/design-systems/components';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import WeightChart from '../../components/measurements/WeightChart';

export default function MeasurementsScreen() {
    const router = useRouter();
    const { deviceId } = useLocalSearchParams();

    const { data: measurementsResponse, isLoading, error } = useMeasurements(deviceId);
    const { data: latestResponse } = useLatestMeasurement(deviceId);
    const deleteMutation = useDeleteMeasurement();

    const measurements = measurementsResponse?.data || [];
    const latestMeasurement = latestResponse?.data;


    // Calcular cambio de peso
    const weightChange = measurements.length >= 2
        ? (measurements[0].weight || 0) - (measurements[measurements.length - 1].weight || 0)
        : null;

    const handleDelete = (id) => {
        Alert.alert(
            'Eliminar medición',
            '¿Estás seguro de que quieres eliminar esta medición?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        deleteMutation.mutate({ id, deviceId });
                    },
                },
            ]
        );
    };

    // Loading state
    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary.main} />
                <Text variant="bodyMedium" color="neutral.gray500" style={{ marginTop: spacing.md }}>
                    Cargando mediciones...
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
    if (!measurements || measurements.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.emptyIcon}>
                    <Icon name="ruler" size={64} color={colors.primary.main} />
                </View>
                <Text variant="h2" color="neutral.gray900" style={{ marginTop: spacing.lg }}>
                    Sin mediciones aún
                </Text>
                <Text variant="body" color="neutral.gray500" align="center" style={{ marginTop: spacing.sm, maxWidth: 280 }}>
                    Registra tu primera medición para empezar a trackear tu progreso
                </Text>
                <Button
                    variant="primary"
                    size="lg"
                    icon="add"
                    onPress={() => router.push(`/measurements/add?deviceId=${deviceId}`)}
                    style={{ marginTop: spacing.xl }}
                >
                    Agregar Medición
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Mediciones',
                    headerBackTitle: 'Atrás',
                }}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text variant="h1" color="neutral.gray900">
                        Mis Mediciones
                    </Text>
                    <Text variant="body" color="neutral.gray500">
                        {measurements.length} {measurements.length === 1 ? 'medición registrada' : 'mediciones registradas'}
                    </Text>
                </View>

                {/* Latest Measurement Card */}
                {latestMeasurement && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="starActive" size={20} color={colors.accent.main} />
                            <Text variant="bodyLarge" color="neutral.gray800" bold>
                                Última Medición
                            </Text>
                        </View>

                        <Card shadow="xl" style={styles.latestCard}>
                            <View style={styles.latestHeader}>
                                <View style={styles.latestBadge}>
                                    <Icon name="calendar" size={14} color={colors.accent.main} />
                                    <Text variant="caption" style={styles.latestBadgeText}>
                                        {format(new Date(latestMeasurement.date), 'dd MMM yyyy', { locale: es }).toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            {/* Weight */}
                            {latestMeasurement.weight && (
                                <View style={styles.latestMainStat}>
                                    <Text variant="h1" color="primary.main">
                                        {latestMeasurement.weight}
                                    </Text>
                                    <Text variant="bodyLarge" color="neutral.gray600" style={{ marginLeft: spacing.xs }}>
                                        kg
                                    </Text>
                                </View>
                            )}

                            {/* Weight Change */}
                            {weightChange !== null && weightChange !== 0 && (
                                <View style={styles.changeIndicator}>
                                    <Icon
                                        name={weightChange > 0 ? "arrow-up" : "arrow-down"}
                                        size={16}
                                        color={weightChange > 0 ? colors.danger.main : colors.success.main}
                                    />
                                    <Text
                                        variant="bodySmall"
                                        color={weightChange > 0 ? "danger.main" : "success.main"}
                                        bold
                                    >
                                        {Math.abs(weightChange).toFixed(1)} kg desde el inicio
                                    </Text>
                                </View>
                            )}

                            {/* Circumferences */}
                            {latestMeasurement.circumferences && Object.values(latestMeasurement.circumferences).some(v => v) && (
                                <View style={styles.circumferencesGrid}>
                                    {latestMeasurement.circumferences.chest && (
                                        <View style={styles.circumferenceItem}>
                                            <Text variant="caption" color="neutral.gray500">Pecho</Text>
                                            <Text variant="bodyMedium" color="neutral.gray800" bold>
                                                {latestMeasurement.circumferences.chest} cm
                                            </Text>
                                        </View>
                                    )}
                                    {latestMeasurement.circumferences.waist && (
                                        <View style={styles.circumferenceItem}>
                                            <Text variant="caption" color="neutral.gray500">Cintura</Text>
                                            <Text variant="bodyMedium" color="neutral.gray800" bold>
                                                {latestMeasurement.circumferences.waist} cm
                                            </Text>
                                        </View>
                                    )}
                                    {latestMeasurement.circumferences.hips && (
                                        <View style={styles.circumferenceItem}>
                                            <Text variant="caption" color="neutral.gray500">Cadera</Text>
                                            <Text variant="bodyMedium" color="neutral.gray800" bold>
                                                {latestMeasurement.circumferences.hips} cm
                                            </Text>
                                        </View>
                                    )}
                                    {latestMeasurement.circumferences.leftArm && (
                                        <View style={styles.circumferenceItem}>
                                            <Text variant="caption" color="neutral.gray500">Brazo Izq</Text>
                                            <Text variant="bodyMedium" color="neutral.gray800" bold>
                                                {latestMeasurement.circumferences.leftArm} cm
                                            </Text>
                                        </View>
                                    )}
                                    {latestMeasurement.circumferences.rightArm && (
                                        <View style={styles.circumferenceItem}>
                                            <Text variant="caption" color="neutral.gray500">Brazo Der</Text>
                                            <Text variant="bodyMedium" color="neutral.gray800" bold>
                                                {latestMeasurement.circumferences.rightArm} cm
                                            </Text>
                                        </View>
                                    )}
                                    {latestMeasurement.circumferences.leftThigh && (
                                        <View style={styles.circumferenceItem}>
                                            <Text variant="caption" color="neutral.gray500">Pierna Izq</Text>
                                            <Text variant="bodyMedium" color="neutral.gray800" bold>
                                                {latestMeasurement.circumferences.leftThigh} cm
                                            </Text>
                                        </View>
                                    )}
                                    {latestMeasurement.circumferences.rightThigh && (
                                        <View style={styles.circumferenceItem}>
                                            <Text variant="caption" color="neutral.gray500">Pierna Der</Text>
                                            <Text variant="bodyMedium" color="neutral.gray800" bold>
                                                {latestMeasurement.circumferences.rightThigh} cm
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Notes */}
                            {latestMeasurement.notes && (
                                <View style={styles.notesContainer}>
                                    <Icon name="note" size={16} color={colors.neutral.gray500} />
                                    <Text variant="bodySmall" color="neutral.gray600" style={{ flex: 1 }}>
                                        {latestMeasurement.notes}
                                    </Text>
                                </View>
                            )}
                        </Card>
                    </View>
                )}

                {/* ===== GRÁFICA DE PESO ===== */}
                <View style={styles.section}>
                    <WeightChart measurements={measurements} />
                </View>

                {/* History */}
                {measurements.length > 1 && (
                    <View style={styles.section}>
                        <Text variant="bodyLarge" color="neutral.gray800" bold style={{ marginBottom: spacing.md }}>
                            Historial
                        </Text>

                        <View style={styles.historyList}>
                            {measurements.slice(1).map((measurement) => (
                                <Card key={measurement._id} style={styles.historyCard}>
                                    <View style={styles.historyHeader}>
                                        <View style={styles.historyDate}>
                                            <Icon name="calendar" size={16} color={colors.neutral.gray500} />
                                            <Text variant="bodySmall" color="neutral.gray700">
                                                {format(new Date(measurement.date), 'dd MMM yyyy', { locale: es })}
                                            </Text>
                                        </View>
                                        <Pressable
                                            onPress={() => handleDelete(measurement._id)}
                                            hitSlop={8}
                                        >
                                            <Icon name="delete" size={20} color={colors.danger.main} />
                                        </Pressable>
                                    </View>

                                    <View style={styles.historyContent}>
                                        {measurement.weight && (
                                            <View style={styles.historyStatItem}>
                                                <Text variant="caption" color="neutral.gray500">Peso</Text>
                                                <Text variant="bodyMedium" color="neutral.gray800" bold>
                                                    {measurement.weight} kg
                                                </Text>
                                            </View>
                                        )}
                                        {measurement.circumferences?.chest && (
                                            <View style={styles.historyStatItem}>
                                                <Text variant="caption" color="neutral.gray500">Pecho</Text>
                                                <Text variant="bodyMedium" color="neutral.gray800" bold>
                                                    {measurement.circumferences.chest} cm
                                                </Text>
                                            </View>
                                        )}
                                        {measurement.circumferences?.waist && (
                                            <View style={styles.historyStatItem}>
                                                <Text variant="caption" color="neutral.gray500">Cintura</Text>
                                                <Text variant="bodyMedium" color="neutral.gray800" bold>
                                                    {measurement.circumferences.waist} cm
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {measurement.notes && (
                                        <View style={styles.historyNotes}>
                                            <Icon name="note" size={14} color={colors.neutral.gray400} />
                                            <Text variant="caption" color="neutral.gray600" numberOfLines={2} style={{ flex: 1 }}>
                                                {measurement.notes}
                                            </Text>
                                        </View>
                                    )}
                                </Card>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* FAB - Agregar nueva medición */}
            <Pressable
                style={styles.fab}
                onPress={() => router.push(`/measurements/addMeasure?deviceId=${deviceId}`)}
            >
                <Icon name="add" size={28} color={colors.neutral.white} />
            </Pressable>
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
        padding: spacing.xl,
    },
    emptyIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.primary.main + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },

    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.base,
        paddingBottom: 100,
    },

    // Header
    header: {
        marginBottom: spacing.lg,
    },

    // Sections
    section: {
        marginBottom: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },

    // Latest Measurement Card
    latestCard: {
        padding: spacing.lg,
        backgroundColor: colors.accent.main + '08',
        borderWidth: 2,
        borderColor: colors.accent.main + '30',
    },
    latestHeader: {
        marginBottom: spacing.md,
    },
    latestBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.accent.main,
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: radius.base,
    },
    latestBadgeText: {
        color: colors.neutral.gray900,
        fontWeight: '700',
        fontSize: 10,
        letterSpacing: 0.5,
    },
    latestMainStat: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: spacing.sm,
    },
    changeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: spacing.md,
    },
    circumferencesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.neutral.gray200,
    },
    circumferenceItem: {
        width: '30%',
        gap: 2,
    },
    notesContainer: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginTop: spacing.md,
        padding: spacing.sm,
        backgroundColor: colors.neutral.gray50,
        borderRadius: radius.base,
    },

    // History List
    historyList: {
        gap: spacing.md,
    },
    historyCard: {
        padding: spacing.base,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    historyDate: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    historyContent: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingVertical: spacing.sm,
    },
    historyStatItem: {
        gap: 2,
    },
    historyNotes: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.neutral.gray200,
    },

    // FAB
    fab: {
        position: 'absolute',
        right: spacing.base,
        bottom: spacing.base,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.xl,
        elevation: 8,
    },
});