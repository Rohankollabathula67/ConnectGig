"use strict";
/**
 * ConnectGig — Payments Engine (§5.1, §3.5)
 * Cloud Functions for creating payment orders and verifying signatures.
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
exports.verifyPaymentSignature = exports.createPaymentOrder = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * Creates an order receipt document and initiates payment processing
 */
exports.createPaymentOrder = (0, https_1.onCall)({ cors: true }, async (request) => {
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated to initiate payment.');
    }
    const { requestId, amount } = data;
    if (!requestId || !amount || amount <= 0) {
        throw new https_1.HttpsError('invalid-argument', 'Missing or invalid requestId/amount.');
    }
    // Verify request exists
    const requestDoc = await db.collection('serviceRequests').doc(requestId).get();
    if (!requestDoc.exists) {
        throw new https_1.HttpsError('not-found', 'Service request not found.');
    }
    const requestData = requestDoc.data();
    if (requestData?.clientId !== auth.uid) {
        throw new https_1.HttpsError('permission-denied', 'Only the client can pay for this service request.');
    }
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    // Store pending payment in payments collection
    await db.collection('payments').doc(orderId).set({
        orderId,
        requestId,
        clientId: auth.uid,
        workerId: requestData.acceptedProviderId || null,
        amount,
        currency: 'INR',
        status: 'created',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return {
        orderId,
        amount,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    };
});
/**
 * Verifies payment transaction signature and marks request as paid
 */
exports.verifyPaymentSignature = (0, https_1.onCall)({ cors: true }, async (request) => {
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const { orderId, paymentId, signature, requestId } = data;
    if (!orderId || !paymentId || !requestId) {
        throw new https_1.HttpsError('invalid-argument', 'Missing orderId, paymentId, or requestId.');
    }
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    if (razorpaySecret && signature) {
        const generatedSignature = crypto
            .createHmac('sha256', razorpaySecret)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');
        if (generatedSignature !== signature) {
            throw new https_1.HttpsError('permission-denied', 'Invalid payment signature.');
        }
    }
    // Update payment record
    const batch = db.batch();
    const paymentRef = db.collection('payments').doc(orderId);
    batch.update(paymentRef, {
        paymentId,
        signature: signature || 'simulated',
        status: 'paid',
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    // Update service request status and payment fields
    const serviceRequestRef = db.collection('serviceRequests').doc(requestId);
    batch.update(serviceRequestRef, {
        paymentStatus: 'paid',
        paymentTransactionId: paymentId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await batch.commit();
    return {
        success: true,
        message: 'Payment verified and service request updated.',
    };
});
//# sourceMappingURL=payments.js.map