
export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface PaymentState {
  status: PaymentStatus;
  failureReason?: string;
  retrySuggestion?: string;
  shouldRetry?: boolean;
}

// This is a simple in-memory store. 
// In a real production application, you would use a database like Firestore or Redis.
const paymentStore = new Map<string, PaymentState>();

export default paymentStore;
