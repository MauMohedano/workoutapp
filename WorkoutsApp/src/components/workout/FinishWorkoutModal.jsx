import React from 'react';
import { Modal, View, StyleSheet, Alert } from 'react-native';
import Text from '../../design-systems/components/Text';
import Button from '../../design-systems/components/Button';
import { colors, spacing, radius } from '../../design-systems/tokens';

export const FinishWorkoutModal = ({ 
  visible, 
  onClose, 
  onConfirm,
  completedExercises = 0,
  totalExercises = 0,
  isFullyCompleted = false
}) => {
  
  const progressPercentage = totalExercises > 0 
    ? Math.round((completedExercises / totalExercises) * 100) 
    : 0;

  const handleConfirm = () => {
    // Si no está completo, mostrar confirmación extra
    if (!isFullyCompleted && completedExercises < totalExercises) {
      Alert.alert(
        'Rutina Incompleta',
        `Solo has completado ${completedExercises} de ${totalExercises} ejercicios. ¿Terminar de todas formas?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Sí, terminar', 
            style: 'destructive',
            onPress: onConfirm 
          }
        ]
      );
    } else {
      onConfirm();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          {/* Header */}
          <Text variant="h2" style={styles.title}>
            Terminar Rutina
          </Text>

          {/* Progress Info */}
          <View style={styles.progressContainer}>
            <Text variant="body" style={styles.progressText}>
              Progreso de hoy
            </Text>
            <Text style={styles.progressNumber}>
              {completedExercises}/{totalExercises}
            </Text>
            <Text variant="caption" style={styles.progressLabel}>
              ejercicios completados ({progressPercentage}%)
            </Text>
          </View>

          {/* Warning si no está completo */}
          {!isFullyCompleted && completedExercises < totalExercises && (
            <View style={styles.warningBox}>
              <Text variant="caption" style={styles.warningText}>
                ⚠️ Aún te faltan {totalExercises - completedExercises} ejercicios
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Button 
              variant="secondary" 
              onPress={onClose}
              style={styles.button}
            >
              Continuar entrenando
            </Button>
            <Button 
              variant="primary" 
              onPress={handleConfirm}
              style={styles.button}
            >
              {isFullyCompleted ? '✓ Finalizar sesión' : 'Terminar ahora'}
            </Button>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    backgroundColor: colors.backgrounds.elevated,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.neutral.gray200,
    marginBottom: spacing.lg,
    minHeight: 160,
  },
  progressText: {
    color: colors.neutral.gray600,
    marginBottom: spacing.xs,
  },
  progressNumber: {
    color: colors.primary.main,
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: spacing.sm,
    lineHeight: 60,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  progressLabel: {
    color: colors.neutral.gray600,
  },
  warningBox: {
    backgroundColor: colors.warning.light,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  warningText: {
    color: colors.warning.dark,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
});