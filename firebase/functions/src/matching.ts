/**
 * ConnectGig — Matching Engine Backend (§6.1, §6.2, §6.3)
 * Handles automatic request broadcasting, geohash proximity queries,
 * scheduled radius expansions, and atomic transactions for job acceptance.
 */

import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as geofire from 'geofire-common';

// Initialize Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Helper: Query providers within a given radius using geohashes
 */
async function queryProvidersInRadius(
  center: [number, number],
  radiusInM: number,
  category: string
): Promise<admin.firestore.DocumentSnapshot[]> {
  const bounds = geofire.geohashQueryBounds(center, radiusInM);
  const promises = [];

  for (const b of bounds) {
    const q = db
      .collection('providers')
      .orderBy('geohash')
      .startAt(b[0])
      .endAt(b[1]);
    promises.push(q.get());
  }

  const snapshots = await Promise.all(promises);
  const matchingDocs: admin.firestore.DocumentSnapshot[] = [];

  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      const data = doc.data();
      // Match constraints: online, available, and correct category
      if (
        data.isOnline === true &&
        data.isAvailable === true &&
        data.category === category
      ) {
        // Double-check real distance
        const lat = data.latitude;
        const lng = data.longitude;
        const distanceInKm = geofire.distanceBetween(center, [lat, lng]);
        const distanceInM = distanceInKm * 1000;
        if (distanceInM <= radiusInM) {
          matchingDocs.push(doc);
        }
      }
    }
  }

  return matchingDocs;
}

/**
 * §6.1 — Broadcast on request creation:
 * Firestore onCreate trigger on 'serviceRequests/{requestId}'
 */
export const broadcastOnRequestCreation = onDocumentCreated(
  'serviceRequests/{requestId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const requestData = snap.data();
    const requestId = event.params.requestId;

    const category = requestData.category;
    const clientLoc = requestData.clientLocation; // { lat, lng }
    if (!clientLoc || !clientLoc.lat || !clientLoc.lng) return;

    const center: [number, number] = [clientLoc.lat, clientLoc.lng];
    const initialRadiusM = 8000; // Starting radius: 8km

    try {
      // Find matching nearby providers
      const nearbyProviders = await queryProvidersInRadius(center, initialRadiusM, category);
      const providerIds: string[] = [];

      for (const p of nearbyProviders) {
        providerIds.push(p.id);

        // Send push notification to worker
        const token = p.data()?.fcmToken;
        if (token) {
          const payload = {
            notification: {
              title: 'New Job Request Nearby!',
              body: `Incoming ${category} request: "${requestData.description}"`,
            },
            data: {
              requestId,
              click_action: 'FLUTTER_NOTIFICATION_CLICK',
            },
          };
          await messaging.send({ token, ...payload });
        }
      }

      // Update broadcast list in request document
      await snap.ref.update({
        broadcastedProviderIds: providerIds,
        currentRadiusKm: 8,
      });

      console.log(`[Matching Engine] Broadcasted request ${requestId} to ${providerIds.length} providers.`);
    } catch (error) {
      console.error(`[Matching Engine] Error broadcasting request ${requestId}:`, error);
    }
  }
);

/**
 * §6.2 — Auto-expanding radius:
 * Scheduled function running every 2 minutes
 */
export const expandRadiusQuery = onSchedule('*/2 * * * *', async () => {
  const activeRequestsQuery = db
    .collection('serviceRequests')
    .where('status', '==', 'searching');

  const snapshot = await activeRequestsQuery.get();
  console.log(`[Matching Engine] Checking radius expansion for ${snapshot.size} active requests.`);

  const batchPromises = snapshot.docs.map(async (docSnap) => {
    const requestData = docSnap.data();
    const requestId = docSnap.id;
    const currentRadius = requestData.currentRadiusKm || 8;
    const clientLoc = requestData.clientLocation;
    const category = requestData.category;
    const broadcastedIds: string[] = requestData.broadcastedProviderIds || [];

    // Max expansion is 20km
    if (currentRadius >= 20) {
      console.log(`[Matching Engine] Request ${requestId} expired after reaching max radius.`);
      await docSnap.ref.update({ status: 'expired' });
      return;
    }

    const nextRadius = currentRadius + 4; // Expand by 4km steps
    const center: [number, number] = [clientLoc.lat, clientLoc.lng];

    try {
      const providers = await queryProvidersInRadius(center, nextRadius * 1000, category);
      const newProviderIds: string[] = [];

      for (const p of providers) {
        if (!broadcastedIds.includes(p.id)) {
          newProviderIds.push(p.id);

          // Notify new provider
          const token = p.data()?.fcmToken;
          if (token) {
            await messaging.send({
              token,
              notification: {
                title: 'New Job Request Nearby!',
                body: `Incoming ${category} request: "${requestData.description}"`,
              },
              data: { requestId },
            });
          }
        }
      }

      // Update request state with expanded radius and accumulated providers
      await docSnap.ref.update({
        currentRadiusKm: nextRadius,
        broadcastedProviderIds: [...broadcastedIds, ...newProviderIds],
      });

      console.log(`[Matching Engine] Expanded request ${requestId} to ${nextRadius}km. Added ${newProviderIds.length} new providers.`);
    } catch (error) {
      console.error(`[Matching Engine] Error expanding request ${requestId}:`, error);
    }
  });

  await Promise.all(batchPromises);
});

/**
 * §6.3 — Atomic Accept Callable Function:
 * Locks request document in transaction to prevent race conditions (double bookings).
 */
export const acceptRequestAtomic = onCall(async (request) => {
  const { requestId, providerId } = request.data;

  if (!requestId || !providerId) {
    throw new HttpsError('invalid-argument', 'Request ID and Provider ID are required.');
  }

  const requestRef = db.collection('serviceRequests').doc(requestId);
  const providerRef = db.collection('providers').doc(providerId);

  try {
    const result = await db.runTransaction(async (transaction) => {
      const requestDoc = await transaction.get(requestRef);
      const providerDoc = await transaction.get(providerRef);

      if (!requestDoc.exists) {
        throw new HttpsError('not-found', 'Service request does not exist.');
      }
      if (!providerDoc.exists) {
        throw new HttpsError('not-found', 'Provider profile does not exist.');
      }

      const requestData = requestDoc.data();
      const providerData = providerDoc.data();

      // Enforce atomic status lock
      if (requestData?.status !== 'searching') {
        return { success: false, reason: 'Job already accepted or cancelled.' };
      }
      if (providerData?.isAvailable !== true) {
        return { success: false, reason: 'Provider is currently unavailable.' };
      }

      // Perform transaction updates
      transaction.update(requestRef, {
        status: 'accepted',
        acceptedProviderId: providerId,
        acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      transaction.update(providerRef, {
        isAvailable: false,
      });

      return { success: true };
    });

    return result;
  } catch (error: any) {
    console.error(`[Matching Engine] Transaction failed for request ${requestId}:`, error);
    throw new HttpsError('internal', error?.message || 'Transaction error.');
  }
});
