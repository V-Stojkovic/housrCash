import express, { Request, Response } from 'express';
import pool from '../../../../DBHelpers';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = express.Router();

/**
 * GET /api/v0/settings
 * Get all settings
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM settings'
        );
        
        // Convert to key-value object
        const settings: Record<string, string> = {};
        rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        
        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch settings',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * GET /api/v0/settings/cashback-rate
 * Get the current cashback rate
 */
router.get('/cashback-rate', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT setting_value FROM settings WHERE setting_key = ?',
            ['cashback_rate']
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cashback rate not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                cashback_rate: parseFloat(rows[0].setting_value)
            }
        });
    } catch (error) {
        console.error('Error fetching cashback rate:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cashback rate',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * PUT /api/v0/settings/cashback-rate
 * Update the cashback rate
 */
router.put('/cashback-rate', async (req: Request, res: Response) => {
    try {
        const { cashback_rate } = req.body;
        
        if (cashback_rate === undefined || isNaN(cashback_rate)) {
            return res.status(400).json({
                success: false,
                message: 'Valid cashback_rate is required'
            });
        }
        
        // Validate range
        if (cashback_rate < 0 || cashback_rate > 100) {
            return res.status(400).json({
                success: false,
                message: 'Cashback rate must be between 0 and 100'
            });
        }
        
        await pool.query<ResultSetHeader>(
            `UPDATE settings SET setting_value = ? WHERE setting_key = ?`,
            [cashback_rate.toString(), 'cashback_rate']
        );
        
        res.status(200).json({
            success: true,
            message: 'Cashback rate updated successfully',
            data: {
                cashback_rate: parseFloat(cashback_rate)
            }
        });
    } catch (error) {
        console.error('Error updating cashback rate:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cashback rate',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
