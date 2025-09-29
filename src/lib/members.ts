
import { collection, getDocs, query, orderBy, addDoc, where, Timestamp, limit, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Member, NewMember } from '@/types';

// This is a simplified approach. In a real application, you would have a more secure way
// to manage admin credentials, likely in a separate 'admins' collection.
export async function getAdminCredentials(): Promise<{username: string, password?: string} | null> {
  const q = query(collection(db, "admins"), limit(1));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }
  
  const adminDoc = querySnapshot.docs[0];
  const adminData = adminDoc.data();
  return {
    username: adminData.username,
    password: adminData.password
  };
}

export async function addMember(memberData: NewMember): Promise<void> {
  const membersRef = collection(db, 'members');
  
  // Check if username or phone already exists
  const usernameQuery = query(membersRef, where('username', '==', memberData.username), limit(1));
  const phoneQuery = query(membersRef, where('phone', '==', memberData.phone), limit(1));
  
  const usernameSnapshot = await getDocs(usernameQuery);
  if (!usernameSnapshot.empty) {
    throw new Error('This username is already taken.');
  }

  const phoneSnapshot = await getDocs(phoneQuery);
  if (!phoneSnapshot.empty) {
    throw new Error('This phone number is already registered.');
  }

  await addDoc(collection(db, 'members'), {
    ...memberData,
    joinedAt: Timestamp.now(),
  });
}

export async function getMembers(): Promise<Member[]> {
  const membersRef = collection(db, 'members');
  const q = query(membersRef, orderBy('joinedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  const members: Member[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    members.push({
      id: doc.id,
      username: data.username,
      phone: data.phone,
      password: data.password,
      subscriptionAmount: data.subscriptionAmount,
      joinedAt: data.joinedAt.toDate(),
    });
  });

  return members;
}

export async function getMemberByPhone(phone: string): Promise<Member | null> {
    const membersRef = collection(db, 'members');
    const q = query(membersRef, where('phone', '==', phone), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
        id: doc.id,
        username: data.username,
        phone: data.phone,
        password: data.password,
        subscriptionAmount: data.subscriptionAmount,
        joinedAt: data.joinedAt.toDate(),
    };
}


export async function updateMember(id: string, data: Partial<Member>): Promise<void> {
  const memberRef = doc(db, 'members', id);
  const updateData = { ...data };

  // If the password is an empty string, don't update it
  if (updateData.password === '') {
    delete updateData.password;
  }
  
  await updateDoc(memberRef, updateData);
}

export async function deleteMember(id: string): Promise<void> {
  const memberRef = doc(db, 'members', id);
  await deleteDoc(memberRef);
}
