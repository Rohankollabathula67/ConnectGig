/**
 * ConnectGig — Razorpay Payment Gateway Service (§5.1, §3.5)
 * Handles client billing, invoice generation, and transaction confirmation.
 * Runs in Simulated Test Mode for MVP development.
 */

import { Alert } from 'react-native';

export interface PaymentDetails {
  requestId: string;
  amount: number;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
}

export const paymentsService = {
  /**
   * Initialize a new checkout order
   */
  async processPayment(details: PaymentDetails): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    console.log(`[Payments] Initiating checkout order for request ${details.requestId} (Amount: $${details.amount})`);

    // Simulate Network Request latency (1.8 seconds)
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock success rate: 95%
        const isSuccessful = Math.random() < 0.95;

        if (isSuccessful) {
          const transactionId = `pay_tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          console.log(`[Payments] Payment succeeded. TxID: ${transactionId}`);
          
          Alert.alert(
            "Payment Successful",
            `Thank you! Your payment of $${details.amount}.00 has been verified.\nTransaction ID: ${transactionId}`
          );

          resolve({ success: true, transactionId });
        } else {
          console.warn("[Payments] Payment failed or cancelled by user.");
          
          Alert.alert(
            "Payment Declined",
            "The transaction was declined by the issuer or cancelled. Please try again."
          );

          resolve({ success: false, error: "Payment authorization failed." });
        }
      }, 1800);
    });
  }
};
