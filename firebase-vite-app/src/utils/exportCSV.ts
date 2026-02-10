/**
 * CSV Export Utility - FIXED: Better escaping, error handling
 */

import { ReportData } from '../types';

export const exportToCSV = (data: ReportData[]): void => {
  try {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['ID', 'Title', 'Description', 'Category', 'Status', 'Created At'];
    const csvRows = [headers.join(',')];

    data.forEach(item => {
      // FIX: Proper CSV escaping for all fields
      const escapeCSV = (value: string): string => {
        if (!value) return '""';
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const row = [
        escapeCSV(item.id),
        escapeCSV(item.title),
        escapeCSV(item.description),
        escapeCSV(item.category),
        escapeCSV(item.status),
        escapeCSV(item.createdAt)
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `data-report-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('CSV export error:', error);
    alert('Failed to export CSV. Please try again.');
    throw error;
  }
};
