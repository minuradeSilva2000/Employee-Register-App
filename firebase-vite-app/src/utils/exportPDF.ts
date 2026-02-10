/**
 * PDF Export Utility
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData } from '../types';

export const exportToPDF = (data: ReportData[]): void => {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text('Data Report', 14, 20);

  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

  // Add table
  autoTable(doc, {
    startY: 35,
    head: [['ID', 'Title', 'Description', 'Category', 'Status', 'Created']],
    body: data.map(item => [
      item.id,
      item.title,
      item.description,
      item.category,
      item.status,
      item.createdAt
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [102, 126, 234] }
  });

  // Save PDF
  doc.save(`report_${new Date().toISOString().split('T')[0]}.pdf`);
};
