/**
 * 🎯 DESIGN TOKENS: ICONS
 */

import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './colors';

export const iconMap = {
  // Navegación
  home: 'home-outline',
  back: 'arrow-back',
  close: 'close',
  
  // Acciones
  add: 'add-circle-outline',
  edit: 'create-outline',
  delete: 'trash-outline',
  
  // Fitness
  workout: 'fitness-outline',
  dumbbell: 'barbell-outline',
  timer: 'timer-outline',
  calendar: 'calendar-outline',
  flame: 'flame-outline',
  star: 'star-outline',
  starActive: 'star',
  
  // Estados
  error: 'alert-circle-outline',
  success: 'checkmark-circle-outline',
};

export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
};

export const Icon = ({ 
  name, 
  size = 'md', 
  color,
  style,
  ...props 
}) => {
  const iconName = iconMap[name] || name;
  const iconSize = typeof size === 'string' ? iconSizes[size] : size;
  
  let iconColor = color;
  if (typeof color === 'string' && color.includes('.')) {
    const parts = color.split('.');
    let resolved = colors;
    for (const part of parts) {
      resolved = resolved[part];
    }
    iconColor = resolved;
  }
  
  return (
    <Ionicons 
      name={iconName}
      size={iconSize}
      color={iconColor || colors.neutral.gray500}
      style={style}
      {...props}
    />
  );
};

export default { Icon, iconMap, iconSizes };