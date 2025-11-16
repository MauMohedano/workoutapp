import { View, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, radius, shadows } from '@/design-systems/tokens';
import { Text } from '@/design-systems/components';

/**
 * 📝 FORM INPUT COMPONENT
 * Input reutilizable para formularios con label y validación
 */
export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  error,
  required = false,
  maxLength,
  keyboardType = 'default',
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <View style={styles.labelRow}>
          <Text variant="bodySmall" color="neutral.gray700" bold>
            {label}
          </Text>
          {required && (
            <Text variant="bodySmall" color="danger.main">
              *
            </Text>
          )}
        </View>
      )}

      {/* Input */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral.gray400}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        keyboardType={keyboardType}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          error && styles.inputError,
        ]}
      />

      {/* Error message */}
      {error && (
        <Text variant="caption" color="danger.main" style={styles.errorText}>
          {error}
        </Text>
      )}

      {/* Character count */}
      {maxLength && value && (
        <Text variant="caption" color="neutral.gray400" style={styles.charCount}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.neutral.white,
    borderWidth: 2,
    borderColor: colors.neutral.gray200,
    borderRadius: radius.lg,
    padding: spacing.md,
    fontSize: 16,
    color: colors.neutral.gray800,
    ...shadows.sm,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  inputError: {
    borderColor: colors.danger.main,
  },
  errorText: {
    marginTop: spacing.xs,
  },
  charCount: {
    textAlign: 'right',
    marginTop: spacing.xs - 2,
  },
});