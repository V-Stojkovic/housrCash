import { Router } from 'express';
import pool from '../../../../DBHelpers';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const redeemRouter = Router();

// Get redemption history for a user
redeemRouter.get("/history/:user_id", async (req, res) => {
    const { user_id } = req.params;
    const { start, end } = req.query;

    try {
        // Build the query with optional date filters
        let query = `
            SELECT 
                rr.id,
                rr.userId,
                rr.rewardId,
                rr.timestamp,
                r.title,
                r.description,
                r.cost
            FROM redeemed_rewards rr
            JOIN reward r ON rr.rewardId = r.id
            WHERE rr.userId = ?
        `;
        
        const params: any[] = [user_id];

        // Add date range filters if provided
        if (start) {
            query += ' AND rr.timestamp >= ?';
            params.push(start);
        }

        if (end) {
            query += ' AND rr.timestamp <= ?';
            params.push(end);
        }

        query += ' ORDER BY rr.timestamp DESC';

        const [rows] = await pool.query<RowDataPacket[]>(query, params);

        res.status(200).json({
            success: true,
            data: {
                userId: user_id,
                count: rows.length,
                redemptions: rows.map(row => ({
                    id: row.id,
                    rewardId: row.rewardId,
                    timestamp: row.timestamp,
                    reward: {
                        title: row.title,
                        description: row.description,
                        cost: row.cost,
                    }
                }))
            }
        });

    } catch (error) {
        console.error('Error fetching redemption history:', error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching redemption history"
        });
    }
});

// Redeem a reward
redeemRouter.get("/:user_id/:reward_id", async (req, res) => {
    const { user_id, reward_id } = req.params;

    try {
        // 1. Get user's current balance
        const [userRows] = await pool.query<RowDataPacket[]>(
            'SELECT id, balance FROM user WHERE id = ?',
            [user_id]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        const user = userRows[0];
        const userBalance = parseFloat(user.balance);

        // 2. Get reward details and check if it's active
        const [rewardRows] = await pool.query<RowDataPacket[]>(
            'SELECT id, title, cost, is_active FROM reward WHERE id = ?',
            [reward_id]
        );

        if (rewardRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Reward not found" 
            });
        }

        const reward = rewardRows[0];
        const rewardCost = parseInt(reward.cost);

        // 3. Check if reward is active
        if (!reward.is_active) {
            return res.status(400).json({ 
                success: false, 
                message: "This reward is no longer available" 
            });
        }

        // 4. Check if user has sufficient balance
        if (userBalance < rewardCost) {
            return res.status(400).json({ 
                success: false, 
                message: "Insufficient points",
                error: "INSUFFICIENT_POINTS",
                required: rewardCost,
                current: userBalance,
                shortfall: rewardCost - userBalance
            });
        }

        // 5. Process the redemption
        // Start a transaction
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // Deduct points from user balance
            await connection.query(
                'UPDATE user SET balance = balance - ? WHERE id = ?',
                [rewardCost, user_id]
            );

            // Record the redemption
            await connection.query(
                'INSERT INTO redeemed_rewards (userId, rewardId) VALUES (?, ?)',
                [user_id, reward_id]
            );

            // Increment redemption count on reward
            await connection.query(
                'UPDATE reward SET redemptions = redemptions + 1 WHERE id = ?',
                [reward_id]
            );

            await connection.commit();
            connection.release();

            // Return success with updated balance
            const newBalance = userBalance - rewardCost;

            res.status(200).json({ 
                success: true, 
                message: "Reward redeemed successfully!",
                data: {
                    reward: {
                        id: reward.id,
                        title: reward.title,
                        cost: rewardCost
                    },
                    previousBalance: userBalance,
                    newBalance: newBalance
                }
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Error redeeming reward:', error);
        res.status(500).json({ 
            success: false, 
            message: "An error occurred while redeeming the reward" 
        });
    }
});

export default redeemRouter;