/**
 * ConnectGig — Login / Signup Screen (§3.3)
 * Real Phone OTP authentication via @react-native-firebase/auth.
 * Role toggle (Client / Worker) sets intent for routing post-verification.
 */

import { router } from 'expo-router';
import { Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { Radii, Shadows, Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';
import { IS_FIREBASE_ENABLED } from '../../services/firebase';
import type { UserRole } from '../../types/user';

type Role = 'client' | 'worker';

// Country codes for phone input
const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', label: 'IN' },
  { code: '+1', flag: '🇺🇸', label: 'US' },
  { code: '+44', flag: '🇬🇧', label: 'UK' },
];

export default function LoginScreen() {
  const [role, setRole] = useState<Role>('client');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const { sendOTP, verifyOTP, loading, error } = useAuthStore();

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 7) {
      setLocalError('Please enter a valid mobile number.');
      return;
    }
    setLocalError(null);
    try {
      const fullPhone = countryCode + cleaned;
      await sendOTP(fullPhone);
      setOtpSent(true);
      if (!IS_FIREBASE_ENABLED) {
        Alert.alert(
          'Verification Code',
          `Demo verification code: 123456`,
          [{ text: 'OK' }]
        );
      }
    } catch (_) {
      // error shown from store
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    if (!code || code.length < 6) {
      setLocalError('Please enter the 6-digit code.');
      return;
    }
    setLocalError(null);
    try {
      const fullPhone = countryCode + phone.replace(/\D/g, '');
      const roleIntent: UserRole = role === 'worker' ? 'provider' : 'client';
      await verifyOTP(code, fullPhone, roleIntent);

      const session = useAuthStore.getState().user;
      if (session?.isNewUser) {
        // New user → registration (unified screen, role carried via store intent)
        router.replace({
          pathname: '/(auth)/register',
          params: { role: roleIntent },
        } as any);
      } else {
        // Returning user → home based on stored role
        if (session?.role === 'provider') {
          router.replace('/(worker)/dashboard');
        } else {
          router.replace('/(client)/home');
        }
      }
    } catch (_) {
      // error shown from store
    }
  };

  // ── Social stubs ──────────────────────────────────────────────────────────
  const handleGoogleLogin = () => {
    Alert.alert('Coming Soon', 'Google Sign-In is not available yet. Stay tuned!');
  };
  const handleAppleLogin = () => {
    Alert.alert('Coming Soon', 'Apple Sign-In is not available yet. Stay tuned!');
  };

  const activeError = localError || error;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* App Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.appIcon}>
              <Zap size={28} color={Colors.textWhite} fill={Colors.textWhite} />
            </View>
          </View>

          {/* Brand */}
          <Text style={styles.brandName}>ConnectGiG</Text>
          <Text style={styles.tagline}>Hyperlocal AI Gig Marketplace</Text>

          {/* Role Toggle — disabled once OTP sent to prevent mismatch */}
          <View style={[styles.roleToggle, otpSent && styles.roleToggleDisabled]}>
            <Pressable
              disabled={otpSent}
              onPress={() => setRole('client')}
              style={[styles.roleOption, role === 'client' && styles.roleOptionActive]}
            >
              <Text style={[styles.roleText, role === 'client' && styles.roleTextActive]}>
                I'm a Client
              </Text>
            </Pressable>
            <Pressable
              disabled={otpSent}
              onPress={() => setRole('worker')}
              style={[styles.roleOption, role === 'worker' && styles.roleOptionActive]}
            >
              <Text style={[styles.roleText, role === 'worker' && styles.roleTextActive]}>
                I'm a Worker
              </Text>
            </Pressable>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>
              {otpSent ? 'Verify OTP' : 'Welcome Back'}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              {otpSent
                ? `Enter the 6-digit code sent to ${countryCode} ${phone}`
                : 'Enter your mobile number to continue'}
            </Text>
          </View>

          {/* Error Banner */}
          {activeError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{activeError}</Text>
            </View>
          )}

          {/* Phone Input Step */}
          {!otpSent ? (
            <View style={styles.phoneSection}>
              <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
              <View style={styles.phoneRow}>
                {/* Country code selector — tap to cycle */}
                <Pressable
                  style={styles.countryCode}
                  onPress={() => {
                    const idx = COUNTRY_CODES.findIndex(c => c.code === countryCode);
                    const next = COUNTRY_CODES[(idx + 1) % COUNTRY_CODES.length];
                    setCountryCode(next.code);
                  }}
                >
                  <Text style={styles.countryCodeText}>{countryCode}</Text>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Enter your phone number"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={13}
                />
              </View>
            </View>
          ) : (
            <View style={styles.phoneSection}>
              <Text style={styles.inputLabel}>ENTER 6-DIGIT CODE</Text>
              <TextInput
                style={[styles.phoneInput, styles.otpInput]}
                placeholder="• • • • • •"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
                maxLength={6}
                autoFocus
              />
              <View style={styles.demoHelperRow}>
                <Text style={styles.demoHelperText}>
                  Test code: <Text style={{ fontWeight: '700' }}>123456</Text>
                </Text>
                <Pressable onPress={() => setCode('123456')} style={styles.demoFillBtn}>
                  <Text style={styles.demoFillBtnText}>Auto-fill</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Action Button */}
          <Button
            title={otpSent ? 'Verify & Continue  →' : 'Send OTP  →'}
            onPress={otpSent ? handleVerifyOTP : handleSendOTP}
            loading={loading}
            fullWidth
            size="lg"
          />

          {otpSent && (
            <Pressable onPress={() => { setOtpSent(false); setCode(''); }} style={styles.editPhoneBtn}>
              <Text style={styles.editPhoneText}>← Edit phone number</Text>
            </Pressable>
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons (stubs) */}
          <View style={styles.socialRow}>
            <Pressable onPress={handleGoogleLogin} style={styles.socialButton}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialText}>Google</Text>
            </Pressable>
            <Pressable onPress={handleAppleLogin} style={styles.socialButton}>
              <Text style={styles.socialIcon}>🍎</Text>
              <Text style={styles.socialText}>Apple</Text>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to ConnectGiG's{' '}
            <Text style={styles.footerLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'space-between' },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxxl,
    alignItems: 'center',
  },
  iconContainer: { marginBottom: Spacing.lg },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: Radii.lg,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.button,
  },
  brandName: { ...Typography.title1, color: Colors.textPrimary, marginBottom: 4 },
  tagline: { ...Typography.body2, color: Colors.primary, marginBottom: Spacing.xxl },

  // Role toggle
  roleToggle: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    borderRadius: Radii.button,
    overflow: 'hidden',
    marginBottom: Spacing.xxxl,
    width: '100%',
  },
  roleToggleDisabled: { opacity: 0.5 },
  roleOption: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  roleOptionActive: { backgroundColor: Colors.primaryBg },
  roleText: { ...Typography.body2SemiBold, color: Colors.textSecondary },
  roleTextActive: { color: Colors.primary },

  // Welcome
  welcomeSection: { alignItems: 'center', marginBottom: Spacing.xxl, width: '100%' },
  welcomeTitle: { ...Typography.title2, color: Colors.textPrimary, marginBottom: 4 },
  welcomeSubtitle: { ...Typography.body2, color: Colors.textSecondary, textAlign: 'center' },

  // Error
  errorBanner: {
    backgroundColor: Colors.errorBg,
    borderRadius: Radii.sm,
    padding: Spacing.md,
    width: '100%',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: { ...Typography.body2Medium, color: Colors.error, textAlign: 'center' },

  // Phone input
  phoneSection: { width: '100%', marginBottom: Spacing.xxl },
  inputLabel: {
    ...Typography.overline,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    letterSpacing: 1.5,
  },
  phoneRow: { flexDirection: 'row', gap: Spacing.md },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Radii.input,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.inputBg,
  },
  countryCodeText: { ...Typography.body, color: Colors.textPrimary },
  chevron: { ...Typography.body, color: Colors.textMuted },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Radii.input,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.inputBg,
  },
  otpInput: {
    textAlign: 'center',
    letterSpacing: 12,
    fontSize: 22,
    fontWeight: '700',
  },
  demoHelperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingHorizontal: 4,
  },
  demoHelperText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  demoFillBtn: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  demoFillBtnText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  editPhoneBtn: { marginTop: Spacing.md, paddingVertical: 8 },
  editPhoneText: { ...Typography.body2SemiBold, color: Colors.primary },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    width: '100%',
    marginVertical: Spacing.xxl,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.divider },
  dividerText: { ...Typography.overline, color: Colors.textMuted, letterSpacing: 1 },

  // Social
  socialRow: { flexDirection: 'row', gap: Spacing.md, width: '100%' },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Radii.button,
    backgroundColor: Colors.background,
  },
  socialIcon: { fontSize: 18 },
  socialText: { ...Typography.body2SemiBold, color: Colors.textPrimary },

  // Footer
  footer: { paddingHorizontal: Spacing.xxxl, paddingBottom: Spacing.xxl, alignItems: 'center' },
  footerText: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
  footerLink: { color: Colors.primary, fontWeight: '600' },
});
