/**
 * In-Memory Database
 */

import bcrypt from 'bcryptjs';
import { User, DataItem } from '../types/index.js';

// Users database (in-memory)
export const users: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: await bcrypt.hash('Admin@123', 10),
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date()
  },
  {
    id: '2',
    email: 'user@example.com',
    password: await bcrypt.hash('User@123', 10),
    name: 'Regular User',
    role: 'user',
    createdAt: new Date()
  }
];

// Data items database (in-memory)
export const dataItems: DataItem[] = [
  {
    id: '1',
    title: 'Sample Data 1',
    description: 'This is a sample data entry',
    category: 'Technology',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin@example.com'
  },
  {
    id: '2',
    title: 'Sample Data 2',
    description: 'Another sample entry',
    category: 'Business',
    status: 'inactive',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin@example.com'
  }
];

// Helper functions
export const findUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

export const findUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const findDataItemById = (id: string): DataItem | undefined => {
  return dataItems.find(item => item.id === id);
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};
