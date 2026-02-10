/**
 * CSV Export Utility
 */

import { ReportData } from '../types';

export const exportToCSV = (data: ReportData[]): void => {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create CSV header
  const headers = ['ID', 'Title', 'Description', 'Category', 'Status', 'Created At'];
  const csvRows = [headers.join(',')];

  // Add data rows
  data.forEach(item => {
    const row = [
      item.id,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.description.replace(/"/g, '""')}"`,
      item.category,
      item.status,
      item.createdAt
    ];
    csvRows.push(row.join(','));
  });

  // Create blob and download
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `report_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
