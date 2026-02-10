/**
 * Report Generation Service - FIXED: Timestamp handling
 */

import { DataItem, ReportData } from '../types';
import { exportToCSV } from '../utils/exportCSV';
import { exportToPDF } from '../utils/exportPDF';

const formatDate = (dateValue: any): string => {
  try {
    if (!dateValue) return 'N/A';
    
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString();
    }
    
    // Firestore Timestamp
    if (dateValue.seconds) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString();
    }
    
    // String date
    if (typeof dateValue === 'string') {
      return new Date(dateValue).toLocaleDateString();
    }
    
    return 'N/A';
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export const generateReport = (data: DataItem[], format: 'csv' | 'pdf'): void => {
  try {
    const reportData: ReportData[] = data.map(item => ({
      id: item.id || 'N/A',
      title: item.title || '',
      description: item.description || '',
      category: item.category || '',
      status: item.status || 'inactive',
      createdAt: formatDate(item.createdAt)
    }));

    if (format === 'csv') {
      exportToCSV(reportData);
    } else {
      exportToPDF(reportData);
    }
  } catch (error) {
    console.error('Report generation error:', error);
    throw new Error('Failed to generate report');
  }
};
