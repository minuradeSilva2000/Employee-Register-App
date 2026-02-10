/**
 * Report Service
 */

import api from './api';
import { ReportData } from '../types';
import { exportToCSV } from '../utils/exportCSV';
import { exportToPDF } from '../utils/exportPDF';

export const reportService = {
  /**
   * Get report data
   */
  getReportData: async (): Promise<ReportData[]> => {
    const response: any = await api.get('/reports/json');
    return response.data;
  },

  /**
   * Download CSV report from backend
   */
  downloadCSV: async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:5000/api/reports/csv', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_${Date.now()}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download CSV:', error);
      throw error;
    }
  },

  /**
   * Generate PDF report (frontend)
   */
  generatePDF: async (): Promise<void> => {
    const data = await reportService.getReportData();
    exportToPDF(data);
  },

  /**
   * Generate CSV report (frontend)
   */
  generateCSV: async (): Promise<void> => {
    const data = await reportService.getReportData();
    exportToCSV(data);
  }
};
