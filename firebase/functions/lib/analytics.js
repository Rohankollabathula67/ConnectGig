"use strict";
/**
 * ConnectGig — Provider Analytics Pipeline (§7.0)
 * Aggregates daily/weekly earnings stats for workers to render charts.
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
exports.buildWorkerDailyAnalytics = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
// Initialize Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * Scheduled nightly function that aggregates completed requests
 * to build dashboard data nodes.
 */
exports.buildWorkerDailyAnalytics = (0, scheduler_1.onSchedule)('0 2 * * *', async () => {
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
        const providerMetrics = {};
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
    }
    catch (error) {
        console.error('[Analytics Pipeline] Daily analytics pipeline run crashed:', error);
    }
});
//# sourceMappingURL=analytics.js.map