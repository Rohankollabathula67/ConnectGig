/**
 * ConnectGig Design System — Typography
 * Clean, modern type scale matching mockups: bold headlines, medium labels, regular body
 */

import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const Typography = {
  // ── Headlines ────────────────────────────────────────
  /** 32pt Bold — Splash screen title, large greetings */
  heroTitle: {
    fontFamily,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.3,
  } as TextStyle,

  /** 28pt Bold — Onboarding headlines */
  headline: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: -0.2,
  } as TextStyle,

  /** 24pt Bold — Section major titles, earnings amount */
  title1: {
    fontFamily,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.1,
  } as TextStyle,

  /** 20pt SemiBold — Screen headers, section titles */
  title2: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  } as TextStyle,

  /** 18pt SemiBold — Card titles, worker names */
  title3: {
    fontFamily,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,

  // ── Body ─────────────────────────────────────────────
  /** 16pt Regular — Primary body text */
  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } as TextStyle,

  /** 16pt Medium — Emphasized body text */
  bodyMedium: {
    fontFamily,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  } as TextStyle,

  /** 15pt Regular — Secondary body text */
  bodySmall: {
    fontFamily,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  } as TextStyle,

  /** 14pt Regular — Supporting text, descriptions */
  body2: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,

  /** 14pt Medium — Button text, chip labels */
  body2Medium: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  } as TextStyle,

  /** 14pt SemiBold — Emphasized labels */
  body2SemiBold: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,

  // ── Captions & Labels ────────────────────────────────
  /** 13pt Medium — Form labels, secondary info */
  label: {
    fontFamily,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  } as TextStyle,

  /** 12pt Medium — Small labels, timestamps */
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  } as TextStyle,

  /** 11pt SemiBold — Badge text, uppercase labels */
  overline: {
    fontFamily,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  } as TextStyle,

  /** 10pt SemiBold — Tiny labels */
  micro: {
    fontFamily,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.5,
  } as TextStyle,

  // ── Button Specific ──────────────────────────────────
  /** 16pt SemiBold — Primary buttons */
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,

  /** 14pt SemiBold — Small buttons */
  buttonSmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,

  // ── Numeric / Stats ──────────────────────────────────
  /** 36pt Bold — Large stat numbers (earnings total) */
  statHero: {
    fontFamily,
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 44,
    letterSpacing: -0.5,
  } as TextStyle,

  /** 24pt Bold — Medium stat numbers */
  statLarge: {
    fontFamily,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  } as TextStyle,

  /** 20pt Bold — Stat values in cards */
  statMedium: {
    fontFamily,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  } as TextStyle,
} as const;
