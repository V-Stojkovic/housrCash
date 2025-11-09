import { Router } from 'express';
import pool from '../../../../DBHelpers';

const rewardRouter = Router();

// GET /api/v0/reward/
// Cursor-based pagination using `cursor` (last seen reward id) and `limit`.
// Example: /api/v0/reward?limit=20&cursor=123
rewardRouter.get('/', async (req, res) => {
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

export default rewardRouter;
