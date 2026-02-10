/**
 * PDF Export Utility - FIXED: Error handling, better formatting
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData } from '../types';

export const exportToPDF = (data: ReportData[]): void => {
  try {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Data Report', 14, 20);

    // Metadata
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Records: ${data.length}`, 14, 34);

    // Table
    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Title', 'Description', 'Category', 'Status', 'Created']],
      body: data.map(item => [
        item.id.substring(0, 8) + '...', // Truncate ID for space
        item.title.length > 30 ? item.title.substring(0, 27) + '...' : item.title,
        item.description.length > 40 ? item.description.substring(0, 37) + '...' : item.description,
        item.category,
        item.status,
        item.createdAt
      ]),
      styles: { 
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: { 
        fillColor: [102, 126, 234],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 40 }
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    doc.save(`data-report-${timestamp}.pdf`);
  } catch (error) {
    console.error('PDF export error:', error);
    alert('Failed to export PDF. Please try again.');
    throw error;
  }
};
