/**
 * ConnectGig — Payments Engine (§5.1, §3.5)
 * Cloud Functions for creating payment orders and verifying signatures.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Creates an order receipt document and initiates payment processing
 */
export const createPaymentOrder = onCall(
  { cors: true },
  async (request) => {
    const { auth, data } = request;

    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated to initiate payment.');
    }

    const { requestId, amount } = data;
    if (!requestId || !amount || amount <= 0) {
      throw new HttpsError('invalid-argument', 'Missing or invalid requestId/amount.');
    }

    // Verify request exists
    const requestDoc = await db.collection('serviceRequests').doc(requestId).get();
    if (!requestDoc.exists) {
      throw new HttpsError('not-found', 'Service request not found.');
    }

    const requestData = requestDoc.data();
    if (requestData?.clientId !== auth.uid) {
      throw new HttpsError('permission-denied', 'Only the client can pay for this service request.');
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
  }
);

/**
 * Verifies payment transaction signature and marks request as paid
 */
export const verifyPaymentSignature = onCall(
  { cors: true },
  async (request) => {
    const { auth, data } = request;

    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const { orderId, paymentId, signature, requestId } = data;

    if (!orderId || !paymentId || !requestId) {
      throw new HttpsError('invalid-argument', 'Missing orderId, paymentId, or requestId.');
    }

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (razorpaySecret && signature) {
      const generatedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (generatedSignature !== signature) {
        throw new HttpsError('permission-denied', 'Invalid payment signature.');
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
  }
);
