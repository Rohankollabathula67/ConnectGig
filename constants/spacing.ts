/**
 * ConnectGig Design System — Spacing, Border Radii & Shadows
 * Generous white space and soft shadows matching mockup aesthetic
 */

import { ViewStyle } from 'react-native';

// ── Spacing Scale ────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
  screenPadding: 20,  // horizontal padding for screen content
} as const;

// ── Border Radii ─────────────────────────────────────────
export const Radii = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,      // pill/circle
  card: 16,       // standard card corners
  button: 12,     // button corners
  input: 12,      // input field corners
  chip: 20,       // chip/pill corners
  avatar: 999,    // circular avatars
  mapContainer: 16, // rounded map container
} as const;

// ── Shadow Presets ───────────────────────────────────────
export const Shadows = {
  /** Subtle shadow for cards */
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,

  /** Medium shadow for elevated cards */
  cardElevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle,

  /** Strong shadow for floating elements */
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  } as ViewStyle,

  /** Tab bar top shadow */
  tabBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  } as ViewStyle,

  /** Button shadow */
  button: {
    shadowColor: '#3B6FF4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  } as ViewStyle,

  /** No shadow */
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
} as const;

// ── Layout Constants ─────────────────────────────────────
export const Layout = {
  tabBarHeight: 70,
  tabBarElevatedSize: 56,  // center elevated button diameter
  headerHeight: 56,
  statusBarHeight: 44,     // approximate, use SafeAreaView
  bottomSheetHandle: 4,    // handle bar height
} as const;
