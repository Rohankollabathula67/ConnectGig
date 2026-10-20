/**
 * ConnectGig — useWorkers Hook (Sprint 1 — §3.4)
 * Real-time Firestore query for nearby online providers.
 * Falls back to curated mock data in Demo Mode (IS_FIREBASE_ENABLED = false).
 *
 * Usage:
 *   const { workers, loading } = useWorkers({ category, maxResults: 5 });
 */

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, IS_FIREBASE_ENABLED } from '../services/firebase';
import type { Provider } from '../types/provider';

export interface WorkerCardData {
  uid: string;
  name: string;
  subtitle: string;
  photoUrl?: string;
  rating: number;
  distance: string;
  hourlyRate: number;
  isVerified: boolean;
  isTopPro: boolean;
  isOnline: boolean;
  categories: string[];
}

interface UseWorkersOptions {
  /** Filter by service category. Undefined = all categories. */
  category?: string;
  /** Max number of results. Default 10. */
  maxResults?: number;
  /** Only return online providers. Default true. */
  onlineOnly?: boolean;
}

// ── Curated mock data used in Demo / Simulation Mode ──────────────────────────
const MOCK_WORKERS: WorkerCardData[] = [
  {
    uid: 'mock-w1',
    name: 'Marcus Rivera',
    subtitle: 'Expert Electrician',
    rating: 4.9,
    distance: '0.8 km',
    hourlyRate: 350,
    isVerified: true,
    isTopPro: false,
    isOnline: true,
    categories: ['Electrician'],
  },
  {
    uid: 'mock-w2',
    name: 'Sarah Jenkins',
    subtitle: 'Professional Cleaner',
    rating: 5.0,
    distance: '1.2 km',
    hourlyRate: 220,
    isVerified: true,
    isTopPro: true,
    isOnline: true,
    categories: ['Cleaner'],
  },
  {
    uid: 'mock-w3',
    name: 'David Chen',
    subtitle: 'Master Plumber',
    rating: 4.8,
    distance: '2.5 km',
    hourlyRate: 380,
    isVerified: true,
    isTopPro: false,
    isOnline: true,
    categories: ['Plumber'],
  },
  {
    uid: 'mock-w4',
    name: 'Priya Sharma',
    subtitle: 'Interior Painter',
    rating: 4.7,
    distance: '3.1 km',
    hourlyRate: 300,
    isVerified: true,
    isTopPro: false,
    isOnline: false,
    categories: ['Painter'],
  },
  {
    uid: 'mock-w5',
    name: 'Ravi Kumar',
    subtitle: 'AC Technician',
    rating: 4.6,
    distance: '1.8 km',
    hourlyRate: 280,
    isVerified: false,
    isTopPro: false,
    isOnline: true,
    categories: ['Electrician', 'AC Repair'],
  },
];

/** Convert Firestore Provider doc → WorkerCardData for display */
function providerToCardData(provider: Provider & { uid: string }, userLocation?: { lat: number; lng: number }): WorkerCardData {
  // Rough distance calc (Haversine approximation in km)
  let distance = '—';
  if (userLocation && provider.currentLocation) {
    const R = 6371;
    const dLat = ((provider.currentLocation.lat - userLocation.lat) * Math.PI) / 180;
    const dLon = ((provider.currentLocation.lng - userLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((userLocation.lat * Math.PI) / 180) *
        Math.cos((provider.currentLocation.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distance = km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
  }

  const primaryCategory = provider.categories?.[0] ?? 'Service Provider';

  return {
    uid: provider.uid,
    name: provider.name ?? 'Provider',
    subtitle: primaryCategory,
    photoUrl: provider.profilePhotoUrl,
    rating: provider.avgRating ?? 0,
    distance,
    hourlyRate: provider.hourlyRate ?? 0,
    isVerified: provider.verificationStatus === 'verified',
    isTopPro: (provider.totalJobsCompleted ?? 0) >= 50,
    isOnline: provider.isOnline,
    categories: provider.categories ?? [],
  };
}

export function useWorkers(options: UseWorkersOptions = {}) {
  const { category, maxResults = 10, onlineOnly = true } = options;

  const [workers, setWorkers] = useState<WorkerCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ── Demo / Simulation Mode ─────────────────────────────────────────────
    if (!IS_FIREBASE_ENABLED) {
      let results = [...MOCK_WORKERS];
      if (category) {
        results = results.filter((w) =>
          w.categories.some((c) => c.toLowerCase().includes(category.toLowerCase()))
        );
      }
      if (onlineOnly) {
        results = results.filter((w) => w.isOnline);
      }
      setWorkers(results.slice(0, maxResults));
      setLoading(false);
      return;
    }

    // ── Live Firestore Query ───────────────────────────────────────────────
    setLoading(true);
    try {
      const constraints: any[] = [
        where('isAvailable', '==', true),
        orderBy('avgRating', 'desc'),
        limit(maxResults),
      ];

      if (onlineOnly) constraints.unshift(where('isOnline', '==', true));
      if (category) constraints.unshift(where('categories', 'array-contains', category));

      const q = query(collection(db, 'providers'), ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((d) =>
            providerToCardData({ ...(d.data() as Omit<Provider, 'uid'>), uid: d.id })
          );
          setWorkers(docs);
          setLoading(false);
        },
        (err) => {
          console.error('[useWorkers] Firestore error:', err);
          setError(err.message);
          // Fall back to mock data on permission errors (e.g. no auth yet)
          setWorkers(MOCK_WORKERS.slice(0, maxResults));
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.error('[useWorkers] Query setup error:', err);
      setError(err.message);
      setWorkers(MOCK_WORKERS.slice(0, maxResults));
      setLoading(false);
    }
  }, [category, maxResults, onlineOnly]);

  return { workers, loading, error };
}
