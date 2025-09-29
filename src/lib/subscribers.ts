
import { collection, getDocs, query, orderBy, addDoc, where, Timestamp, limit } from 'firebase/firestore';
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
