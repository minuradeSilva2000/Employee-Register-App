/**
 * Firestore Data Service
 * CRUD operations for data collection
 */

import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { DataItem, DataFormData } from '../types';

const DATA_COLLECTION = 'data';

/**
 * Create new data entry
 */
export const createData = async (formData: DataFormData): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const dataItem: Omit<DataItem, 'id'> = {
    ...formData,
    status: formData.status as 'active' | 'inactive',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: user.email || 'unknown'
  };

  const docRef = await addDoc(collection(db, DATA_COLLECTION), dataItem);
  return docRef.id;
};

/**
 * Get all data entries
 */
export const getAllData = async (): Promise<DataItem[]> => {
  const querySnapshot = await getDocs(collection(db, DATA_COLLECTION));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as DataItem));
};

/**
 * Update data entry
 */
export const updateData = async (id: string, updates: Partial<DataItem>): Promise<void> => {
  const docRef = doc(db, DATA_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

/**
 * Delete data entry
 */
export const deleteData = async (id: string): Promise<void> => {
  const docRef = doc(db, DATA_COLLECTION, id);
  await deleteDoc(docRef);
};
