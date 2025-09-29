
'use server';

import crypto from 'crypto';
import paymentStore from '@/lib/payment-store';

const PAYMENT_API_URL = 'https://lucopay.onrender.com/api/v1/request_payment';
const IDENTITY_API_URL = 'https://lucopay.onrender.com/identity/msisdn';


export async function verifyIdentity(
  phone: string
): Promise<{ success: boolean; identityName?: string; error?: string }> {
  
  const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

  try {
    const response = await fetch(IDENTITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({ msisdn: formattedPhone }),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, identityName: data.identityname };
    } else {
      return { success: false, error: data.message || 'Failed to verify phone number.' };
    }
  } catch (error) {
    console.error('Identity verification error:', error);
    return { success: false, error: 'Could not connect to identity service.' };
  }
}


export async function requestPayment(
  phone: string,
  amount: number,
  reference?: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  const ourReference = reference || `FS-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
  
  paymentStore.set(ourReference, { status: 'pending' });

  const payload = {
    amount: amount.toString(),
    number: phone.startsWith('+') ? phone.substring(1) : phone,
    refer: ourReference,
  };

  try {
    const response = await fetch(PAYMENT_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(payload),
    });
    
    const responseBody = await response.json().catch(() => ({}));
    
    if (!response.ok || responseBody.success === false) {
       const errorMessage = responseBody.error || responseBody.message || 'An unknown error occurred during payment initiation.';
       console.error('Payment request failed:', errorMessage, 'Payload:', payload, 'Response:', responseBody);
       paymentStore.set(ourReference, { status: 'failed', failureReason: `Payment initiation failed: ${errorMessage}` });
       return { success: false, error: `Payment initiation failed: ${errorMessage}`, transactionId: ourReference };
    }
    
    return { success: true, transactionId: ourReference };
  } catch (error) {
    console.error('Payment request error:', error);
    paymentStore.set(ourReference, { status: 'failed', failureReason: 'Failed to connect to payment service.' });
    return { success: false, error: 'Failed to connect to payment service.', transactionId: ourReference };
  }
}

export async function checkPaymentStatus(
  reference: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch('https://lucopay.onrender.com/api/v1/payment_webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({ reference }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `API returned status ${response.status}: ${errorText}` };
    }
    
    const data = await response.json();

    if (data.message === 'Transaction not found') {
        return { success: false, error: 'Transaction not found. Please check your reference.' };
    }
    
    // Update our own store with the fetched status
    const status = data.status?.toLowerCase();
    if (status === 'succeeded' || status === 'success') {
      paymentStore.set(reference, { status: 'success' });
    } else if (status === 'failed') {
      paymentStore.set(reference, { status: 'failed', failureReason: data.reason || 'Reason not provided' });
    } else {
      paymentStore.set(reference, { status: 'pending' });
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error checking payment status:', error);
    if (error instanceof Error) {
        return { success: false, error: `Failed to check status: ${error.message}` };
    }
    return { success: false, error: 'An unknown error occurred while checking status.' };
  }
}
