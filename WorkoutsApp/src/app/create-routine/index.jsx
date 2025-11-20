import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

// Design System
import { colors, spacing, radius, shadows } from '@/design-systems/tokens';
import { Text, Button, Card } from '@/design-systems/components';

// Components
import FormInput from '../../components/FormInput';

export default function CreateRoutineScreen() {
  const router = useRouter();

  // Estado del formulario
  const [routineName, setRoutineName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDays, setSelectedDays] = useState(3);
  const [selectedWeeks, setSelectedWeeks] = useState(8)

  // Validación
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!routineName.trim()) {
      newErrors.routineName = 'El nombre es obligatorio';
    }

    if (routineName.trim().length < 3) {
      newErrors.routineName = 'El nombre debe tener al menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios');
      return;
    }

    // Navegar al paso 2 con los datos
    router.push({
      pathname: '/create-routine/configure-days',
      params: {
        routineName,
        description,
        totalDays: selectedDays,
        totalSessions: selectedDays * selectedWeeks,
      },
    });
  };

  const dayOptions = [3, 4, 5, 6];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Crear Rutina',
          headerBackTitle: 'Cancelar',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h1" color="neutral.gray900">
            Nueva Rutina 💪
          </Text>
          <Text variant="body" color="neutral.gray600" style={{ marginTop: spacing.xs }}>
            Paso 1 de 3: Información básica
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '33%' }]} />
        </View>

        {/* Form */}
        <Card style={styles.formCard}>
          {/* Nombre */}
          <FormInput
            label="Nombre de la rutina"
            value={routineName}
            onChangeText={setRoutineName}
            placeholder="Ej: Push Pull Legs"
            required
            maxLength={50}
            error={errors.routineName}
          />

          {/* Descripción */}
          <FormInput
            label="Descripción"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe tu rutina... (opcional)"
            multiline
            numberOfLines={4}
            maxLength={200}
          />

          {/* Días selector */}
          <View style={styles.daysSelector}>
            <View style={styles.labelRow}>
              <Text variant="bodySmall" color="neutral.gray700" bold>
                ¿Cuántos días por semana?
              </Text>
              <Text variant="bodySmall" color="danger.main">
                *
              </Text>
            </View>

            <View style={styles.daysOptions}>
              {dayOptions.map((days) => (
                <Button
                  key={days}
                  variant={selectedDays === days ? 'primary' : 'secondary'}
                  size="md"
                  onPress={() => setSelectedDays(days)}
                  style={styles.dayButton}
                >
                  {days} días
                </Button>
              ))}
            </View>

            <Text variant="caption" color="neutral.gray500" style={{ marginTop: spacing.sm }}>
              Este será el ciclo que se repetirá cada semana
            </Text>
          </View>
        </Card>
        
        {/* Weeks selector */}
        <Card style={styles.formCard}>
          <View style={styles.weeksSelector}>
            <View style={styles.labelRow}>
              <Text variant="bodySmall" color="neutral.gray700" bold>
                ¿Duración del programa?
              </Text>
              <Text variant="bodySmall" color="danger.main">
                *
              </Text>
            </View>

            <View style={styles.stepperContainer}>
              <Pressable
                style={[
                  styles.stepperButton,
                  selectedWeeks <= 4 && styles.stepperButtonDisabled
                ]}
                onPress={() => setSelectedWeeks(prev => Math.max(4, prev - 1))}
                disabled={selectedWeeks <= 4}
              >
                <Text variant="h3" color={selectedWeeks <= 4 ? 'neutral.gray300' : 'primary.main'}>
                  −
                </Text>
              </Pressable>

              <View style={styles.stepperValue}>
                <Text variant="h2" color="neutral.gray900">
                  {selectedWeeks}
                </Text>
                <Text variant="bodySmall" color="neutral.gray500">
                  semanas
                </Text>
              </View>

              <Pressable
                style={[
                  styles.stepperButton,
                  selectedWeeks >= 12 && styles.stepperButtonDisabled
                ]}
                onPress={() => setSelectedWeeks(prev => Math.min(12, prev + 1))}
                disabled={selectedWeeks >= 12}
              >
                <Text variant="h3" color={selectedWeeks >= 12 ? 'neutral.gray300' : 'primary.main'}>
                  +
                </Text>
              </Pressable>
            </View>

            {/* Total sessions display */}
            <View style={styles.sessionsInfo}>
              <Text variant="bodySmall" color="neutral.gray600">
                📊 Total: <Text bold color="primary.main">{selectedWeeks * selectedDays} sesiones</Text>
              </Text>
            </View>
          </View>
        </Card>

        {/* Info card */}
        <Card style={styles.infoCard}>
          <Text variant="bodySmall" color="neutral.gray700">
            💡 <Text bold>Consejo:</Text> Una rutina de 3-4 días es ideal para principiantes.
            Rutinas de 5-6 días son para usuarios avanzados.
          </Text>
        </Card>
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomActions}>
        <Button
          variant="secondary"
          fullWidth
          onPress={() => router.back()}
        >
          Cancelar
        </Button>

        <Button
          variant="primary"
          fullWidth
          onPress={handleNext}
          icon="arrow-forward"
          iconPosition="right"
        >
          Siguiente: Días
        </Button>
      </View>
    </View>
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
    padding: spacing.lg,
    paddingBottom: 120, // Espacio para los botones
  },

  // Header
  header: {
    marginBottom: spacing.lg,
  },

  // Progress bar
  progressBar: {
    height: 6,
    backgroundColor: colors.neutral.gray200,
    borderRadius: radius.base,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
  },

  // Form
  formCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },

  // Days selector
  daysSelector: {
    marginTop: spacing.sm,
  },
  daysOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  dayButton: {
    flex: 1,
    minWidth: 70,
  },

  // Weeks selector
  weeksSelector: {
    marginTop: spacing.md,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonDisabled: {
    backgroundColor: colors.neutral.gray50,
  },
  stepperValue: {
    alignItems: 'center',
    minWidth: 80,
  },
  sessionsInfo: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
    marginTop: spacing.sm,
  },

  // Info card
  infoCard: {
    padding: spacing.md,
    backgroundColor: colors.primary.main + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
  },

  // Bottom actions
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral.white,
    padding: spacing.lg,
    ...shadows.xl,
    gap: spacing.sm,
  },
});