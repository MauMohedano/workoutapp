import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { colors, spacing, radius, Icon } from '@/design-systems/tokens';
import { Text } from '@/design-systems/components';
import SessionSection from './SessionSection';
import { useState, useRef, useEffect } from 'react';

/**
 * 📜 HISTORY SECTION COLLAPSIBLE
 * Sección colapsable "Ver más historial" (sesiones 5-1)
 * 
 * @param {Array} sessions - Array de sesiones históricas [{sessionNumber, date, sets}]
 */
export default function HistorySectionCollapsible({ sessions = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(heightAnim, {
        toValue: isExpanded ? 1 : 0,
        tension: 50,
        friction: 7,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isExpanded]);

  if (!sessions || sessions.length === 0) return null;

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      {/* Collapsible Header */}
      <Pressable 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Icon name="time" size={18} color={colors.neutral.gray600} />
        <Text variant="bodyMedium" color="neutral.gray700" bold style={styles.headerText}>
          {isExpanded ? 'OCULTAR HISTORIAL ANTIGUO' : `VER MÁS HISTORIAL (${sessions.length} sesiones)`}
        </Text>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Icon name="chevron-down" size={20} color={colors.neutral.gray600} />
        </Animated.View>
      </Pressable>

      {/* Expandable Content */}
      {isExpanded && (
        <Animated.View
          style={[
            styles.content,
            {
              opacity: heightAnim,
              maxHeight: heightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 3000],
              }),
            },
          ]}
        >
          {sessions.map((session, index) => (
            <SessionSection
              key={index}
              title={session.date}
              subtitle={`Sesión ${session.sessionNumber}`}
              sets={session.sets}
              isCurrentSession={false}
              icon="calendar"
            />
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral.gray100,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.gray300,
    borderStyle: 'dashed',
  },
  headerText: {
    flex: 1,
  },
  content: {
    marginTop: spacing.md,
    overflow: 'hidden',
  },
});