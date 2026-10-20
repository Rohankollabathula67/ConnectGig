/**
 * ConnectGig — Client Profile Screen (§3.9)
 * Features dynamic user details, camera overlays for image-picker photo updates,
 * and responsive menu navigation linking settings, reviews, privacy, and support.
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronRight, HelpCircle, LogOut, Settings, Shield, Star, Camera, FileText } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/colors';
import { Radii, Shadows, Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';
import { db, IS_FIREBASE_ENABLED } from '../../services/firebase';
import { storageService } from '../../services/storage';
import { doc, updateDoc } from 'firebase/firestore';

const MENU_ITEMS = [
  { icon: Settings, label: 'Account Settings', route: '/settings' },
  { icon: Star, label: 'My Reviews', route: '/my-reviews' },
  { icon: Shield, label: 'Privacy & Security', route: '/privacy' },
  { icon: FileText, label: 'Terms of Service', route: '/terms' },
  { icon: HelpCircle, label: 'Help & Support', route: '/help-support' },
];

export default function ClientProfileScreen() {
  const { user, updateProfile } = useAuthStore();
  const [uploadingImage, setUploadingImage] = useState(false);

  const name = user?.displayName || 'Kollabathula Rohan';
  const phone = user?.phoneNumber || '+91 7674834552';
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
    const userId = user?.uid || 'mock-client-uid';
    setUploadingImage(true);
    try {
      const finalUrl = await storageService.uploadProfilePhoto(userId, localUri);
      if (IS_FIREBASE_ENABLED) {
        // Write to DB
        const role = user?.role === 'provider' ? 'providers' : 'users';
        const userDocRef = doc(db, role, userId);
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

        {/* Profile Card */}
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
  avatarContainer: { position: 'relative', marginBottom: Spacing.md },
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
  
  name: { ...Typography.title2, color: Colors.textPrimary, marginTop: Spacing.xs },
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
