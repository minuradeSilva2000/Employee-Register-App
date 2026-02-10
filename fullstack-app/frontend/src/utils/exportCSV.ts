/**
 * CSV Export Utility
 */

import { ReportData } from '../types';

export const exportToCSV = (data: ReportData[]): void => {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = ['ID', 'Title', 'Description', 'Category', 'Status', 'Created At', 'Created By'];
  const csvRows = [headers.join(',')];

  data.forEach(item => {
    const row = [
      item.id,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.description.replace(/"/g, '""')}"`,
      item.category,
      item.status,
      item.createdAt,
      item.createdBy
    ];
    csvRows.push(row.join(','));
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `report_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
