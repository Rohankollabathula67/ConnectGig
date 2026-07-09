/**
 * ConnectGig — Firestore Service Layer (§3.4, §3.5)
 * Handles CRUD operations for Users, Bookings, and Notifications.
 * Runs in Real Firebase mode or Simulated Local Mode.
 */

import { db, IS_FIREBASE_ENABLED } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  query,
  where,
  addDoc
} from 'firebase/firestore';
import type { ServiceRequest } from '../types/serviceRequest';
import type { AppNotification } from '../types/notification';

// Extend notification to include userId for database lookup
export interface UserNotification extends AppNotification {
  userId: string;
}

// Local Mock Database arrays for simulated mode
let mockRequests: ServiceRequest[] = [];
let mockNotifications: UserNotification[] = [];
let requestListeners: ((req: ServiceRequest | null) => void)[] = [];
let notificationsListeners: ((notifs: UserNotification[]) => void)[] = [];

// Helper to notify listeners of changes in mock request
const triggerRequestUpdate = (req: ServiceRequest | null) => {
  requestListeners.forEach((listener) => listener(req));
};

// Helper to notify listeners of changes in mock notifications
const triggerNotificationsUpdate = () => {
  notificationsListeners.forEach((listener) => listener([...mockNotifications]));
};

export const firestoreService = {
  /**
   * Listen to active service request
   */
  subscribeToActiveRequest(
    userId: string,
    role: 'client' | 'worker',
    callback: (request: ServiceRequest | null) => void
  ): () => void {
    if (!IS_FIREBASE_ENABLED) {
      requestListeners.push(callback);
      // Immediately call with current active request
      const active = mockRequests.find(
        (r) => (role === 'client' ? r.clientId === userId : r.acceptedProviderId === userId) && 
        r.status !== 'completed' && r.status !== 'cancelled'
      );
      callback(active || null);
      
      // Return unsubscribe cleanup function
      return () => {
        requestListeners = requestListeners.filter((l) => l !== callback);
      };
    }

    // Real Firebase listener
    const field = role === 'client' ? 'clientId' : 'acceptedProviderId';
    const q = query(
      collection(db, 'serviceRequests'),
      where(field, '==', userId),
      where('status', 'in', ['searching', 'accepted', 'in_progress'])
    );

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
      } else {
        const docData = snapshot.docs[0].data() as ServiceRequest;
        callback({ ...docData, requestId: snapshot.docs[0].id });
      }
    });
  },

  /**
   * Create a new service request
   */
  async createRequest(requestData: Omit<ServiceRequest, 'requestId' | 'createdAt'>): Promise<string> {
    const createdAt = new Date();
    
    if (!IS_FIREBASE_ENABLED) {
      const requestId = `mock-request-${Date.now()}`;
      const newRequest: ServiceRequest = {
        ...requestData,
        requestId,
        createdAt,
      };
      mockRequests.push(newRequest);
      triggerRequestUpdate(newRequest);

      // Trigger Simulated Matchmaking Engine (Phase 4 Simulation)
      this.simulateMatchmaking(requestId);
      
      return requestId;
    }

    // Real Firebase Add Request doc
    const docRef = await addDoc(collection(db, 'serviceRequests'), {
      ...requestData,
      createdAt,
    });
    return docRef.id;
  },

  /**
   * Update request status
   */
  async updateRequestStatus(requestId: string, status: ServiceRequest['status'], extra = {}): Promise<void> {
    if (!IS_FIREBASE_ENABLED) {
      const idx = mockRequests.findIndex((r) => r.requestId === requestId);
      if (idx !== -1) {
        mockRequests[idx] = { ...mockRequests[idx], status, ...extra };
        triggerRequestUpdate(mockRequests[idx]);

        // Push mock notification based on status
        this.addMockNotification({
          userId: mockRequests[idx].clientId,
          type: status === 'accepted' ? 'worker_en_route' : status === 'completed' ? 'payment_success' : 'booking_confirmed',
          title: status === 'accepted' ? 'Worker Assigned' : status === 'completed' ? 'Job Completed' : 'Booking Update',
          body: status === 'accepted' 
            ? 'Marcus Rivera has accepted your request and is en route!' 
            : status === 'completed' 
              ? 'Your job has been successfully completed. Total payment: $45.' 
              : 'Status updated.',
        });
      }
      return;
    }

    // Real Firebase Update
    const docRef = doc(db, 'serviceRequests', requestId);
    await updateDoc(docRef, { status, ...extra });
  },

  /**
   * Listen to user notifications
   */
  subscribeToNotifications(
    userId: string,
    callback: (notifications: UserNotification[]) => void
  ): () => void {
    if (!IS_FIREBASE_ENABLED) {
      notificationsListeners.push(callback);
      // Immediately call with mock data
      callback(mockNotifications.filter((n) => n.userId === userId));
      return () => {
        notificationsListeners = notificationsListeners.filter((l) => l !== callback);
      };
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        ...(doc.data() as UserNotification),
        id: doc.id,
      }));
      callback(list);
    });
  },

  /**
   * Helper to write notifications in mock mode
   */
  addMockNotification(data: Omit<UserNotification, 'id' | 'createdAt' | 'isRead'>) {
    const newNotif: UserNotification = {
      ...data,
      id: `mock-notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date(),
    };
    mockNotifications.unshift(newNotif);
    triggerNotificationsUpdate();
  },

  /**
   * Simulated Matchmaking Engine (for Mock Mode)
   */
  simulateMatchmaking(requestId: string) {
    setTimeout(async () => {
      // Step 1: Assign worker after 6 seconds of searching animation
      const req = mockRequests.find((r) => r.requestId === requestId);
      if (req && req.status === 'searching') {
        console.log("[Simulation] Worker found. Updating status to 'accepted'.");
        await this.updateRequestStatus(requestId, 'accepted', {
          acceptedProviderId: 'mock-worker-uid',
          estimatedArrivalMins: 8,
          acceptedAt: new Date(),
        });
      }
    }, 6000);
  }
};
