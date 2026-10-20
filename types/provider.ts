/** ConnectGig — Provider type definitions */

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface ProviderLocation {
  lat: number;
  lng: number;
  geohash: string;
}

export interface ProviderVerificationDocs {
  aadhaarUrl?: string;
  panUrl?: string;
  certUrl?: string;
  submittedAt?: any;
  verifiedAt?: any;
}

export interface Provider {
  uid: string;
  categories: string[];
  verificationStatus: VerificationStatus;
  verificationDocs?: ProviderVerificationDocs;
  currentLocation: ProviderLocation;
  isOnline: boolean;
  isAvailable: boolean;
  avgRating: number;
  totalJobsCompleted: number;
  hourlyRate: number;
  categoryRates?: Record<string, number>;
  responseTimeMins: number;
  yearsExperience: number;
  lastLocationUpdate: Date;
  // Merged from user for display
  name?: string;
  profilePhotoUrl?: string;
}

export interface ProviderAnalytics {
  period: 'daily' | 'weekly' | 'monthly';
  date: string;
  jobsCompleted: number;
  earnings: number;
  avgRating: number;
  acceptanceRate: number;
}
