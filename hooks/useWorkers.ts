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
  /** Optional user location for distance calculation */
  userLocation?: { lat: number; lng: number } | { latitude: number; longitude: number };
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
function providerToCardData(
  provider: any,
  userLocation?: { lat: number; lng: number } | { latitude: number; longitude: number }
): WorkerCardData {
  // Rough distance calc (Haversine approximation in km)
  let distance = '—';
  const uLat = userLocation ? ('lat' in userLocation ? userLocation.lat : userLocation.latitude) : undefined;
  const uLng = userLocation ? ('lng' in userLocation ? userLocation.lng : userLocation.longitude) : undefined;

  if (uLat !== undefined && uLng !== undefined && provider.currentLocation) {
    const pLat = provider.currentLocation.lat ?? provider.currentLocation.latitude;
    const pLng = provider.currentLocation.lng ?? provider.currentLocation.longitude;
    if (pLat !== undefined && pLng !== undefined) {
      const R = 6371;
      const dLat = ((pLat - uLat) * Math.PI) / 180;
      const dLon = ((pLng - uLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((uLat * Math.PI) / 180) *
          Math.cos((pLat * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
    }
  }

  const cats: string[] = provider.categories || provider.skills || [];
  const primaryCategory = cats[0] ?? provider.subtitle ?? 'Service Provider';
  const rating = Number(provider.avgRating ?? provider.rating ?? 4.8);
  const jobs = Number(provider.totalJobsCompleted ?? provider.totalJobs ?? 15);
  const hourlyRate = Number(provider.hourlyRate ?? 300);
  const isOnline = provider.isOnline !== undefined ? Boolean(provider.isOnline) : true;
  const isVerified = provider.verificationStatus === 'verified' || provider.isVerified === true;

  return {
    uid: provider.uid || provider.id || `w_${Math.random()}`,
    name: provider.name ?? 'Service Provider',
    subtitle: primaryCategory,
    photoUrl: provider.profilePhotoUrl,
    rating,
    distance,
    hourlyRate,
    isVerified,
    isTopPro: jobs >= 50,
    isOnline,
    categories: cats,
  };
}

export function useWorkers(options: UseWorkersOptions = {}) {
  const { category, maxResults = 10, onlineOnly = true, userLocation } = options;

  const [workers, setWorkers] = useState<WorkerCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const uLat = userLocation ? ('lat' in userLocation ? userLocation.lat : userLocation.latitude) : undefined;
  const uLng = userLocation ? ('lng' in userLocation ? userLocation.lng : userLocation.longitude) : undefined;

  useEffect(() => {
    // ── Demo / Simulation Mode ─────────────────────────────────────────────
    if (!IS_FIREBASE_ENABLED) {
      let results = [...MOCK_WORKERS];
      if (category) {
        results = results.filter((w) =>
          w.categories.some((c) => c.toLowerCase().includes(category.toLowerCase())) ||
          w.subtitle.toLowerCase().includes(category.toLowerCase())
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
      // Query providers collection directly without requiring composite indexes
      const q = query(collection(db, 'providers'), limit(50));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            console.log('[useWorkers] Firestore providers collection is currently empty. Showing fallback.');
            setWorkers(MOCK_WORKERS.slice(0, maxResults));
            setLoading(false);
            return;
          }

          let docs = snapshot.docs.map((d) =>
            providerToCardData({ ...d.data(), uid: d.id }, userLocation)
          );

          if (category) {
            docs = docs.filter((w) =>
              w.categories.some((c) => c.toLowerCase().includes(category.toLowerCase())) ||
              w.subtitle.toLowerCase().includes(category.toLowerCase())
            );
          }

          if (onlineOnly) {
            docs = docs.filter((w) => w.isOnline);
          }

          // Sort in memory by rating descending
          docs.sort((a, b) => b.rating - a.rating);

          setWorkers(docs.slice(0, maxResults));
          setLoading(false);
        },
        (err) => {
          console.error('[useWorkers] Firestore error:', err);
          setError(err.message);
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
  }, [category, maxResults, onlineOnly, uLat, uLng]);

  return { workers, loading, error };
}
