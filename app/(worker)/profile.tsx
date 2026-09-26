/**
 * ConnectGig — Worker Profile Screen
 * Features dynamic provider user info, camera image pickers,
 * and navigation rows leading to specialties, reviews, help and verification pages.
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronRight, Settings, HelpCircle, Shield, LogOut, Star, Briefcase, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';
import { db, storage, IS_FIREBASE_ENABLED } from '../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';

const MENU_ITEMS = [
  { icon: Briefcase, label: 'Service Categories', route: '/provider-categories' },
  { icon: Settings, label: 'Account Settings', route: '/settings' },
  { icon: Star, label: 'My Reviews', route: '/my-reviews' },
  { icon: Shield, label: 'Verification Status', route: '/verification-status' },
  { icon: HelpCircle, label: 'Help & Support', route: '/help-support' },
];

export default function WorkerProfileScreen() {
  const { user, updateProfile } = useAuthStore();
  const [uploadingImage, setUploadingImage] = useState(false);

  const name = user?.displayName || 'Alex Rivers';
  const phone = user?.phoneNumber || '+91 98765 43210';
  const photoUrl = user?.profilePhotoUrl;

  const handlePickImage = () => {
    Alert.alert(
      "Profile Photo",
      "Choose an option to update your profile photo",
      [
        { text: "Take Photo", onPress: () => triggerImagePicker(true) },
        { text: "Choose from Gallery", onPress: () => triggerImagePicker(false) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const triggerImagePicker = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Permission Denied", "Camera permission is required to take photos.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Permission Denied", "Photo gallery access is required.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        await uploadImageFile(localUri);
      }
    } catch (err) {
      console.warn("Image picker error:", err);
      Alert.alert("Error", "Could not pick image.");
    }
  };

  const uploadImageFile = async (localUri: string) => {
    const userId = user?.uid || 'mock-worker-uid';
    setUploadingImage(true);
    try {
      let finalUrl = localUri;
      if (IS_FIREBASE_ENABLED) {
        const response = await fetch(localUri);
        const blob = await response.blob();
        const storageRef = ref(storage, `profile-photos/${userId}.jpg`);
        await uploadBytes(storageRef, blob);
        finalUrl = await getDownloadURL(storageRef);
        
        // Update database
        const userDocRef = doc(db, 'providers', userId);
        await updateDoc(userDocRef, { profilePhotoUrl: finalUrl });
      }
      
      // Update store state
      updateProfile({ profilePhotoUrl: finalUrl });
      Alert.alert("Success", "Profile photo updated!");
    } catch (error) {
      console.warn("Upload failed, keeping locally", error);
      updateProfile({ profilePhotoUrl: localUri });
      Alert.alert("Loaded", "Photo loaded locally.");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>

        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Avatar name={name} uri={photoUrl} size="xl" />
            <Pressable onPress={handlePickImage} style={styles.cameraIconOverlay}>
              {uploadingImage ? (
                <ActivityIndicator size="small" color={Colors.textWhite} />
              ) : (
                <Camera size={16} color={Colors.textWhite} strokeWidth={2} />
              )}
            </Pressable>
          </View>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.badgeRow}>
            <Badge type="verified" />
            <Badge type="topPro" />
          </View>
          <Text style={styles.phone}>{phone}</Text>
          <Pressable onPress={() => router.push('/edit-profile')} style={styles.editButton}>
            <Text style={styles.editText}>Edit Profile</Text>
          </Pressable>
        </Card>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => item.route && router.push(item.route as any)}
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuPressed]}
            >
              <item.icon size={20} color={Colors.textSecondary} strokeWidth={2} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight size={18} color={Colors.textMuted} strokeWidth={2} />
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          onPress={() => router.replace('/(auth)/login')}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.menuPressed]}
        >
          <LogOut size={20} color={Colors.error} strokeWidth={2} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.lg },
  title: { ...Typography.title1, color: Colors.textPrimary, marginBottom: Spacing.xxl },
  
  profileCard: { alignItems: 'center', paddingVertical: Spacing.xxxl, marginBottom: Spacing.xxl },
  avatarContainer: { position: 'relative', marginBottom: Spacing.xs },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },

  name: { ...Typography.title2, color: Colors.textPrimary, marginTop: Spacing.md },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  phone: { ...Typography.body2, color: Colors.textSecondary, marginTop: 4 },
  editButton: { marginTop: Spacing.lg, paddingVertical: 8, paddingHorizontal: 24, borderRadius: Radii.full, borderWidth: 1, borderColor: Colors.primary },
  editText: { ...Typography.body2SemiBold, color: Colors.primary },
  menuSection: { backgroundColor: Colors.card, borderRadius: Radii.card, ...Shadows.card, overflow: 'hidden', marginBottom: Spacing.xxl },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  menuPressed: { backgroundColor: Colors.surface },
  menuLabel: { ...Typography.body, color: Colors.textPrimary, flex: 1 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl, backgroundColor: Colors.card, borderRadius: Radii.card, ...Shadows.card },
  logoutText: { ...Typography.body, color: Colors.error },
});
