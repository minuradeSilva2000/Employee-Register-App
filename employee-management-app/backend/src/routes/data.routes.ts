/**
 * Data CRUD Routes
 */

import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { dataItems, findDataItemById, generateId } from '../config/database.js';
import { CreateDataDTO, UpdateDataDTO, DataItem } from '../types/index.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/data
 * Get all data items
 */
router.get('/', (req: Request, res: Response): void => {
  try {
    res.status(200).json({
      success: true,
      data: dataItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch data'
    });
  }
});

/**
 * GET /api/data/:id
 * Get single data item
 */
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const item = findDataItemById(id);

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Data item not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch data item'
    });
  }
});

/**
 * POST /api/data
 * Create new data item
 */
router.post('/', (req: Request, res: Response): void => {
  try {
    const { title, description, category, status }: CreateDataDTO = req.body;

    // Validation
    if (!title || !description || !category || !status) {
      res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
      return;
    }

    const newItem: DataItem = {
      id: generateId(),
      title,
      description,
      category,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user?.email || 'unknown'
    };

    dataItems.push(newItem);

    res.status(201).json({
      success: true,
      message: 'Data created successfully',
      data: newItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create data'
    });
  }
});

/**
 * PUT /api/data/:id
 * Update data item
 */
router.put('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const updates: UpdateDataDTO = req.body;

    const itemIndex = dataItems.findIndex(item => item.id === id);

    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Data item not found'
      });
      return;
    }

    // Update item
    dataItems[itemIndex] = {
      ...dataItems[itemIndex],
      ...updates,
      updatedAt: new Date()
    };

    res.status(200).json({
      success: true,
      message: 'Data updated successfully',
      data: dataItems[itemIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update data'
    });
  }
});

/**
 * DELETE /api/data/:id
 * Delete data item
 */
router.delete('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const itemIndex = dataItems.findIndex(item => item.id === id);

    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Data item not found'
      });
      return;
    }

    dataItems.splice(itemIndex, 1);

    res.status(200).json({
      success: true,
      message: 'Data deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete data'
    });
  }
});

export default router;
