/** ConnectGig — Rating type definitions */

export type RatingDirection = 'client_to_provider' | 'provider_to_client';

export interface Rating {
  ratingId: string;
  requestId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;        // 1–5
  comment?: string;
  direction: RatingDirection;
  createdAt: Date;
}
