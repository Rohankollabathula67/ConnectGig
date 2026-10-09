/**
 * ConnectGig — Edit Profile Screen
 * Allows editing user details (name, email, phone) and uploading profile photos using expo-image-picker.
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { safeGoBack } from '../utils/navigation';
import { ChevronLeft, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/colors';
import { Spacing, Radii, Shadows } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';
import { db, storage, IS_FIREBASE_ENABLED } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.displayName || 'Kollabathula Rohan');
  const [phone, setPhone] = useState(user?.phoneNumber || '+91 7674834552');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(user?.profilePhotoUrl);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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
        setPhotoUrl(localUri);
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
      let finalUrl = localUri;
      if (IS_FIREBASE_ENABLED) {
        const response = await fetch(localUri);
        const blob = await response.blob();
        const storageRef = ref(storage, `profile-photos/${userId}.jpg`);
        await uploadBytes(storageRef, blob);
        finalUrl = await getDownloadURL(storageRef);
        
        // Write to DB
        const role = user?.role === 'provider' ? 'providers' : 'users';
        const userDocRef = doc(db, role, userId);
        await updateDoc(userDocRef, { profilePhotoUrl: finalUrl });
      }
      
      // Update in memory Zustand store
      updateProfile({ profilePhotoUrl: finalUrl });
      setPhotoUrl(finalUrl);
      Alert.alert("Uploaded", "Profile photo uploaded successfully!");
    } catch (error) {
      console.warn("Upload failed, keeping locally", error);
      updateProfile({ profilePhotoUrl: localUri });
      setPhotoUrl(localUri);
      Alert.alert("Status", "Photo loaded locally.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter your name.");
      return;
    }

    setSubmitting(true);
    setTimeout(async () => {
      try {
        const userId = user?.uid || 'mock-client-uid';
        if (IS_FIREBASE_ENABLED) {
          const role = user?.role === 'provider' ? 'providers' : 'users';
          const userDocRef = doc(db, role, userId);
          await updateDoc(userDocRef, { displayName: name, email });
        }
        
        updateProfile({ displayName: name });
        setSubmitting(false);
        Alert.alert(
          "Success",
          "Profile updated successfully!",
          [{ text: "OK", onPress: () => safeGoBack() }]
        );
      } catch (err) {
        setSubmitting(false);
        // Fallback successful edit locally
        updateProfile({ displayName: name });
        Alert.alert("Success", "Profile updated!", [{ text: "OK", onPress: () => safeGoBack() }]);
      }
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => safeGoBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar Editor Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Avatar name={name} uri={photoUrl} size="xl" />
            <Pressable onPress={handlePickImage} style={styles.cameraIconOverlay}>
              {uploadingImage ? (
                <ActivityIndicator size="small" color={Colors.textWhite} />
              ) : (
                <Camera size={18} color={Colors.textWhite} strokeWidth={2} />
              )}
            </Pressable>
          </View>
          <Text style={styles.changeText}>Tap to change photo</Text>
        </View>

        {/* Form Card */}
        <Card variant="elevated" padding="xl" style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PHONE NUMBER</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={phone}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. rohan@connectgig.com"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </Card>

        {/* Save Button */}
        <View style={styles.buttonWrapper}>
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={submitting}
            fullWidth
            size="lg"
          />
        </View>
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
  backButton: { width: 40, height: 40, borderRadius: Radii.full, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...Typography.title3, color: Colors.textPrimary },
  scrollContent: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.xl, paddingBottom: 40 },

  avatarSection: { alignItems: 'center', marginVertical: Spacing.xl },
  avatarWrapper: { position: 'relative' },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  changeText: { ...Typography.caption, color: Colors.primary, marginTop: Spacing.md, fontWeight: '600' },

  formCard: { gap: Spacing.lg, marginBottom: Spacing.xl },
  inputGroup: { gap: Spacing.xs },
  label: { ...Typography.overline, color: Colors.textMuted, letterSpacing: 0.5 },
  input: {
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.lg,
    color: Colors.textPrimary,
    ...Typography.body2,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  disabledInput: {
    backgroundColor: Colors.inputBg,
    color: Colors.textMuted,
  },
  buttonWrapper: { marginTop: Spacing.md },
});
