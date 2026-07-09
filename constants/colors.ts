/**
 * ConnectGig Design System — Color Tokens
 * Derived from Stitch mockups: clean white cards, blue primary, soft grays
 */

export const Colors = {
  // ── Primary ──────────────────────────────────────────
  primary: '#3B6FF4',
  primaryLight: '#6B93F7',
  primaryDark: '#2B57CC',
  primaryBg: '#EBF0FE',     // very light blue for selected states
  primaryBg10: 'rgba(59, 111, 244, 0.10)',
  primaryBg20: 'rgba(59, 111, 244, 0.20)',

  // ── Background & Surface ─────────────────────────────
  background: '#FFFFFF',
  surface: '#F8F9FB',       // light gray surface (behind cards)
  card: '#FFFFFF',
  cardBorder: '#F0F1F3',
  inputBg: '#F5F6F8',
  inputBorder: '#E8E9EC',

  // ── Text ─────────────────────────────────────────────
  textPrimary: '#1A1D26',   // near-black for headlines
  textSecondary: '#6B7280', // medium gray for subtitles
  textMuted: '#9CA3AF',     // light gray for timestamps/hints
  textDisabled: '#D1D5DB',
  textWhite: '#FFFFFF',

  // ── Status ───────────────────────────────────────────
  success: '#10B981',       // green - online, paid, verified
  successBg: '#ECFDF5',
  successLight: '#34D399',
  warning: '#F59E0B',       // amber - for warnings
  warningBg: '#FFFBEB',
  error: '#EF4444',         // red - errors, urgent
  errorBg: '#FEF2F2',
  errorLight: '#F87171',

  // ── Badge Colors ─────────────────────────────────────
  verified: '#3B6FF4',      // blue "VERIFIED" badge
  verifiedBg: '#EBF0FE',
  topPro: '#F59E0B',        // gold "TOP PRO" badge
  topProBg: '#FEF9E7',
  online: '#10B981',        // green dot
  paid: '#10B981',          // green "PAID" text
  paidBg: '#ECFDF5',
  urgent: '#EF4444',
  urgentBg: '#FEF2F2',
  aiMatch: '#8B5CF6',       // purple for AI features
  aiMatchBg: '#F3F0FF',

  // ── Category Service Colors ──────────────────────────
  plumber: '#3B82F6',
  electrician: '#F59E0B',
  cleaner: '#10B981',
  painter: '#EC4899',
  gardener: '#22C55E',
  itSupport: '#6366F1',
  handyman: '#F97316',
  tutor: '#8B5CF6',

  // ── Earnings Card Gradient ───────────────────────────
  earningsGradientStart: '#3B6FF4',
  earningsGradientEnd: '#2B57CC',

  // ── Notification Type Colors ─────────────────────────
  notifWorkerEnRoute: '#3B6FF4',
  notifPayment: '#10B981',
  notifAiFeature: '#8B5CF6',
  notifBooking: '#3B6FF4',

  // ── Map ──────────────────────────────────────────────
  mapRoute: '#3B6FF4',
  mapPin: '#3B6FF4',

  // ── Misc ─────────────────────────────────────────────
  divider: '#F0F1F3',
  shadow: 'rgba(0, 0, 0, 0.06)',
  shadowMedium: 'rgba(0, 0, 0, 0.10)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  star: '#F59E0B',          // rating star color

  // ── Tab Bar ──────────────────────────────────────────
  tabInactive: '#9CA3AF',
  tabActive: '#3B6FF4',
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#F0F1F3',
  tabElevatedBg: '#3B6FF4',

  // ── Date Chip (active = red from mockup) ─────────────
  dateChipActive: '#EF4444',
  dateChipActiveBg: '#FEF2F2',
} as const;

export type ColorKey = keyof typeof Colors;
