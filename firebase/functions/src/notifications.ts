/**
 * ConnectGig — Notifications Triggers Backend (§6.4)
 * Triggers push notifications on document changes (e.g. status updates).
 */

import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

// Initialize Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Helper to fetch a client FCM token
 */
async function getClientToken(clientId: string): Promise<string | null> {
  const docSnap = await db.collection('users').doc(clientId).get();
  return docSnap.data()?.fcmToken || null;
}

/**
 * Helper to fetch a provider FCM token
 */
async function getProviderToken(providerId: string): Promise<string | null> {
  const docSnap = await db.collection('providers').doc(providerId).get();
  return docSnap.data()?.fcmToken || null;
}

/**
 * Firestore update trigger: monitors serviceRequests status changes
 * to send instant notifications.
 */
export const onServiceRequestUpdated = onDocumentUpdated(
  'serviceRequests/{requestId}',
  async (event) => {
    const change = event.data;
    if (!change) return;

    const oldData = change.before.data();
    const newData = change.after.data();
    const requestId = event.params.requestId;

    if (!oldData || !newData) return;

    // Trigger only on status changes
    if (oldData.status === newData.status) return;

    const clientId = newData.clientId;
    const providerId = newData.acceptedProviderId;
    const category = newData.category;

    try {
      if (newData.status === 'accepted') {
        // Worker accepted -> Notify Client
        const token = await getClientToken(clientId);
        if (token) {
          await messaging.send({
            token,
            notification: {
              title: 'Worker Found! ⚡',
              body: `Your request for ${category} has been accepted. Professional is en route.`,
            },
            data: { requestId, status: 'accepted' },
          });
        }
      } else if (newData.status === 'completed') {
        // Job Completed -> Update provider earnings & stats
        if (providerId) {
          const payout = Number(newData.estimatedCost) || 0;
          try {
            await db.collection('providers').doc(providerId).set(
              {
                totalJobsCompleted: admin.firestore.FieldValue.increment(1),
                totalEarnings: admin.firestore.FieldValue.increment(payout),
                lastCompletedJobAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
          } catch (statErr) {
            console.error(`[Notifications] Failed to update stats for provider ${providerId}:`, statErr);
          }
        }

        // Job Completed -> Notify Client
        const token = await getClientToken(clientId);
        if (token) {
          await messaging.send({
            token,
            notification: {
              title: 'Service Completed! ✅',
              body: `Your ${category} service has been marked completed. Thank you!`,
            },
            data: { requestId, status: 'completed' },
          });
        }
      } else if (newData.status === 'cancelled') {
        // Job Cancelled -> Notify counterparties
        const clientToken = await getClientToken(clientId);
        if (clientToken) {
          await messaging.send({
            token: clientToken,
            notification: {
              title: 'Request Cancelled ❌',
              body: `Your ${category} request has been cancelled.`,
            },
            data: { requestId, status: 'cancelled' },
          });
        }
        if (providerId) {
          const providerToken = await getProviderToken(providerId);
          if (providerToken) {
            await messaging.send({
              token: providerToken,
              notification: {
                title: 'Job Cancelled ❌',
                body: `The client has cancelled the ${category} booking.`,
              },
              data: { requestId, status: 'cancelled' },
            });
          }
        }
      }
    } catch (error) {
      console.error(`[Notifications] Error handling update for request ${requestId}:`, error);
    }
  }
);
