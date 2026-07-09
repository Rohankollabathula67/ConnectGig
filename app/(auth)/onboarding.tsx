/**
 * ConnectGig — Onboarding Carousel (§3.2)
 * 3-slide swipeable carousel with full-bleed illustrations, bold headlines,
 * pagination dots, Skip + Next/Get Started buttons
 */

import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Button } from '../../components/ui/Button';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    headline: 'Book trusted workers',
    accentWord: 'instantly',
    subtitle: 'ConnectGiG uses AI to find the perfect local professional for your home or business needs in seconds.',
    chipText: '2.5 miles away',
    illustration: '🏠',
  },
  {
    id: '2',
    headline: 'Track progress in',
    accentWord: 'real-time',
    subtitle: 'See your worker\'s location, communicate directly, and get live updates throughout the service.',
    chipText: 'ETA 8 mins',
    illustration: '📍',
  },
  {
    id: '3',
    headline: 'Pay securely &',
    accentWord: 'easily',
    subtitle: 'Cashless payments, fair pricing, and complete transparency. Pay only when you\'re satisfied.',
    chipText: 'Safe & Secure',
    illustration: '💳',
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <Pressable onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Illustration area */}
            <View style={styles.illustrationContainer}>
              <View style={styles.illustrationPlaceholder}>
                <Text style={styles.illustrationEmoji}>{item.illustration}</Text>
                {/* Floating chip */}
                <View style={styles.floatingChip}>
                  <View style={styles.chipDot} />
                  <Text style={styles.chipText}>{item.chipText}</Text>
                </View>
              </View>
            </View>

            {/* Text content */}
            <View style={styles.textContent}>
              <Text style={styles.headline}>
                {item.headline}{'\n'}
                <Text style={styles.accentWord}>{item.accentWord}</Text>
              </Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      {/* Bottom section: dots + button */}
      <View style={styles.bottomSection}>
        {/* Pagination dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Next/Get Started button */}
        <Button
          title={activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    right: Spacing.xl,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    ...Typography.body2SemiBold,
    color: Colors.primary,
  },
  slide: {
    width,
    flex: 1,
  },
  illustrationContainer: {
    height: height * 0.45,
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: Radii.xxl,
    borderBottomRightRadius: Radii.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  illustrationPlaceholder: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: Colors.inputBg,
    borderRadius: Radii.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationEmoji: {
    fontSize: 80,
  },
  floatingChip: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radii.full,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  chipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  textContent: {
    paddingHorizontal: Spacing.xxxl,
    paddingTop: Spacing.xxxl,
    gap: Spacing.lg,
  },
  headline: {
    ...Typography.headline,
    color: Colors.textPrimary,
  },
  accentWord: {
    color: Colors.primary,
  },
  subtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bottomSection: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxxxl,
    gap: Spacing.xxl,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.inputBorder,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
});
