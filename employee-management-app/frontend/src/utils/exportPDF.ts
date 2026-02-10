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

  doc.setFontSize(18);
  doc.text('Data Report', 14, 20);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

  autoTable(doc, {
    startY: 35,
    head: [['ID', 'Title', 'Description', 'Category', 'Status', 'Created', 'Created By']],
    body: data.map(item => [
      item.id,
      item.title,
      item.description,
      item.category,
      item.status,
      item.createdAt,
      item.createdBy
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [102, 126, 234] }
  });

  doc.save(`report_${Date.now()}.pdf`);
};
