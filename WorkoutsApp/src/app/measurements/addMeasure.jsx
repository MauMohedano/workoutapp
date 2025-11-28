import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useCreateMeasurement } from '../../hooks/useMeasurements';
import { colors, spacing, radius, Icon } from '@/design-systems/tokens';
import { Text, Button, Card } from '@/design-systems/components';
import FormInput from '../../components/FormInput';

export default function AddMeasurementScreen() {
    const router = useRouter();
    const { deviceId } = useLocalSearchParams();
    const createMutation = useCreateMeasurement();

    // Estados del formulario
    const [weight, setWeight] = useState('');
    const [chest, setChest] = useState('');
    const [waist, setWaist] = useState('');
    const [hips, setHips] = useState('');
    const [leftArm, setLeftArm] = useState('');
    const [rightArm, setRightArm] = useState('');
    const [leftThigh, setLeftThigh] = useState('');
    const [rightThigh, setRightThigh] = useState('');
    const [notes, setNotes] = useState('');

    // Validación
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        // Validar que al menos haya peso o una circunferencia
        const hasWeight = weight.trim() !== '';
        const hasCircumference = 
            chest.trim() !== '' ||
            waist.trim() !== '' ||
            hips.trim() !== '' ||
            leftArm.trim() !== '' ||
            rightArm.trim() !== '' ||
            leftThigh.trim() !== '' ||
            rightThigh.trim() !== '';

        if (!hasWeight && !hasCircumference) {
            newErrors.general = 'Debes ingresar al menos el peso o una circunferencia';
        }

        // Validar formato de números
        if (weight && (isNaN(weight) || parseFloat(weight) <= 0)) {
            newErrors.weight = 'Ingresa un peso válido';
        }
        if (chest && (isNaN(chest) || parseFloat(chest) <= 0)) {
            newErrors.chest = 'Ingresa una medida válida';
        }
        if (waist && (isNaN(waist) || parseFloat(waist) <= 0)) {
            newErrors.waist = 'Ingresa una medida válida';
        }
        if (hips && (isNaN(hips) || parseFloat(hips) <= 0)) {
            newErrors.hips = 'Ingresa una medida válida';
        }
        if (leftArm && (isNaN(leftArm) || parseFloat(leftArm) <= 0)) {
            newErrors.leftArm = 'Ingresa una medida válida';
        }
        if (rightArm && (isNaN(rightArm) || parseFloat(rightArm) <= 0)) {
            newErrors.rightArm = 'Ingresa una medida válida';
        }
        if (leftThigh && (isNaN(leftThigh) || parseFloat(leftThigh) <= 0)) {
            newErrors.leftThigh = 'Ingresa una medida válida';
        }
        if (rightThigh && (isNaN(rightThigh) || parseFloat(rightThigh) <= 0)) {
            newErrors.rightThigh = 'Ingresa una medida válida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            const measurementData = {
                deviceId,
                date: new Date().toISOString(),
            };

            // Agregar peso si existe
            if (weight.trim() !== '') {
                measurementData.weight = parseFloat(weight);
            }

            // Agregar circunferencias si existen
            const circumferences = {};
            if (chest.trim() !== '') circumferences.chest = parseFloat(chest);
            if (waist.trim() !== '') circumferences.waist = parseFloat(waist);
            if (hips.trim() !== '') circumferences.hips = parseFloat(hips);
            if (leftArm.trim() !== '') circumferences.leftArm = parseFloat(leftArm);
            if (rightArm.trim() !== '') circumferences.rightArm = parseFloat(rightArm);
            if (leftThigh.trim() !== '') circumferences.leftThigh = parseFloat(leftThigh);
            if (rightThigh.trim() !== '') circumferences.rightThigh = parseFloat(rightThigh);

            if (Object.keys(circumferences).length > 0) {
                measurementData.circumferences = circumferences;
            }

            // Agregar notas si existen
            if (notes.trim() !== '') {
                measurementData.notes = notes.trim();
            }

            await createMutation.mutateAsync(measurementData);

            Alert.alert(
                '✅ Medición guardada',
                'Tu medición se ha registrado correctamente',
                [
                    {
                        text: 'Ver mediciones',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar la medición');
            console.error('Error creating measurement:', error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <Stack.Screen
                options={{
                    title: 'Nueva Medición',
                    headerBackTitle: 'Cancelar',
                }}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Icon name="ruler" size={48} color={colors.primary.main} />
                    <Text variant="h2" color="neutral.gray900" style={{ marginTop: spacing.sm }}>
                        Registrar Medición
                    </Text>
                    <Text variant="body" color="neutral.gray500" align="center" style={{ marginTop: spacing.xs }}>
                        Ingresa al menos tu peso o una circunferencia
                    </Text>
                </View>

                {/* Error general */}
                {errors.general && (
                    <Card style={styles.errorCard}>
                        <Icon name="error" size={20} color={colors.danger.main} />
                        <Text variant="bodySmall" color="danger.main" style={{ flex: 1 }}>
                            {errors.general}
                        </Text>
                    </Card>
                )}

                {/* Peso Section */}
                <Card style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="scale" size={24} color={colors.primary.main} />
                        <Text variant="bodyLarge" color="neutral.gray800" bold>
                            Peso Corporal
                        </Text>
                    </View>

                    <FormInput
                        label="Peso"
                        value={weight}
                        onChangeText={setWeight}
                        placeholder="75.5"
                        keyboardType="decimal-pad"
                        error={errors.weight}
                        style={{ marginBottom: 0 }}
                    />
                    <Text variant="caption" color="neutral.gray500" style={{ marginTop: spacing.xs }}>
                        En kilogramos (kg)
                    </Text>
                </Card>

                {/* Circunferencias Section */}
                <Card style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="ruler" size={24} color={colors.primary.main} />
                        <Text variant="bodyLarge" color="neutral.gray800" bold>
                            Circunferencias
                        </Text>
                    </View>

                    <Text variant="body" color="neutral.gray600" style={{ marginBottom: spacing.md }}>
                        Todas las medidas son opcionales
                    </Text>

                    {/* Torso */}
                    <Text variant="bodyMedium" color="neutral.gray700" bold style={{ marginBottom: spacing.sm }}>
                        Torso
                    </Text>
                    <FormInput
                        label="Pecho"
                        value={chest}
                        onChangeText={setChest}
                        placeholder="95"
                        keyboardType="decimal-pad"
                        error={errors.chest}
                    />
                    <FormInput
                        label="Cintura"
                        value={waist}
                        onChangeText={setWaist}
                        placeholder="80"
                        keyboardType="decimal-pad"
                        error={errors.waist}
                    />
                    <FormInput
                        label="Cadera"
                        value={hips}
                        onChangeText={setHips}
                        placeholder="95"
                        keyboardType="decimal-pad"
                        error={errors.hips}
                    />

                    {/* Brazos */}
                    <Text variant="bodyMedium" color="neutral.gray700" bold style={{ marginBottom: spacing.sm, marginTop: spacing.md }}>
                        Brazos
                    </Text>
                    <View style={styles.rowInputs}>
                        <View style={{ flex: 1 }}>
                            <FormInput
                                label="Brazo Izquierdo"
                                value={leftArm}
                                onChangeText={setLeftArm}
                                placeholder="35"
                                keyboardType="decimal-pad"
                                error={errors.leftArm}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <FormInput
                                label="Brazo Derecho"
                                value={rightArm}
                                onChangeText={setRightArm}
                                placeholder="35"
                                keyboardType="decimal-pad"
                                error={errors.rightArm}
                            />
                        </View>
                    </View>

                    {/* Piernas */}
                    <Text variant="bodyMedium" color="neutral.gray700" bold style={{ marginBottom: spacing.sm }}>
                        Piernas
                    </Text>
                    <View style={styles.rowInputs}>
                        <View style={{ flex: 1 }}>
                            <FormInput
                                label="Pierna Izquierda"
                                value={leftThigh}
                                onChangeText={setLeftThigh}
                                placeholder="55"
                                keyboardType="decimal-pad"
                                error={errors.leftThigh}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <FormInput
                                label="Pierna Derecha"
                                value={rightThigh}
                                onChangeText={setRightThigh}
                                placeholder="55"
                                keyboardType="decimal-pad"
                                error={errors.rightThigh}
                            />
                        </View>
                    </View>

                    <Text variant="caption" color="neutral.gray500" style={{ marginTop: spacing.xs }}>
                        Todas las medidas en centímetros (cm)
                    </Text>
                </Card>

                {/* Notas Section */}
                <Card style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="note" size={24} color={colors.primary.main} />
                        <Text variant="bodyLarge" color="neutral.gray800" bold>
                            Notas (opcional)
                        </Text>
                    </View>

                    <FormInput
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Ej: Me siento con más energía, semana de volumen..."
                        multiline
                        numberOfLines={4}
                        maxLength={500}
                        style={{ marginBottom: 0 }}
                    />
                </Card>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <Button
                        variant="primary"
                        size="lg"
                        onPress={handleSubmit}
                        loading={createMutation.isPending}
                        disabled={createMutation.isPending}
                        icon="save"
                    >
                        Guardar Medición
                    </Button>

                    <Button
                        variant="ghost"
                        size="lg"
                        onPress={() => router.back()}
                        disabled={createMutation.isPending}
                    >
                        Cancelar
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral.gray100,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.base,
        paddingBottom: spacing.xl,
    },

    // Header
    header: {
        alignItems: 'center',
        marginBottom: spacing.lg,
        paddingTop: spacing.md,
    },

    // Error Card
    errorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        backgroundColor: colors.danger.main + '10',
        borderWidth: 1,
        borderColor: colors.danger.main + '30',
        marginBottom: spacing.lg,
    },

    // Sections
    section: {
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },

    // Row Inputs
    rowInputs: {
        flexDirection: 'row',
        gap: spacing.md,
    },

    // Buttons
    buttonContainer: {
        gap: spacing.md,
        marginTop: spacing.md,
    },
});