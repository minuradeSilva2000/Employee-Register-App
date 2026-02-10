/**
 * In-Memory Database
 * 
 * CRITICAL FIX: Pre-hashed passwords to avoid top-level await issues
 * Passwords are hashed using bcrypt with salt rounds = 10
 */

import bcrypt from 'bcryptjs';
import { User, DataItem } from '../types/index.js';

// Pre-hashed passwords (bcrypt with 10 salt rounds)
// Admin@123 -> $2a$10$...
// User@123 -> $2a$10$...
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('Admin@123', 10);
const USER_PASSWORD_HASH = bcrypt.hashSync('User@123', 10);

// Users database (in-memory)
export const users: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: ADMIN_PASSWORD_HASH,
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date()
  },
  {
    id: '2',
    email: 'user@example.com',
    password: USER_PASSWORD_HASH,
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
