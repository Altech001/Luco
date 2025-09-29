
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { Banner } from '@/types';

export async function getBanners(): Promise<Banner[]> {
  const bannersRef = collection(db, 'banners');
  const q = query(bannersRef, orderBy('createdAt', 'desc'), limit(5));
  const querySnapshot = await getDocs(q);
  
  const banners: Banner[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    banners.push({
      id: doc.id,
      imageUrl: data.imageUrl,
      description: data.description,
      imageHint: data.imageHint,
    });
  });

  return banners;
}
