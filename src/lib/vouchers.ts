
import { collection, getDocs, getDoc, query, orderBy, addDoc, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Voucher, VoucherCategoryName } from '@/types';

type NewVoucherData = Omit<Voucher, 'id'>;

export async function addVoucher(voucherData: NewVoucherData): Promise<void> {
  await addDoc(collection(db, 'vouchers'), {
    ...voucherData,
    createdAt: Timestamp.now(),
  });
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
