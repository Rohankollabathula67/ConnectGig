/**
 * ConnectGig — Splash / Entry Screen
 * Animated splash matching §3.1: concentric circles, pulsing dot, wordmark.
 * After animation, checks auth state to route accordingly:
 *   - Authenticated + existing user → home/dashboard (role-based)
 *   - Authenticated + new user      → registration screen
 *   - Unauthenticated               → onboarding
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { useAuthStore } from '../store/authStore';

export default function SplashEntry() {
  const pulse1 = useRef(new Animated.Value(0.4)).current;
  const pulse2 = useRef(new Animated.Value(0.3)).current;
  const dotScale = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      // Concentric circle pulses
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse1, { toValue: 1, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse1, { toValue: 0.4, duration: 2000, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.delay(300),
          Animated.timing(pulse2, { toValue: 0.8, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse2, { toValue: 0.3, duration: 2000, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        ])
      ),
      // Center dot pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotScale, { toValue: 1.3, duration: 800, useNativeDriver: true }),
          Animated.timing(dotScale, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ),
      // Fade in text
      Animated.timing(fadeIn, { toValue: 1, duration: 1200, delay: 400, useNativeDriver: true }),
      // Loading dots
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotsOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(dotsOpacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        ])
      ),
    ]).start();

    // Navigate once both conditions are true:
    //  1. Minimum animation time has elapsed (1.5s)
    //  2. Auth store has resolved its onAuthStateChanged callback (ready === true)
    let animationDone = false;
    let storeReady = false;

    function attemptNavigate() {
      if (!animationDone || !storeReady) return;

      const { isAuthenticated, user } = useAuthStore.getState();
      if (isAuthenticated && user) {
        if (user.isNewUser) {
          router.replace('/(auth)/register');
        } else if (user.role === 'provider') {
          router.replace('/(worker)/dashboard');
        } else {
          router.replace('/(client)/home');
        }
      } else {
        router.replace('/(auth)/onboarding');
      }
    }

    // Minimum splash display time
    const timer = setTimeout(() => {
      animationDone = true;
      attemptNavigate();
    }, 1500);

    // Subscribe to store ready flag
    const unsub = useAuthStore.subscribe((state) => {
      if (state.ready && !storeReady) {
        storeReady = true;
        unsub();
        attemptNavigate();
      }
    });

    // Fallback: if ready was already true before we subscribed (mock mode)
    if (useAuthStore.getState().ready) {
      storeReady = true;
    }

    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);


  return (
    <View style={styles.container}>
      {/* Concentric circles */}
      <View style={styles.circleContainer}>
        <Animated.View
          style={[styles.circle, styles.circleOuter, { opacity: pulse1, transform: [{ scale: pulse1 }] }]}
        />
        <Animated.View
          style={[styles.circle, styles.circleMiddle, { opacity: pulse2, transform: [{ scale: pulse2 }] }]}
        />
        <Animated.View
          style={[styles.circle, styles.circleInner]}
        />

        {/* Center dot */}
        <Animated.View
          style={[styles.centerDot, { transform: [{ scale: dotScale }] }]}
        />

        {/* Orbiting small dots */}
        <View style={[styles.orbitDot, { top: 25, right: 40 }]} />
        <View style={[styles.orbitDot, { bottom: 45, left: 30 }]} />
        <View style={[styles.orbitDot, styles.orbitDotSmall, { top: 50, left: 25 }]} />
        <View style={[styles.orbitDot, styles.orbitDotSmall, { bottom: 30, right: 50 }]} />

        {/* Connection lines */}
        <View style={[styles.connectionLine, { top: 60, left: 45, width: 40, transform: [{ rotate: '30deg' }] }]} />
        <View style={[styles.connectionLine, { bottom: 50, right: 35, width: 35, transform: [{ rotate: '-45deg' }] }]} />
      </View>

      {/* Wordmark */}
      <Animated.View style={[styles.textContainer, { opacity: fadeIn }]}>
        <Text style={styles.brandName}>ConnectGiG</Text>
        <Text style={styles.tagline}>Your next opportunity is just a tap away</Text>
      </Animated.View>

      {/* Loading indicator */}
      <Animated.View style={[styles.loadingContainer, { opacity: dotsOpacity }]}>
        <Text style={styles.loadingText}>LOADING EXCELLENCE</Text>
        <View style={styles.loadingDots}>
          <View style={styles.loadingDot} />
          <View style={styles.loadingDot} />
          <View style={styles.loadingDot} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  circle: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: Colors.primaryBg20,
    borderRadius: 999,
  },
  circleOuter: {
    width: 200,
    height: 200,
    borderColor: '#D6E4FD',
  },
  circleMiddle: {
    width: 140,
    height: 140,
    borderColor: '#B3CCFA',
  },
  circleInner: {
    width: 80,
    height: 80,
    borderColor: '#90B5F7',
    borderWidth: 2,
  },
  centerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  orbitDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  orbitDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryLight,
  },
  connectionLine: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: '#B3CCFA',
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    ...Typography.heroTitle,
    color: Colors.textPrimary,
  },
  tagline: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    ...Typography.overline,
    color: Colors.primary,
    letterSpacing: 2,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 6,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
});
