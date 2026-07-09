/** ConnectGig — User type definitions */

export type UserRole = 'client' | 'provider';

export interface User {
  uid: string;
  role: UserRole;
  name: string;
  phone: string;
  email?: string;
  profilePhotoUrl?: string;
  createdAt: Date;
}
