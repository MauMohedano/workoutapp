import { View, Text, StyleSheet, Pressable, Vibration } from 'react-native';
import { useState, useEffect } from 'react';

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
        if (percentage > 66) return '#34C759';
        if (percentage > 33) return '#FF9500';
        return '#FF3B30';
    };

    if (!isRunning && timeLeft === 0) {
        return (
            <View style={styles.completedContainer}>
                <Text style={styles.completedText}>✅ Descanso Completado</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>⏱️ Descanso</Text>
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
                    <Text style={[styles.timeText, { color: getProgressColor() }]}>
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
                    <Text style={styles.controlButtonText}>-10s</Text>
                </Pressable>

                <Pressable 
                    style={[styles.controlButton, styles.pauseButton]}
                    onPress={togglePause}
                >
                    <Text style={styles.controlButtonText}>
                        {isPaused ? '▶️' : '⏸️'}
                    </Text>
                </Pressable>

                <Pressable 
                    style={styles.controlButton}
                    onPress={() => addTime(10)}
                >
                    <Text style={styles.controlButtonText}>+10s</Text>
                </Pressable>
            </View>

            <Pressable 
                style={styles.skipButton}
                onPress={skip}
            >
                <Text style={styles.skipButtonText}>⏭️ Saltar</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        padding: 20,
        marginBottom: 10,
        alignItems: 'center',
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    timerCircle: {
        marginBottom: 20,
    },
    progressRing: {
        width: 150,
        height: 150,
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    timeText: {
        fontSize: 42,
        fontWeight: 'bold',
    },
    controls: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    controlButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    pauseButton: {
        backgroundColor: '#007AFF',
    },
    controlButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    skipButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    skipButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    completedContainer: {
        backgroundColor: '#34C759',
        padding: 16,
        marginBottom: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    completedText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
});