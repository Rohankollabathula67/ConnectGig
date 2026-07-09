"use strict";
/**
 * ConnectGig — Bidirectional Ratings Aggregator (§7.0)
 * Aggregates average star reviews on provider profiles when ratings change.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateProviderRatings = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
// Initialize Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * Recalculates average rating and total feedback counts on review additions.
 */
exports.aggregateProviderRatings = (0, firestore_1.onDocumentWritten)('ratings/{ratingId}', async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    // Retrieve providerId from either old or new rating document
    const ratingData = snap.after.exists ? snap.after.data() : snap.before.data();
    if (!ratingData)
        return;
    const providerId = ratingData.providerId;
    if (!providerId)
        return;
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
    }
    catch (error) {
        console.error(`[Ratings Engine] Failed to aggregate ratings for provider ${providerId}:`, error);
    }
});
//# sourceMappingURL=ratings.js.map