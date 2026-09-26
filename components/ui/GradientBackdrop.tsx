/**
 * ConnectGig — GradientBackdrop Component
 * Renders a soft animated mesh gradient (blue → violet → soft teal) as a dark visionOS-style screen background.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function GradientBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Deep Dark Base */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0A0C16' }]} />
      
      {/* Top Left mesh: Primary Blue / Indigo glow */}
      <LinearGradient
        colors={['rgba(59, 111, 244, 0.28)', 'rgba(59, 111, 244, 0)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 0.7 }}
      />
      
      {/* Top Right mesh: Deep Purple / Violet glow */}
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.24)', 'rgba(139, 92, 246, 0)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.3, y: 0.7 }}
      />
      
      {/* Bottom Center mesh: Soft Teal glow */}
      <LinearGradient
        colors={['rgba(20, 184, 166, 0.18)', 'rgba(20, 184, 166, 0)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 1 }}
        end={{ x: 0.7, y: 0.3 }}
      />
    </View>
  );
}
