
import { collection, getDocs, getDoc, query, orderBy, addDoc, doc, deleteDoc, updateDoc, Timestamp, writeBatch, where } from 'firebase/firestore';
import { db } from './firebase';
import type { Voucher, VoucherCategoryName, VoucherProfile, NewVoucherProfileData } from '@/types';

type NewVoucherData = Omit<Voucher, 'id' | 'status' | 'purchasedBy' | 'purchasedAt'>;

export async function addVoucher(voucherData: NewVoucherData): Promise<void> {
  await addDoc(collection(db, 'vouchers'), {
    ...voucherData,
    status: 'active', // Default status
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
      status: 'active',
      createdAt: Timestamp.now(),
    });
  });

  await batch.commit();
}


export async function getVouchers(includeInactive = false): Promise<Voucher[]> {
  const vouchersRef = collection(db, 'vouchers');
  // Firestore composite queries require an index. To avoid this, we'll query and then filter in code.
  // The query was: query(vouchersRef, where('status', '==', 'active'), orderBy('createdAt', 'desc'))
  // It required a composite index on 'status' and 'createdAt'.
  const q = query(vouchersRef, orderBy('createdAt', 'desc'));
  
  const querySnapshot = await getDocs(q);
  
  const vouchers: Voucher[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    let status = data.status || 'active';
    
    // Convert Firestore Timestamp to Date if necessary, then to string for comparison
    const expiryDateStr = data.expiryDate;
    try {
      const expiryDate = new Date(expiryDateStr);
      if (status === 'active' && expiryDate < new Date()) {
        status = 'expired';
      }
    } catch (e) {
      // Ignore invalid date strings
    }
    
    // If we are not including inactive, and the status has been determined as expired, skip it.
    if (!includeInactive && status !== 'active') {
        return;
    }

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
      status: status,
      purchasedBy: data.purchasedBy,
      purchasedAt: data.purchasedAt?.toDate(),
    });
  });

  return vouchers;
}

export async function getVoucherById(id: string): Promise<Voucher | undefined> {
  const voucherRef = doc(db, 'vouchers', id);
  const docSnap = await getDoc(voucherRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
     let status = data.status || 'active';
    try {
        const expiryDate = new Date(data.expiryDate);
        if (status === 'active' && expiryDate < new Date()) {
          status = 'expired';
        }
    } catch(e) {
        // Ignore invalid date strings
    }
    
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
      status: status,
      purchasedBy: data.purchasedBy,
      purchasedAt: data.purchasedAt?.toDate(),
    }
  } else {
    return undefined;
  }
}

export async function updateVoucher(id: string, data: Partial<NewVoucherData & { status?: string, purchasedBy?: string, purchasedAt?: Timestamp }>): Promise<void> {
  const voucherRef = doc(db, 'vouchers', id);
  await updateDoc(voucherRef, data);
}

export async function deleteVoucher(id: string): Promise<void> {
  const voucherRef = doc(db, 'vouchers', id);
  await deleteDoc(voucherRef);
}

export async function batchDeleteVouchers(voucherIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  voucherIds.forEach(id => {
    const voucherRef = doc(db, 'vouchers', id);
    batch.delete(voucherRef);
  });
  await batch.commit();
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
