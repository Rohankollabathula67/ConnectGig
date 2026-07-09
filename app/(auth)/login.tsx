/**
 * ConnectGig — Login / Signup Screen (§3.3)
 * App icon, segmented Client/Worker toggle, phone OTP verification, and error handling.
 */

import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Zap } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';

type Role = 'client' | 'worker';

export default function LoginScreen() {
  const [role, setRole] = useState<Role>('client');
  const [phone, setPhone] = useState('');
  const [countryCode] = useState('+1');
  
  // OTP Flow state
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  
  const { sendOTP, verifyOTP, loading, error } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 8) {
      setLocalError("Please enter a valid mobile number.");
      return;
    }
    setLocalError(null);
    try {
      const fullPhone = countryCode + phone;
      const res = await sendOTP(fullPhone);
      setVerificationId(res.verificationId);
      setOtpSent(true);
    } catch (e: any) {
      // Error handled by store
    }
  };

  const handleVerifyOTP = async () => {
    if (!code || code.length < 6) {
      setLocalError("Please enter the 6-digit code.");
      return;
    }
    setLocalError(null);
    try {
      const fullPhone = countryCode + phone;
      const userRole = role === 'worker' ? 'provider' : 'client';
      await verifyOTP(verificationId, code, fullPhone, userRole);
      
      // Navigate to correct dashboard based on role
      if (role === 'client') {
        router.replace('/(client)/home');
      } else {
        router.replace('/(worker)/dashboard');
      }
    } catch (e: any) {
      // Error handled by store
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Simulated direct login
    if (role === 'client') {
      router.replace('/(client)/home');
    } else {
      router.replace('/(worker)/dashboard');
    }
  };

  const activeError = localError || error;

  return (
    <SafeAreaView style={styles.container}>
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

        {/* Role Toggle (Disabled once OTP is sent to prevent role mismatch) */}
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

        {/* Inputs */}
        {!otpSent ? (
          <View style={styles.phoneSection}>
            <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
            <View style={styles.phoneRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>{countryCode}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="000-000-0000"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={12}
              />
            </View>
          </View>
        ) : (
          <View style={styles.phoneSection}>
            <Text style={styles.inputLabel}>ENTER 6-DIGIT CODE</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="123456"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
              maxLength={6}
              autoFocus
            />
          </View>
        )}

        {/* Action Button */}
        <Button
          title={otpSent ? "Verify & Continue  →" : "Send OTP  →"}
          onPress={otpSent ? handleVerifyOTP : handleSendOTP}
          loading={loading}
          fullWidth
          size="lg"
        />

        {otpSent && (
          <Pressable onPress={() => setOtpSent(false)} style={styles.editPhoneBtn}>
            <Text style={styles.editPhoneText}>Edit phone number</Text>
          </Pressable>
        )}

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialRow}>
          <Pressable
            onPress={() => handleSocialLogin('google')}
            style={styles.socialButton}
          >
            <Text style={styles.socialIcon}>G</Text>
            <Text style={styles.socialText}>Google</Text>
          </Pressable>
          <Pressable
            onPress={() => handleSocialLogin('apple')}
            style={styles.socialButton}
          >
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxxl,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: Radii.lg,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.button,
  },
  brandName: {
    ...Typography.title1,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  tagline: {
    ...Typography.body2,
    color: Colors.primary,
    marginBottom: Spacing.xxl,
  },
  roleToggle: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    borderRadius: Radii.button,
    overflow: 'hidden',
    marginBottom: Spacing.xxxl,
    width: '100%',
  },
  roleToggleDisabled: {
    opacity: 0.5,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  roleOptionActive: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  roleText: {
    ...Typography.body2SemiBold,
    color: Colors.textSecondary,
  },
  roleTextActive: {
    color: Colors.primary,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    width: '100%',
  },
  welcomeTitle: {
    ...Typography.title2,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: Colors.errorBg,
    borderRadius: Radii.sm,
    padding: Spacing.md,
    width: '100%',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    ...Typography.body2Medium,
    color: Colors.error,
    textAlign: 'center',
  },
  phoneSection: {
    width: '100%',
    marginBottom: Spacing.xxl,
  },
  inputLabel: {
    ...Typography.overline,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    letterSpacing: 1.5,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
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
  countryCodeText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  chevron: {
    ...Typography.body,
    color: Colors.textMuted,
  },
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
  editPhoneBtn: {
    marginTop: Spacing.md,
    paddingVertical: 8,
  },
  editPhoneText: {
    ...Typography.body2SemiBold,
    color: Colors.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    width: '100%',
    marginVertical: Spacing.xxl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  dividerText: {
    ...Typography.overline,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
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
  socialIcon: {
    fontSize: 18,
  },
  socialText: {
    ...Typography.body2SemiBold,
    color: Colors.textPrimary,
  },
  footer: {
    paddingHorizontal: Spacing.xxxl,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
