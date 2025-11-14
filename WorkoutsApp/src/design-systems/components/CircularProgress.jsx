import React from 'react';
import { View, Text as RNText, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../tokens/colors';

/**
 * 📊 CIRCULAR PROGRESS COMPONENT
 * 
 * Muestra progreso circular con porcentaje.
 * 
 * @param {number} percentage - Porcentaje (0-100)
 * @param {number} size - Tamaño del círculo (default: 48)
 * @param {string} color - Color del progreso
 * @param {string} backgroundColor - Color de fondo
 * @param {number} strokeWidth - Grosor del círculo (default: 4)
 */
export default function CircularProgress({
  percentage = 0,
  size = 48,
  color = colors.primary.main,
  backgroundColor = colors.neutral.gray300,
  strokeWidth = 4,
  showPercentage = true,
  style,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(percentage, 0), 100); // Clamp 0-100
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Color dinámico basado en porcentaje
  const getColor = () => {
    if (progress === 100) return colors.success.main;
    if (progress > 0) return colors.primary.main;
    return colors.neutral.gray300;
  };

  const activeColor = color || getColor();

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        {/* Círculo de fondo */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Círculo de progreso */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={activeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      
      {/* Texto de porcentaje */}
      {showPercentage && (
        <View style={styles.textContainer}>
          <RNText style={[
            styles.percentageText,
            { 
              fontSize: size * 0.25,
              color: progress > 0 ? colors.neutral.gray800 : colors.neutral.gray500
            }
          ]}>
            {Math.round(progress)}%
          </RNText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  textContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontWeight: '700',
    textAlign: 'center',
  },
});