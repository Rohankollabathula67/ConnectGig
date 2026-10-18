/**
 * ConnectGig — Swipe-to-Accept Gesture Control (§3.11)
 * Drag-to-slide component using react-native-gesture-handler & react-native-reanimated.
 * Features: smooth spring back, haptic feedback on completion, fallback tap-to-accept.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface SwipeSliderProps {
  onAccept: () => void;
  text?: string;
  width?: number;
}

const BUTTON_SIZE = 50;
const PADDING = 4;

export function SwipeSlider({
  onAccept,
  text = 'SWIPE TO ACCEPT',
  width = Dimensions.get('window').width - Spacing.screenPadding * 2,
}: SwipeSliderProps) {
  const [completed, setCompleted] = useState(false);
  const translationX = useSharedValue(0);
  const maxTravel = width - BUTTON_SIZE - PADDING * 2;

  const handleComplete = () => {
    setCompleted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAccept();
  };

  const gesture = Gesture.Pan()
    .enabled(!completed)
    .onUpdate((event) => {
      // Clamp translation to slider boundaries
      translationX.value = Math.max(0, Math.min(event.translationX, maxTravel));
    })
    .onEnd(() => {
      if (translationX.value >= maxTravel * 0.85) {
        // Successful swipe
        translationX.value = withSpring(maxTravel, { damping: 15 });
        runOnJS(handleComplete)();
      } else {
        // Return to start
        translationX.value = withSpring(0, { damping: 12 });
      }
    });

  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translationX.value }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translationX.value,
      [0, maxTravel / 2],
      [1, 0.1],
      Extrapolate.CLAMP
    );
    return {
      opacity,
    };
  });

  return (
    <View style={[styles.container, { width }]}>
      {/* Background Track */}
      <View style={styles.track}>
        <Animated.Text style={[styles.text, animatedTextStyle]}>
          {completed ? 'ACCEPTED' : text}
        </Animated.Text>
      </View>

      {/* Swipe Thumb */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.thumb, animatedThumbStyle]}>
          <ChevronRight size={24} color={Colors.textWhite} strokeWidth={3} />
        </Animated.View>
      </GestureDetector>

      {/* Accessible Fallback */}
      {!completed && (
        <Pressable
          style={styles.fallback}
          onPress={handleComplete}
          accessibilityLabel="Double tap to accept job"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    justifyContent: 'center',
    padding: PADDING,
    position: 'relative',
    overflow: 'hidden',
  },
  track: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...Typography.overline,
    color: Colors.textMuted,
    letterSpacing: 2,
    fontWeight: '700',
  },
  thumb: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.button,
    zIndex: 10,
  },
  fallback: {
    ...StyleSheet.absoluteFill,
    opacity: 0,
  },
});
