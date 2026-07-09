/** ConnectGig — Service Request type definitions */

export type RequestStatus =
  | 'searching'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type BudgetTierType = 'quick_fix' | 'standard' | 'premium' | 'custom';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export interface RequestLocation {
  lat: number;
  lng: number;
  geohash: string;
  address?: string;
}

export interface ServiceRequest {
  requestId: string;
  clientId: string;
  category: string;
  description: string;
  budgetTier: BudgetTierType;
  estimatedCost: number;
  preferredDate: string;
  preferredTimeOfDay: TimeOfDay;
  clientLocation: RequestLocation;
  status: RequestStatus;
  currentRadiusKm: number;
  broadcastedProviderIds: string[];
  acceptedProviderId: string | null;
  createdAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
}
