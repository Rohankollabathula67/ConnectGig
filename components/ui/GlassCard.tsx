/**
 * ConnectGig — GlassCard Component
 * Implements translucent, blurred, visionOS-style floating glass surfaces using expo-blur.
 * Provides a performant solid border fallback on Android.
 */

import React from 'react';
import { StyleSheet, View, Platform, useColorScheme, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../../constants/colors';

interface GlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}

export function GlassCard({ children, style, intensity = 45 }: GlassCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tint = isDark ? 'dark' : 'light';

  if (Platform.OS === 'android') {
    // Android Fallback for UI frame-rate performance
    const bg = isDark ? 'rgba(20, 22, 33, 0.85)' : 'rgba(255, 255, 255, 0.75)';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.4)';
    return (
      <View style={[styles.androidCard, { backgroundColor: bg, borderColor }, style]}>
        {children}
      </View>
    );
  }

  // iOS/visionOS Glass Blur
  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[styles.glassCard, style]}
    >
      {/* Visual tint overlay for layered contrast */}
      <View 
        style={[
          StyleSheet.absoluteFill, 
          { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.12)' }
        ]} 
        pointerEvents="none" 
      />
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.38)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
  },
  androidCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
});
