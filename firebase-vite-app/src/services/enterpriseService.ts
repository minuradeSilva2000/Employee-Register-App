/**
 * Enterprise Service Layer - Business Logic
 */

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import {
  Contact,
  Lead,
  Deal,
  Employee,
  Department,
  LeaveRequest,
  Task,
  Activity,
} from '../types/enterprise';

// ============================================
// DASHBOARD SERVICES
// ============================================

export const dashboardService = {
  async getMetrics() {
    // Calculate metrics from various collections
    const [contactsSnap, leadsSnap, dealsSnap, employeesSnap] = await Promise.all([
      getDocs(collection(db, 'contacts')),
      getDocs(collection(db, 'leads')),
      getDocs(collection(db, 'deals')),
      getDocs(collection(db, 'employees')),
    ]);

    return {
      totalContacts: contactsSnap.size,
      totalLeads: leadsSnap.size,
      totalDeals: dealsSnap.size,
      totalEmployees: employeesSnap.size,
    };
  },

  async getActivities(limitCount: number = 10): Promise<Activity[]> {
    const q = query(
      collection(db, 'activities'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
  },

  async addActivity(activity: Omit<Activity, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'activities'), activity);
    return docRef.id;
  },
};

// ============================================
// CRM SERVICES
// ============================================

export const crmService = {
  // Contact Management
  async getContacts(): Promise<Contact[]> {
    const snapshot = await getDocs(collection(db, 'contacts'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
  },

  async getContact(id: string): Promise<Contact | null> {
    const docRef = doc(db, 'contacts', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Contact) : null;
  },

  async createContact(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const contact: Omit<Contact, 'id'> = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: user.uid,
    };

    const docRef = await addDoc(collection(db, 'contacts'), contact);
    return docRef.id;
  },

  async updateContact(id: string, data: Partial<Contact>): Promise<void> {
    const docRef = doc(db, 'contacts', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteContact(id: string): Promise<void> {
    await deleteDoc(doc(db, 'contacts', id));
  },

  // Lead Management
  async getLeads(): Promise<Lead[]> {
    const snapshot = await getDocs(collection(db, 'leads'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
  },

  async createLead(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const lead: Omit<Lead, 'id'> = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: user.uid,
    };

    const docRef = await addDoc(collection(db, 'leads'), lead);
    return docRef.id;
  },

  async updateLead(id: string, data: Partial<Lead>): Promise<void> {
    const docRef = doc(db, 'leads', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  // Deal Management
  async getDeals(): Promise<Deal[]> {
    const snapshot = await getDocs(collection(db, 'deals'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deal));
  },

  async createDeal(data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const deal: Omit<Deal, 'id'> = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: user.uid,
    };

    const docRef = await addDoc(collection(db, 'deals'), deal);
    return docRef.id;
  },

  // Task Management
  async getTasks(): Promise<Task[]> {
    const snapshot = await getDocs(collection(db, 'tasks'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  },

  async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const task: Omit<Task, 'id'> = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: user.uid,
    };

    const docRef = await addDoc(collection(db, 'tasks'), task);
    return docRef.id;
  },

  async updateTask(id: string, data: Partial<Task>): Promise<void> {
    const docRef = doc(db, 'tasks', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },
};

// ============================================
// EMPLOYEE SERVICES
// ============================================

export const employeeService = {
  async getEmployees(): Promise<Employee[]> {
    const snapshot = await getDocs(collection(db, 'employees'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
  },

  async getEmployee(id: string): Promise<Employee | null> {
    const docRef = doc(db, 'employees', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Employee) : null;
  },

  async createEmployee(data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const employee: Omit<Employee, 'id'> = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'employees'), employee);
    return docRef.id;
  },

  async updateEmployee(id: string, data: Partial<Employee>): Promise<void> {
    const docRef = doc(db, 'employees', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteEmployee(id: string): Promise<void> {
    await deleteDoc(doc(db, 'employees', id));
  },

  // Department Management
  async getDepartments(): Promise<Department[]> {
    const snapshot = await getDocs(collection(db, 'departments'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
  },

  async createDepartment(data: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const department: Omit<Department, 'id'> = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'departments'), department);
    return docRef.id;
  },

  // Leave Management
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    const snapshot = await getDocs(collection(db, 'leaveRequests'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest));
  },

  async createLeaveRequest(data: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const leaveRequest: Omit<LeaveRequest, 'id'> = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'leaveRequests'), leaveRequest);
    return docRef.id;
  },

  async updateLeaveRequest(id: string, data: Partial<LeaveRequest>): Promise<void> {
    const docRef = doc(db, 'leaveRequests', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },
};
