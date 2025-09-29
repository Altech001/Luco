

import { collection, getDocs, query, orderBy, addDoc, where, Timestamp, limit, doc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Subscriber } from '@/types';

export async function addSubscriber(phone: string): Promise<void> {
  // Check if subscriber already exists
  const subscribersRef = collection(db, 'subscribers');
  const q = query(subscribersRef, where('phone', '==', phone), limit(1));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error('This phone number is already subscribed.');
  }

  // Add new subscriber
  await addDoc(collection(db, 'subscribers'), {
    phone: phone,
    subscribedAt: Timestamp.now(),
  });
}


export async function getSubscribers(): Promise<Subscriber[]> {
  const subscribersRef = collection(db, 'subscribers');
  const q = query(subscribersRef, orderBy('subscribedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  const subscribers: Subscriber[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    subscribers.push({
      id: doc.id,
      phone: data.phone,
      subscribedAt: data.subscribedAt.toDate(),
    });
  });

  return subscribers;
}

export async function updateSubscriber(id: string, phone: string): Promise<void> {
  const subscriberRef = doc(db, 'subscribers', id);
  await updateDoc(subscriberRef, { phone });
}

export async function deleteSubscriber(id: string): Promise<void> {
  const subscriberRef = doc(db, 'subscribers', id);
  await deleteDoc(subscriberRef);
}

export async function batchDeleteSubscribers(subscriberIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  subscriberIds.forEach(id => {
    const subscriberRef = doc(db, 'subscribers', id);
    batch.delete(subscriberRef);
  });
  await batch.commit();
}

/**
 * Placeholder function to simulate sending a bulk SMS.
 * In a real application, this would integrate with an SMS gateway API.
 */
export async function sendSms(phoneNumbers: string[], message: string): Promise<void> {
  console.log(`Simulating sending SMS to ${phoneNumbers.length} numbers.`);
  console.log(`Message: "${message}"`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log('SMS sent successfully (simulation).');
}
    
