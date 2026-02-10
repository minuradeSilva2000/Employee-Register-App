/**
 * Reports Routes
 */

import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { dataItems } from '../config/database.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/reports/csv
 * Generate CSV report
 */
router.get('/csv', (req: Request, res: Response): void => {
  try {
    // CSV headers
    const headers = ['ID', 'Title', 'Description', 'Category', 'Status', 'Created At', 'Created By'];
    const csvRows = [headers.join(',')];

    // Add data rows
    dataItems.forEach(item => {
      const row = [
        item.id,
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.description.replace(/"/g, '""')}"`,
        item.category,
        item.status,
        item.createdAt.toISOString(),
        item.createdBy
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate CSV report'
    });
  }
});

/**
 * GET /api/reports/json
 * Get report data as JSON (for PDF generation on frontend)
 */
router.get('/json', (req: Request, res: Response): void => {
  try {
    const reportData = dataItems.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      status: item.status,
      createdAt: item.createdAt.toLocaleDateString(),
      createdBy: item.createdBy
    }));

    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate report data'
    });
  }
});

export default router;
