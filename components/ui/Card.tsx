/**
 * ConnectGig — Card Component
 * Clean white card with soft shadow matching mockup's card-based layout
 */

import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { Colors } from '../../constants/colors';
import { Radii, Shadows, Spacing } from '../../constants/spacing';

type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  padding?: keyof typeof Spacing | number;
}

export function Card({
  children,
  variant = 'default',
  style,
  padding = 'lg',
}: CardProps) {
  const paddingValue = typeof padding === 'number' ? padding : Spacing[padding];

  return (
    <View
      style={[
        styles.base,
        variant === 'elevated' && Shadows.cardElevated,
        variant === 'default' && Shadows.card,
        variant === 'outlined' && styles.outlined,
        { padding: paddingValue },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
});
