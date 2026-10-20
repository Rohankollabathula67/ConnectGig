/**
 * ConnectGig — Verification Status Screen (Sprint 3 — §3.11, §3.2)
 * Manages provider compliance, document uploads (Aadhaar, PAN, Skill Certs),
 * and live verification badge synchronization.
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { safeGoBack } from '../utils/navigation';
import {
  ChevronLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Camera,
  UploadCloud,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/colors';
import { Spacing, Radii, Shadows } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { db, IS_FIREBASE_ENABLED } from '../services/firebase';
import { storageService } from '../services/storage';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { VerificationStatus } from '../types/provider';

interface DocSlot {
  key: 'aadhaar' | 'pan' | 'skill_cert';
  title: string;
  desc: string;
  required: boolean;
  url?: string;
  uploading?: boolean;
}

export default function VerificationStatusScreen() {
  const { user } = useAuthStore();
  const workerId = user?.uid || 'mock-worker-uid';

  const [status, setStatus] = useState<VerificationStatus>('verified');
  const [aadhaarUrl, setAadhaarUrl] = useState<string | undefined>('https://images.unsplash.com/photo-1544717305-2782549b5136?w=400');
  const [panUrl, setPanUrl] = useState<string | undefined>('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400');
  const [certUrl, setCertUrl] = useState<string | undefined>();
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Real-time listener for provider document in Firestore
  useEffect(() => {
    if (!IS_FIREBASE_ENABLED) return;

    const unsub = onSnapshot(doc(db, 'providers', workerId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.verificationStatus) {
          setStatus(data.verificationStatus);
        }
        if (data.verificationDocs) {
          if (data.verificationDocs.aadhaarUrl) setAadhaarUrl(data.verificationDocs.aadhaarUrl);
          if (data.verificationDocs.panUrl) setPanUrl(data.verificationDocs.panUrl);
          if (data.verificationDocs.certUrl) setCertUrl(data.verificationDocs.certUrl);
        }
      }
    });

    return () => unsub();
  }, [workerId]);

  const handlePickDocument = (docKey: 'aadhaar' | 'pan' | 'skill_cert') => {
    Alert.alert(
      'Upload Document',
      'Choose image source for verification document:',
      [
        { text: 'Take Photo', onPress: () => captureDocument(docKey, true) },
        { text: 'Choose from Gallery', onPress: () => captureDocument(docKey, false) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const captureDocument = async (
    docKey: 'aadhaar' | 'pan' | 'skill_cert',
    useCamera: boolean
  ) => {
    try {
      let result;
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission Required', 'Camera access is needed to capture documents.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission Required', 'Photo library access is needed to select documents.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        await uploadDocument(docKey, localUri);
      }
    } catch (err: any) {
      console.warn('Doc capture error:', err);
      Alert.alert('Error', 'Failed to pick document.');
    }
  };

  const uploadDocument = async (
    docKey: 'aadhaar' | 'pan' | 'skill_cert',
    localUri: string
  ) => {
    setUploadingDoc(docKey);
    try {
      const finalUrl = await storageService.uploadProviderDocument(workerId, docKey, localUri);

      if (docKey === 'aadhaar') setAadhaarUrl(finalUrl);
      if (docKey === 'pan') setPanUrl(finalUrl);
      if (docKey === 'skill_cert') setCertUrl(finalUrl);

      if (IS_FIREBASE_ENABLED) {
        const providerRef = doc(db, 'providers', workerId);
        await updateDoc(providerRef, {
          [`verificationDocs.${docKey}Url`]: finalUrl,
          verificationStatus: 'pending',
          updatedAt: serverTimestamp(),
        });
        setStatus('pending');
      }

      Alert.alert('Uploaded', 'Document saved. Ready for submission.');
    } catch (error: any) {
      console.warn('Document upload error:', error);
      Alert.alert('Upload Failed', error?.message || 'Could not upload document.');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleSubmitForReview = async () => {
    if (!aadhaarUrl) {
      Alert.alert('Document Missing', 'Please upload your Aadhaar or Government ID before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      if (IS_FIREBASE_ENABLED) {
        const providerRef = doc(db, 'providers', workerId);
        await updateDoc(providerRef, {
          verificationStatus: 'pending',
          'verificationDocs.submittedAt': serverTimestamp(),
        });
      }

      setStatus('pending');
      Alert.alert(
        'Submitted for Review 🛡️',
        'Your documents have been submitted to the compliance team. Verification is typically completed within 24–48 hours.'
      );
    } catch (err: any) {
      Alert.alert('Submission Error', err?.message || 'Failed to submit review request.');
    } finally {
      setSubmitting(false);
    }
  };

  const isVerified = status === 'verified';
  const isPending = status === 'pending';
  const isRejected = status === 'rejected';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => safeGoBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Verification Status</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Indicator Card */}
        <Card variant="elevated" style={styles.statusCard} padding="xl">
          <View style={styles.iconContainer}>
            {isVerified ? (
              <ShieldCheck size={52} color={Colors.success} strokeWidth={2} />
            ) : isPending ? (
              <Clock size={52} color={Colors.warning} strokeWidth={2} />
            ) : (
              <AlertCircle size={52} color={Colors.error} strokeWidth={2} />
            )}
          </View>
          <Text style={styles.statusTitle}>
            {isVerified
              ? 'Profile Verified Pro'
              : isPending
              ? 'Verification Under Review'
              : 'Action Required'}
          </Text>
          <Text style={styles.statusDesc}>
            {isVerified
              ? 'Your government credentials and trade expertise have been verified by ConnectGiG Trust & Safety. You have top booking priority!'
              : isPending
              ? 'Our compliance team is currently reviewing your uploaded ID files. Verification takes 24–48 hours.'
              : 'One or more of your documents was unclear or expired. Please re-upload clear photos to activate your profile.'}
          </Text>
          <View style={styles.badgeRow}>
            <Badge
              type="verified"
              label={
                isVerified
                  ? 'VERIFIED PRO'
                  : isPending
                  ? 'UNDER COMPLIANCE REVIEW'
                  : 'VERIFICATION REJECTED'
              }
            />
          </View>
        </Card>

        {/* Verification Checkpoints */}
        <Text style={styles.sectionTitle}>Verification Checkpoints</Text>
        <Card variant="default" style={styles.checkpointsCard} padding="lg">
          <View style={styles.checkpointRow}>
            <CheckCircle2 size={20} color={Colors.success} strokeWidth={2} />
            <View style={styles.checkpointMeta}>
              <Text style={styles.checkpointLabel}>OTP Phone Verification</Text>
              <Text style={styles.checkpointDesc}>Completed during registration ({user?.phoneNumber || '+91 9876543210'})</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.checkpointRow}>
            {aadhaarUrl ? (
              <CheckCircle2 size={20} color={Colors.success} strokeWidth={2} />
            ) : (
              <AlertCircle size={20} color={Colors.warning} strokeWidth={2} />
            )}
            <View style={styles.checkpointMeta}>
              <Text style={styles.checkpointLabel}>Aadhaar Card / Government ID</Text>
              <Text style={styles.checkpointDesc}>
                {aadhaarUrl ? 'Document uploaded & on file' : 'Pending upload'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.checkpointRow}>
            {panUrl ? (
              <CheckCircle2 size={20} color={Colors.success} strokeWidth={2} />
            ) : (
              <AlertCircle size={20} color={Colors.warning} strokeWidth={2} />
            )}
            <View style={styles.checkpointMeta}>
              <Text style={styles.checkpointLabel}>PAN Card / Tax Identification</Text>
              <Text style={styles.checkpointDesc}>
                {panUrl ? 'Document uploaded & on file' : 'Optional for higher limits'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.checkpointRow}>
            {certUrl ? (
              <CheckCircle2 size={20} color={Colors.success} strokeWidth={2} />
            ) : (
              <Clock size={20} color={Colors.textMuted} strokeWidth={2} />
            )}
            <View style={styles.checkpointMeta}>
              <Text style={styles.checkpointLabel}>Trade Certification / License</Text>
              <Text style={styles.checkpointDesc}>
                {certUrl ? 'Trade certificate attached' : 'Optional for Top Pro Badge'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Upload Documents Section */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Compliance Documents
        </Text>

        {/* Aadhaar Slot */}
        <Card variant="default" style={styles.uploadCard}>
          <View style={styles.uploadRow}>
            <View style={styles.docIconWrap}>
              <FileText size={22} color={Colors.primary} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>Aadhaar / National ID *</Text>
              <Text style={styles.docDesc}>Front side showing clear photo and address</Text>
            </View>
            {uploadingDoc === 'aadhaar' ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Pressable
                style={styles.uploadBtn}
                onPress={() => handlePickDocument('aadhaar')}
              >
                <Camera size={14} color={Colors.primary} />
                <Text style={styles.uploadBtnText}>
                  {aadhaarUrl ? 'Replace' : 'Upload'}
                </Text>
              </Pressable>
            )}
          </View>
          {aadhaarUrl ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: aadhaarUrl }} style={styles.previewImage} />
              <View style={styles.previewBadge}>
                <CheckCircle2 size={12} color={Colors.success} />
                <Text style={styles.previewBadgeText}>Uploaded</Text>
              </View>
            </View>
          ) : null}
        </Card>

        {/* PAN Slot */}
        <Card variant="default" style={styles.uploadCard}>
          <View style={styles.uploadRow}>
            <View style={styles.docIconWrap}>
              <FileText size={22} color={Colors.primary} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>PAN Card</Text>
              <Text style={styles.docDesc}>Required for bank payouts over ₹10,000</Text>
            </View>
            {uploadingDoc === 'pan' ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Pressable
                style={styles.uploadBtn}
                onPress={() => handlePickDocument('pan')}
              >
                <Camera size={14} color={Colors.primary} />
                <Text style={styles.uploadBtnText}>
                  {panUrl ? 'Replace' : 'Upload'}
                </Text>
              </Pressable>
            )}
          </View>
          {panUrl ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: panUrl }} style={styles.previewImage} />
              <View style={styles.previewBadge}>
                <CheckCircle2 size={12} color={Colors.success} />
                <Text style={styles.previewBadgeText}>Uploaded</Text>
              </View>
            </View>
          ) : null}
        </Card>

        {/* Trade Certificate Slot */}
        <Card variant="default" style={styles.uploadCard}>
          <View style={styles.uploadRow}>
            <View style={styles.docIconWrap}>
              <Sparkles size={22} color={Colors.topPro} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>Skill Certificate / Diploma</Text>
              <Text style={styles.docDesc}>Unlocks gold "Top Pro" certified badge</Text>
            </View>
            {uploadingDoc === 'skill_cert' ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Pressable
                style={styles.uploadBtn}
                onPress={() => handlePickDocument('skill_cert')}
              >
                <UploadCloud size={14} color={Colors.primary} />
                <Text style={styles.uploadBtnText}>
                  {certUrl ? 'Replace' : 'Upload'}
                </Text>
              </Pressable>
            )}
          </View>
          {certUrl ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: certUrl }} style={styles.previewImage} />
              <View style={styles.previewBadge}>
                <CheckCircle2 size={12} color={Colors.success} />
                <Text style={styles.previewBadgeText}>Uploaded</Text>
              </View>
            </View>
          ) : null}
        </Card>

        {/* Submit Review CTA */}
        {!isVerified && (
          <Button
            title={submitting ? 'Submitting Documents…' : 'Submit for Compliance Review'}
            onPress={handleSubmitForReview}
            loading={submitting}
            fullWidth
            style={styles.submitBtn}
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.title3,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
  },

  statusCard: {
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.sm,
  },
  statusTitle: {
    ...Typography.title2,
    color: Colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  statusDesc: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  badgeRow: {
    alignItems: 'center',
  },

  sectionTitle: {
    ...Typography.body2SemiBold,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },

  checkpointsCard: {
    gap: Spacing.md,
  },
  checkpointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  checkpointMeta: {
    flex: 1,
    gap: 2,
  },
  checkpointLabel: {
    ...Typography.body2SemiBold,
    color: Colors.textPrimary,
  },
  checkpointDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },

  // Document Upload Cards
  uploadCard: {
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  docIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docInfo: {
    flex: 1,
    gap: 2,
  },
  docTitle: {
    ...Typography.body2SemiBold,
    color: Colors.textPrimary,
  },
  docDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  uploadBtnText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
  },

  previewContainer: {
    position: 'relative',
    height: 110,
    borderRadius: Radii.md,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.full,
    ...Shadows.card,
  },
  previewBadgeText: {
    ...Typography.micro,
    color: Colors.success,
    fontWeight: '700',
  },

  submitBtn: {
    marginTop: Spacing.lg,
  },
});
