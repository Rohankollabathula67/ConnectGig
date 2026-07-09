"use strict";
/**
 * ConnectGig — Notifications Triggers Backend (§6.4)
 * Triggers push notifications on document changes (e.g. status updates).
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
exports.onServiceRequestUpdated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
// Initialize Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
const messaging = admin.messaging();
/**
 * Helper to fetch a client FCM token
 */
async function getClientToken(clientId) {
    const docSnap = await db.collection('users').doc(clientId).get();
    return docSnap.data()?.fcmToken || null;
}
/**
 * Helper to fetch a provider FCM token
 */
async function getProviderToken(providerId) {
    const docSnap = await db.collection('providers').doc(providerId).get();
    return docSnap.data()?.fcmToken || null;
}
/**
 * Firestore update trigger: monitors serviceRequests status changes
 * to send instant notifications.
 */
exports.onServiceRequestUpdated = (0, firestore_1.onDocumentUpdated)('serviceRequests/{requestId}', async (event) => {
    const change = event.data;
    if (!change)
        return;
    const oldData = change.before.data();
    const newData = change.after.data();
    const requestId = event.params.requestId;
    if (!oldData || !newData)
        return;
    // Trigger only on status changes
    if (oldData.status === newData.status)
        return;
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
        }
        else if (newData.status === 'completed') {
            // Job Completed -> Notify Client
            const token = await getClientToken(clientId);
            if (token) {
                await messaging.send({
                    token,
                    notification: {
                        title: 'Service Completed! ✅',
                        body: `Your ${category} service has been marked completed. Please complete payment.`,
                    },
                    data: { requestId, status: 'completed' },
                });
            }
        }
        else if (newData.status === 'cancelled') {
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
    }
    catch (error) {
        console.error(`[Notifications] Error handling update for request ${requestId}:`, error);
    }
});
//# sourceMappingURL=notifications.js.map