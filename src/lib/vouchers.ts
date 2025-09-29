
import { collection, getDocs, getDoc, query, orderBy, addDoc, doc, deleteDoc, updateDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Voucher, VoucherCategoryName, VoucherProfile, NewVoucherProfileData } from '@/types';

type NewVoucherData = Omit<Voucher, 'id'>;

export async function addVoucher(voucherData: NewVoucherData): Promise<void> {
  await addDoc(collection(db, 'vouchers'), {
    ...voucherData,
    createdAt: Timestamp.now(),
  });
}

export async function batchAddVouchers(vouchersData: NewVoucherData[]): Promise<void> {
  const batch = writeBatch(db);
  const vouchersRef = collection(db, 'vouchers');

  vouchersData.forEach(voucher => {
    const docRef = doc(vouchersRef);
    batch.set(docRef, {
      ...voucher,
      createdAt: Timestamp.now(),
    });
  });

  await batch.commit();
}


export async function getVouchers(): Promise<Voucher[]> {
  const vouchersRef = collection(db, 'vouchers');
  const q = query(vouchersRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  const vouchers: Voucher[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    vouchers.push({
      id: doc.id,
      title: data.title,
      description: data.description,
      category: data.category as VoucherCategoryName,
      price: data.price,
      discount: data.discount,
      expiryDate: data.expiryDate,
      code: data.code,
      isNew: data.isNew || false,
    });
  });

  return vouchers;
}

export async function getVoucherById(id: string): Promise<Voucher | undefined> {
  const voucherRef = doc(db, 'vouchers', id);
  const docSnap = await getDoc(voucherRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title,
      description: data.description,
      category: data.category as VoucherCategoryName,
      price: data.price,
      discount: data.discount,
      expiryDate: data.expiryDate,
      code: data.code,
      isNew: data.isNew || false,
    }
  } else {
    return undefined;
  }
}

export async function updateVoucher(id: string, data: Partial<NewVoucherData>): Promise<void> {
  const voucherRef = doc(db, 'vouchers', id);
  await updateDoc(voucherRef, data);
}

export async function deleteVoucher(id: string): Promise<void> {
  const voucherRef = doc(db, 'vouchers', id);
  await deleteDoc(voucherRef);
}


// Voucher Profiles
export async function addVoucherProfile(profileData: NewVoucherProfileData): Promise<void> {
  await addDoc(collection(db, 'voucherProfiles'), {
    ...profileData,
    createdAt: Timestamp.now(),
  });
}

export async function getVoucherProfiles(): Promise<VoucherProfile[]> {
  const profilesRef = collection(db, 'voucherProfiles');
  const q = query(profilesRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  const profiles: VoucherProfile[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    profiles.push({
      id: doc.id,
      name: data.name,
      title: data.title,
      description: data.description,
      category: data.category as VoucherCategoryName,
      price: data.price,
      discount: data.discount,
    });
  });

  return profiles;
}

export async function updateVoucherProfile(id: string, data: Partial<NewVoucherProfileData>): Promise<void> {
  const profileRef = doc(db, 'voucherProfiles', id);
  await updateDoc(profileRef, data);
}

export async function deleteVoucherProfile(id: string): Promise<void> {
  const profileRef = doc(db, 'voucherProfiles', id);
  await deleteDoc(profileRef);
}
