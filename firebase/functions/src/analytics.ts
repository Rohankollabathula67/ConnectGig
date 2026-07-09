/**
 * ConnectGig — Provider Analytics Pipeline (§7.0)
 * Aggregates daily/weekly earnings stats for workers to render charts.
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

// Initialize Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Scheduled nightly function that aggregates completed requests
 * to build dashboard data nodes.
 */
export const buildWorkerDailyAnalytics = onSchedule('0 2 * * *', async () => {
  console.log('[Analytics Pipeline] Running daily worker statistics aggregation.');

  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));

  try {
    // Query completed requests today
    const completedRequests = await db
      .collection('serviceRequests')
      .where('status', '==', 'completed')
      .where('completedAt', '>=', admin.firestore.Timestamp.fromDate(startOfDay))
      .get();

    console.log(`[Analytics Pipeline] Found ${completedRequests.size} completed requests today.`);

    const providerMetrics: Record<string, { earnings: number; jobsCount: number }> = {};

    completedRequests.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const providerId = data.acceptedProviderId;
      const payout = data.estimatedCost || 0;

      if (providerId) {
        if (!providerMetrics[providerId]) {
          providerMetrics[providerId] = { earnings: 0, jobsCount: 0 };
        }
        providerMetrics[providerId].earnings += payout;
        providerMetrics[providerId].jobsCount += 1;
      }
    });

    const batchPromises = Object.keys(providerMetrics).map(async (providerId) => {
      const metrics = providerMetrics[providerId];
      const dateKey = startOfDay.toISOString().split('T')[0]; // YYYY-MM-DD

      // Write stats node inside provider's subcollection
      const analyticsRef = db
        .collection('providers')
        .doc(providerId)
        .collection('dailyAnalytics')
        .doc(dateKey);

      await analyticsRef.set({
        date: startOfDay,
        totalEarnings: metrics.earnings,
        jobsCompleted: metrics.jobsCount,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await Promise.all(batchPromises);
    console.log(`[Analytics Pipeline] Successfully populated analytics subcollections for ${Object.keys(providerMetrics).length} providers.`);
  } catch (error) {
    console.error('[Analytics Pipeline] Daily analytics pipeline run crashed:', error);
  }
});
