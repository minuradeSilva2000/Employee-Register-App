/**
 * Report Generation Service
 * CSV and PDF export functionality
 */

import { DataItem, ReportData } from '../types';
import { exportToCSV } from '../utils/exportCSV';
import { exportToPDF } from '../utils/exportPDF';

/**
 * Generate report in specified format
 */
export const generateReport = (data: DataItem[], format: 'csv' | 'pdf'): void => {
  const reportData: ReportData[] = data.map(item => ({
    id: item.id || '',
    title: item.title,
    description: item.description,
    category: item.category,
    status: item.status,
    createdAt: item.createdAt instanceof Date 
      ? item.createdAt.toLocaleDateString()
      : new Date(item.createdAt.seconds * 1000).toLocaleDateString()
  }));

  if (format === 'csv') {
    exportToCSV(reportData);
  } else {
    exportToPDF(reportData);
  }
};
