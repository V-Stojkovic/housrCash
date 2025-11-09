import pool from '../../../../DBHelpers';
import { Router, Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

// GET /api/v0/reward/
// Cursor-based pagination using `cursor` (last seen reward id) and `limit`.
// Example: /api/v0/reward?limit=20&cursor=123
router.get('/', async (req, res) => {
  try {
    // parse query params
    const rawLimit = Number(req.query.limit ?? 20);
    const limit = Number.isFinite(rawLimit) ? Math.min(50, Math.max(1, rawLimit)) : 20; // clamp 1..50
    const cursor = req.query.cursor ? Number(req.query.cursor) : null;

    let sql: string;
    let params: Array<number> = [];

    if (cursor) {
      // return rows with id > cursor
      sql = 'SELECT * FROM reward WHERE id > ? ORDER BY id ASC LIMIT ?';
      params = [cursor, limit];
    } else {
      sql = 'SELECT * FROM reward ORDER BY id ASC LIMIT ?';
      params = [limit];
    }

    const [rows] = await pool.query(sql, params);

    // compute nextCursor: if we returned `limit` rows, there may be more
    let nextCursor = null;
    // @ts-ignore - rows typing from mysql2 is loose here
    if (Array.isArray(rows) && rows.length === limit) {
      // @ts-ignore
      nextCursor = rows[rows.length - 1].id ?? null;
    }

    return res.status(200).json({ success: true, rewards: rows, nextCursor });
  } catch (err) {
    console.error('Error fetching rewards:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch rewards' });
  }
});




/**
 * GET /api/v0/reward/:id
 * Get a specific reward by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM reward WHERE id = ?',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reward not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching reward:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reward',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * POST /api/v0/reward
 * Create a new reward
 */
router.post('/', async (req: Request, res: Response) => {
    console.log('=== POST /api/v0/reward - START ===');
    console.log('Request body:', req.body);
    
    try {
        const { title, description, points_required, image_url, is_active } = req.body;
        
        console.log('Extracted fields:', {
            title,
            description,
            points_required,
            image_url,
            is_active
        });
        
        // Validation
        if (!title || !points_required) {
            console.log('Validation failed - missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Title and points_required are required'
            });
        }
        
        const queryParams = [
            title, 
            description || null, 
            points_required, 
            image_url || null, 
            is_active !== undefined ? is_active : true
        ];
        
        console.log('Executing INSERT with params:', queryParams);
        
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO reward (title, description, points_required, image_url, is_active)
             VALUES (?, ?, ?, ?, ?)`,
            queryParams
        );
        
        console.log('INSERT successful, insertId:', result.insertId);
        
        // Fetch the newly created reward
        console.log('Fetching newly created reward...');
        const [newReward] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM reward WHERE id = ?',
            [result.insertId]
        );
        
        console.log('Newly created reward:', newReward[0]);
        
        res.status(201).json({
            success: true,
            message: 'Reward created successfully',
            data: newReward[0]
        });
        
        console.log('=== POST /api/v0/reward - SUCCESS ===');
    } catch (error) {
        console.error('=== POST /api/v0/reward - ERROR ===');
        console.error('Error creating reward:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create reward',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * PUT /api/v0/reward/:id
 * Update an existing reward (including activate/deactivate)
 */
router.put('/:id', async (req: Request, res: Response) => {
    console.log('=== PUT /api/v0/reward/:id - START ===');
    console.log('Reward ID:', req.params.id);
    console.log('Request body:', req.body);
    
    try {
        const { id } = req.params;
        const { title, description, points_required, image_url, is_active } = req.body;
        
        // Check if reward exists
        console.log('Checking if reward exists...');
        const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM reward WHERE id = ?',
            [id]
        );
        
        if (existing.length === 0) {
            console.log('Reward not found with id:', id);
            return res.status(404).json({
                success: false,
                message: 'Reward not found'
            });
        }
        
        console.log('Existing reward:', existing[0]);
        
        // Build dynamic update query
        const updates: string[] = [];
        const values: any[] = [];
        
        if (title !== undefined) {
            updates.push('title = ?');
            values.push(title);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (points_required !== undefined) {
            updates.push('points_required = ?');
            values.push(points_required);
        }
        if (image_url !== undefined) {
            updates.push('image_url = ?');
            values.push(image_url);
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(is_active);
        }
        
        console.log('Fields to update:', updates);
        console.log('Update values:', values);
        
        if (updates.length === 0) {
            console.log('No fields to update');
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }
        
        values.push(id);
        
        const updateQuery = `UPDATE reward SET ${updates.join(', ')} WHERE id = ?`;
        console.log('Executing UPDATE query:', updateQuery);
        
        await pool.query(updateQuery, values);
        
        console.log('UPDATE successful, fetching updated reward...');
        
        // Fetch updated reward
        const [updated] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM reward WHERE id = ?',
            [id]
        );
        
        console.log('Updated reward:', updated[0]);
        
        res.status(200).json({
            success: true,
            message: 'Reward updated successfully',
            data: updated[0]
        });
        
        console.log('=== PUT /api/v0/reward/:id - SUCCESS ===');
    } catch (error) {
        console.error('=== PUT /api/v0/reward/:id - ERROR ===');
        console.error('Error updating reward:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update reward',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
