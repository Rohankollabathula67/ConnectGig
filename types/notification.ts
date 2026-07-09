/** ConnectGig — Notification type definitions */

export type NotificationType =
  | 'worker_en_route'
  | 'payment_success'
  | 'booking_confirmed'
  | 'feature_announcement';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
  /** Optional deep link / related entity ID */
  referenceId?: string;
}
