/**
 * ConnectGig — Matchmaking Radial Animation Component (§3.6, §2.2)
 * Renders pulsing concentric circles and orbiting worker avatars.
 * Built with react-native-reanimated for performance.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { Avatar } from './ui/Avatar';

interface OrbitingWorker {
  id: string;
  initials: string;
  angle: number; // in degrees
  radius: number; // orbit radius in px
  online?: boolean;
}

interface RadialAnimationProps {
  workers?: OrbitingWorker[];
  pulseRadius?: number;
}

const DEFAULT_WORKERS: OrbitingWorker[] = [
  { id: '1', initials: 'M', angle: 45, radius: 90, online: true },
  { id: '2', initials: 'S', angle: 180, radius: 110, online: true },
  { id: '3', initials: 'D', angle: 290, radius: 100, online: false },
];

function PulsingRing({
  pulseValue,
  size,
  radius,
}: {
  pulseValue: SharedValue<number>;
  size: number;
  radius: number;
}) {
  const ringStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseValue.value, [0, 1], [0.4, 1.2]);
    const opacity = interpolate(pulseValue.value, [0, 0.8, 1], [0.8, 0.4, 0]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: radius },
        ringStyle,
      ]}
    />
  );
}

function OrbitingWorkerAvatar({
  worker,
  orbitRotation,
}: {
  worker: OrbitingWorker;
  orbitRotation: SharedValue<number>;
}) {
  const rad = (worker.angle * Math.PI) / 180;
  const x = Math.cos(rad) * worker.radius;
  const y = Math.sin(rad) * worker.radius;

  const animatedWorkerStyle = useAnimatedStyle(() => {
    const rotationRad = (orbitRotation.value * Math.PI) / 180;
    const rx = x * Math.cos(rotationRad) - y * Math.sin(rotationRad);
    const ry = x * Math.sin(rotationRad) + y * Math.cos(rotationRad);
    return {
      transform: [{ translateX: rx }, { translateY: ry }],
    };
  });

  return (
    <Animated.View style={[styles.orbitingWrapper, animatedWorkerStyle]}>
      <Avatar name={worker.initials} size="sm" showOnline={worker.online} />
    </Animated.View>
  );
}

export function RadialAnimation({
  workers = DEFAULT_WORKERS,
  pulseRadius = 140,
}: RadialAnimationProps) {
  // Pulse shared values
  const pulse1 = useSharedValue(0);
  const pulse2 = useSharedValue(0);
  const pulse3 = useSharedValue(0);

  // Orbit rotation shared value
  const orbitRotation = useSharedValue(0);

  useEffect(() => {
    // Pulse animation loop
    const runPulse = (sharedValue: SharedValue<number>, delay: number) => {
      sharedValue.value = 0;
      sharedValue.value = withDelay(
        delay,
        withRepeat(
          withTiming(1, {
            duration: 2500,
            easing: Easing.out(Easing.ease),
          }),
          -1, // infinite loops
          false // do not reverse
        )
      );
    };

    runPulse(pulse1, 0);
    runPulse(pulse2, 800);
    runPulse(pulse3, 1600);

    // Continuous smooth rotation for orbiting items
    orbitRotation.value = withRepeat(
      withTiming(360, {
        duration: 20000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [orbitRotation, pulse1, pulse2, pulse3]);

  return (
    <View style={styles.container}>
      {/* Concentric Pulsing Rings */}
      <PulsingRing
        pulseValue={pulse1}
        size={pulseRadius * 2}
        radius={pulseRadius}
      />
      <PulsingRing
        pulseValue={pulse2}
        size={pulseRadius * 1.5}
        radius={pulseRadius * 0.75}
      />
      <PulsingRing
        pulseValue={pulse3}
        size={pulseRadius}
        radius={pulseRadius * 0.5}
      />

      {/* Orbiting Workers */}
      {workers.map((worker) => (
        <OrbitingWorkerAvatar
          key={worker.id}
          worker={worker}
          orbitRotation={orbitRotation}
        />
      ))}

      {/* Center Anchor Pin */}
      <View style={styles.centerPin}>
        <View style={styles.pinDot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: 300,
    height: 300,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  centerPin: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    zIndex: 20,
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  orbitingWrapper: {
    position: 'absolute',
    zIndex: 10,
  },
});
