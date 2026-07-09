/**
 * ConnectGig — Request Store (§3.4, §3.5)
 * Zustand store to manage active booking requests and real-time status updates.
 */

import { create } from 'zustand';
import { firestoreService } from '../services/firestore';
import type { ServiceRequest } from '../types/serviceRequest';

interface RequestState {
  activeRequest: ServiceRequest | null;
  loading: boolean;
  error: string | null;
  activeListener: (() => void) | null;
  
  createRequest: (
    clientId: string,
    clientName: string,
    category: string,
    description: string,
    budget: number,
    location: { latitude: number; longitude: number }
  ) => Promise<string>;
  
  cancelRequest: (requestId: string) => Promise<void>;
  acceptRequest: (requestId: string, workerId: string, workerName: string, rating: number) => Promise<void>;
  completeRequest: (requestId: string) => Promise<void>;
  subscribeToActiveRequest: (userId: string, role: 'client' | 'worker') => void;
  unsubscribeFromActiveRequest: () => void;
}

export const useRequestStore = create<RequestState>((set, get) => ({
  activeRequest: null,
  loading: false,
  error: null,
  activeListener: null,

  createRequest: async (clientId, clientName, category, description, budget, location) => {
    set({ loading: true, error: null });
    try {
      const data: Omit<ServiceRequest, 'requestId' | 'createdAt'> = {
        clientId,
        category,
        description,
        budgetTier: 'standard',
        estimatedCost: budget,
        preferredDate: new Date().toDateString(),
        preferredTimeOfDay: 'afternoon',
        clientLocation: {
          lat: location.latitude,
          lng: location.longitude,
          geohash: '',
        },
        status: 'searching',
        currentRadiusKm: 8,
        broadcastedProviderIds: [],
        acceptedProviderId: null,
      };
      const docId = await firestoreService.createRequest(data);
      set({ loading: false });
      return docId;
    } catch (e: any) {
      set({ loading: false, error: e?.message || 'Failed to create service request.' });
      throw e;
    }
  },

  cancelRequest: async (requestId) => {
    set({ loading: true });
    try {
      await firestoreService.updateRequestStatus(requestId, 'cancelled');
      set({ activeRequest: null, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message || 'Failed to cancel request.' });
    }
  },

  acceptRequest: async (requestId, workerId, workerName, rating) => {
    set({ loading: true });
    try {
      await firestoreService.updateRequestStatus(requestId, 'accepted', {
        acceptedProviderId: workerId,
        estimatedArrivalMins: 8,
        acceptedAt: new Date(),
      });
      set({ loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message || 'Failed to accept request.' });
    }
  },

  completeRequest: async (requestId) => {
    set({ loading: true });
    try {
      await firestoreService.updateRequestStatus(requestId, 'completed');
      set({ activeRequest: null, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message || 'Failed to complete request.' });
    }
  },

  subscribeToActiveRequest: (userId, role) => {
    // Unsubscribe existing first
    get().unsubscribeFromActiveRequest();

    const unsubscribe = firestoreService.subscribeToActiveRequest(
      userId,
      role,
      (request) => {
        set({ activeRequest: request });
      }
    );

    set({ activeListener: unsubscribe });
  },

  unsubscribeFromActiveRequest: () => {
    const listener = get().activeListener;
    if (listener) {
      listener();
      set({ activeListener: null, activeRequest: null });
    }
  },
}));
