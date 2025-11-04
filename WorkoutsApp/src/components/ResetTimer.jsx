import { View, StyleSheet, Pressable, Vibration } from 'react-native';
import { useState, useEffect } from 'react';

// Design System
import { colors, spacing, radius } from '@/design-systems/tokens';
import { Text, Button } from '@/design-systems/components';

export default function RestTimer({ restTime = 90, onComplete }) {
    const [timeLeft, setTimeLeft] = useState(restTime);
    const [isRunning, setIsRunning] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        let interval = null;

        if (isRunning && !isPaused && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, isPaused, timeLeft]);

    const handleComplete = () => {
        setIsRunning(false);

        // Vibrar
        Vibration.vibrate([0, 500, 200, 500]);

        // Callback
        if (onComplete) {
            setTimeout(() => onComplete(), 1000);
        }
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    const skip = () => {
        setIsRunning(false);
        if (onComplete) onComplete();
    };

    const addTime = (seconds) => {
        setTimeLeft((prev) => prev + seconds);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgressColor = () => {
        const percentage = (timeLeft / restTime) * 100;
        if (percentage > 66) return colors.success.main;
        if (percentage > 33) return colors.warning.main;
        return colors.danger.main;
        
    };

    if (!isRunning && timeLeft === 0) {
        return (
            <View style={styles.completedContainer}>
                <Text variant="h3" style={{ color: colors.neutral.white }}>
                    ✅ Descanso Completado
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="h3" color="neutral.gray600">
                    ⏱️ Descanso
                </Text>
            </View>

            {/* Timer circular visual */}
            <View style={styles.timerCircle}>
                <View style={[
                    styles.progressRing,
                    {
                        borderColor: getProgressColor(),
                        borderWidth: 8
                    }
                ]}>
                    <Text
                        variant="h1"
                        style={{
                            fontSize: 48,  // ← Más grande
                            color: getProgressColor(),
                            fontWeight: 'bold',
                            lineHeight: 52,  // ← Fix: lineHeight explícito
                            includeFontPadding: false,  // ← Android: quitar padding extra
                        }}
                    >
                        {formatTime(timeLeft)}
                    </Text>
                </View>
            </View>

            {/* Controles */}
            <View style={styles.controls}>
                <Pressable
                    style={styles.controlButton}
                    onPress={() => addTime(-10)}
                    disabled={timeLeft <= 10}
                >
                    <Text variant="bodySmall" color="neutral.gray600" bold>
                        -10s
                    </Text>
                </Pressable>

                <Pressable
                    style={[styles.controlButton, styles.pauseButton]}
                    onPress={togglePause}
                >
                    <Text variant="bodySmall" style={{ color: colors.neutral.white }} bold>
                        {isPaused ? '▶️' : '⏸️'}
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.controlButton}
                    onPress={() => addTime(10)}
                >
                    <Text variant="bodySmall" color="neutral.gray600" bold>
                        +10s
                    </Text>
                </Pressable>
            </View>

            <Button
                variant="ghost"
                onPress={skip}
            >
                ⏭️ Saltar
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.neutral.white,
        padding: spacing.base,  // ← De spacing.xl a spacing.base
        marginVertical: spacing.sm,  // ← Reducido
        marginHorizontal: spacing.sm + 2,
        alignItems: 'center',
        borderRadius: radius.lg,
    },
    header: {
        marginBottom: spacing.lg,
    },
    timerCircle: {
        marginBottom: spacing.xl,
    },
    progressRing: {
        width: 150,
        height: 150,
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.neutral.gray50,
    },
    controls: {
        flexDirection: 'row',
        gap: spacing.sm + 2,
        marginBottom: spacing.base,
    },
    controlButton: {
        backgroundColor: colors.neutral.gray100,
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.base,
        borderRadius: radius.base,
        minWidth: 60,
        alignItems: 'center',
    },
    pauseButton: {
        backgroundColor: colors.primary.main,
    },
    completedContainer: {
        backgroundColor: colors.success.main,
        padding: spacing.base,
        marginBottom: spacing.sm + 2,
        alignItems: 'center',
        borderRadius: radius.base,
    },
});