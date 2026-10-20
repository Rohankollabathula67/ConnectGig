/**
 * ConnectGig — Firebase Storage Service
 *
 * Handles file uploads to Firebase Cloud Storage with progress tracking,
 * content-type validation, and graceful fallback for Demo / Offline Mode.
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { storage, IS_FIREBASE_ENABLED } from './firebase';

export interface UploadProgressCallback {
  (progress: number): void;
}

export const storageService = {
  /**
   * Upload user profile photo.
   * Path: users/{uid}/profile/avatar_{timestamp}.jpg
   * Matches `storage.rules` /users/{uid}/profile/{fileName}
   */
  async uploadProfilePhoto(
    userId: string,
    localUri: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    if (!IS_FIREBASE_ENABLED) {
      // In demo mode, return local URI directly
      return localUri;
    }

    const response = await fetch(localUri);
    const blob = await response.blob();
    const filename = `avatar_${Date.now()}.jpg`;
    const storageRef = ref(storage, `users/${userId}/profile/${filename}`);

    const uploadTask = uploadBytesResumable(storageRef, blob, {
      contentType: 'image/jpeg',
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          if (onProgress && snapshot.totalBytes > 0) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.warn('[storageService] Profile upload error:', error);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    });
  },

  /**
   * Upload service request problem photo.
   * Path: requests/{requestId}/problem_{timestamp}.jpg
   * Matches `storage.rules` /requests/{requestId}/{fileName}
   */
  async uploadRequestPhoto(
    requestId: string,
    localUri: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    if (!IS_FIREBASE_ENABLED) {
      return localUri;
    }

    const response = await fetch(localUri);
    const blob = await response.blob();
    const filename = `problem_${Date.now()}.jpg`;
    const storageRef = ref(storage, `requests/${requestId}/${filename}`);

    const uploadTask = uploadBytesResumable(storageRef, blob, {
      contentType: 'image/jpeg',
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          if (onProgress && snapshot.totalBytes > 0) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.warn('[storageService] Request photo upload error:', error);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    });
  },

  /**
   * Upload chat attachment image.
   * Path: chats/{conversationId}/chat_{timestamp}.jpg
   * Matches `storage.rules` /chats/{conversationId}/{fileName}
   */
  async uploadChatImage(
    conversationId: string,
    localUri: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    if (!IS_FIREBASE_ENABLED) {
      return localUri;
    }

    const response = await fetch(localUri);
    const blob = await response.blob();
    const filename = `chat_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
    const storageRef = ref(storage, `chats/${conversationId}/${filename}`);

    const uploadTask = uploadBytesResumable(storageRef, blob, {
      contentType: 'image/jpeg',
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          if (onProgress && snapshot.totalBytes > 0) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.warn('[storageService] Chat attachment upload error:', error);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    });
  },
};
