/**
 * Data CRUD Service
 */

import api from './api';
import { DataItem, DataFormData } from '../types';

export const dataService = {
  /**
   * Get all data items
   */
  getAll: async (): Promise<DataItem[]> => {
    const response: any = await api.get('/data');
    return response.data;
  },

  /**
   * Get single data item
   */
  getById: async (id: string): Promise<DataItem> => {
    const response: any = await api.get(`/data/${id}`);
    return response.data;
  },

  /**
   * Create new data item
   */
  create: async (data: DataFormData): Promise<DataItem> => {
    const response: any = await api.post('/data', data);
    return response.data;
  },

  /**
   * Update data item
   */
  update: async (id: string, data: Partial<DataFormData>): Promise<DataItem> => {
    const response: any = await api.put(`/data/${id}`, data);
    return response.data;
  },

  /**
   * Delete data item
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/data/${id}`);
  }
};
