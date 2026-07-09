/**
 * ConnectGig — Bidirectional Ratings Aggregator (§7.0)
 * Aggregates average star reviews on provider profiles when ratings change.
 */

import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

// Initialize Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Recalculates average rating and total feedback counts on review additions.
 */
export const aggregateProviderRatings = onDocumentWritten(
  'ratings/{ratingId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    // Retrieve providerId from either old or new rating document
    const ratingData = snap.after.exists ? snap.after.data() : snap.before.data();
    if (!ratingData) return;

    const providerId = ratingData.providerId;
    if (!providerId) return;

    console.log(`[Ratings Engine] Recalculating ratings profile for provider ${providerId}.`);

    try {
      // Query all review documents for this provider
      const ratingsQuery = db
        .collection('ratings')
        .where('providerId', '==', providerId);

      const snapshot = await ratingsQuery.get();

      if (snapshot.empty) {
        // Reset to default values if no reviews remain
        await db.collection('providers').doc(providerId).update({
          avgRating: 5.0,
          totalRatingsCount: 0,
        });
        return;
      }

      let totalScore = 0;
      const count = snapshot.size;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        totalScore += data.score || 5;
      });

      const avgRating = parseFloat((totalScore / count).toFixed(2));

      // Update provider document with correct aggregated stats
      await db.collection('providers').doc(providerId).update({
        avgRating,
        totalRatingsCount: count,
      });

      console.log(`[Ratings Engine] Provider ${providerId} updated with average rating: ${avgRating} across ${count} reviews.`);
    } catch (error) {
      console.error(`[Ratings Engine] Failed to aggregate ratings for provider ${providerId}:`, error);
    }
  }
);
