import { Request, Response, NextFunction } from 'express';
import pool from '../../../../DBHelpers';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// ============================================
// INVITE CODE HELPERS
// ============================================

// Simple encoding/decoding for invite codes
// Format: Base36 encoded number with checksum
function generateInviteCode(groupId: number): string {
    // Convert to base36 and add a simple checksum
    const base36 = groupId.toString(36).toUpperCase();
    const checksum = (groupId * 7 + 13) % 36;
    const checksumChar = checksum.toString(36).toUpperCase();
    return `GRP-${base36}${checksumChar}`;
}

function decodeInviteCode(inviteCode: string): number | null {
    // Remove GRP- prefix
    const code = inviteCode.replace(/^GRP-/i, '');
    
    if (code.length < 2) return null;
    
    // Extract checksum (last character) and base36 number
    const checksumChar = code.slice(-1);
    const base36 = code.slice(0, -1);
    
    // Decode base36 to number
    const groupId = parseInt(base36, 36);
    
    if (isNaN(groupId)) return null;
    
    // Verify checksum
    const expectedChecksum = (groupId * 7 + 13) % 36;
    const expectedChecksumChar = expectedChecksum.toString(36).toUpperCase();
    
    if (checksumChar !== expectedChecksumChar) return null;
    
    return groupId;
}

// ============================================
// GROUP MANAGEMENT
// ============================================

export const createGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { name, creatorUserId } = req.body;

    if (!name || !creatorUserId) {
        return res.status(400).json({ 
            success: false, 
            message: 'Group name and creator user ID are required' 
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Verify user exists first
        const [userCheck] = await connection.query<RowDataPacket[]>(
            'SELECT id FROM user WHERE id = ?',
            [creatorUserId]
        );

        if (userCheck.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create the group
        const [groupResult] = await connection.query<ResultSetHeader>(
            'INSERT INTO `groups` (name, balance) VALUES (?, 0.00)',
            [name]
        );

        const groupId = groupResult.insertId;

        // Add creator to the group
        const [updateResult] = await connection.query<ResultSetHeader>(
            'UPDATE user SET groupId = ? WHERE id = ?',
            [groupId, creatorUserId]
        );

        console.log(`Updated ${updateResult.affectedRows} user(s) with groupId ${groupId}`);

        await connection.commit();

        // Generate invite code
        const inviteCode = generateInviteCode(groupId);

        res.status(201).json({
            success: true,
            message: 'Group created successfully',
            data: {
                groupId,
                name,
                creatorId: creatorUserId,
                inviteCode
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating group:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create group' 
        });
    } finally {
        connection.release();
    }
};

export const joinGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { inviteCode, userId } = req.body;

    if (!inviteCode || !userId) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invite code and user ID are required' 
        });
    }

    // Decode invite code
    const groupId = decodeInviteCode(inviteCode);
    
    if (groupId === null) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid invite code' 
        });
    }

    try {
        // Check if group exists
        const [groupRows] = await pool.query<RowDataPacket[]>(
            'SELECT id, name FROM `groups` WHERE id = ?',
            [groupId]
        );

        if (groupRows.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid invite code - group not found' 
            });
        }

        // Check if user exists
        const [userRows] = await pool.query<RowDataPacket[]>(
            'SELECT id, groupId FROM user WHERE id = ?',
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        if (userRows[0].groupId) {
            return res.status(400).json({ 
                success: false, 
                message: 'User is already in a group. Leave current group first.' 
            });
        }

        // Add user to group
        await pool.query(
            'UPDATE user SET groupId = ? WHERE id = ?',
            [groupId, userId]
        );

        res.status(200).json({
            success: true,
            message: 'Successfully joined group',
            data: {
                groupId,
                groupName: groupRows[0].name,
                userId
            }
        });
    } catch (error) {
        console.error('Error joining group:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to join group' 
        });
    }
};

export const leaveGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
        // Check user's debt status
        const [userRows] = await pool.query<RowDataPacket[]>(
            'SELECT id, groupId, group_debt FROM user WHERE id = ?',
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        if (!userRows[0].groupId) {
            return res.status(400).json({ 
                success: false, 
                message: 'User is not in a group' 
            });
        }

        if (parseFloat(userRows[0].group_debt) > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot leave group with outstanding debt. Please settle your debts first.',
                debt: parseFloat(userRows[0].group_debt)
            });
        }

        // Remove user from group
        await pool.query(
            'UPDATE user SET groupId = NULL, group_spend = 0.00, group_debt = 0.00 WHERE id = ?',
            [userId]
        );

        res.status(200).json({
            success: true,
            message: 'Successfully left group'
        });
    } catch (error) {
        console.error('Error leaving group:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to leave group' 
        });
    }
};

export const deleteGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;

    try {
        // Check if group exists and get balance
        const [groupRows] = await pool.query<RowDataPacket[]>(
            'SELECT id, name, balance FROM `groups` WHERE id = ?',
            [groupId]
        );

        if (groupRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        const balance = parseFloat(groupRows[0].balance);

        if (balance !== 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete group with non-zero balance. All transactions must be closed.',
                currentBalance: balance
            });
        }

        // Delete group (CASCADE will handle group_transactions)
        await pool.query('DELETE FROM `groups` WHERE id = ?', [groupId]);

        res.status(200).json({
            success: true,
            message: 'Group deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete group' 
        });
    }
};

// ============================================
// TRANSACTION MANAGEMENT
// ============================================

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, groupId, amount, reference } = req.body;

    if (!userId || !groupId || !amount) {
        return res.status(400).json({ 
            success: false, 
            message: 'User ID, group ID, and amount are required' 
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Get all group members except the payer
        const [memberRows] = await connection.query<RowDataPacket[]>(
            'SELECT id FROM user WHERE groupId = ? AND id != ?',
            [groupId, userId]
        );

        if (memberRows.length === 0) {
            await connection.rollback();
            return res.status(400).json({ 
                success: false, 
                message: 'No other members in group to split with' 
            });
        }

        const numDebtors = memberRows.length;
        const amountPerPerson = parseFloat(amount) / numDebtors;

        // Create transaction
        const [transactionResult] = await connection.query<ResultSetHeader>(
            'INSERT INTO group_transaction (userId, groupId, amount, reference) VALUES (?, ?, ?, ?)',
            [userId, groupId, amount, reference || null]
        );

        // Update payer's group_spend
        await connection.query(
            'UPDATE user SET group_spend = group_spend + ? WHERE id = ?',
            [amount, userId]
        );

        // Update each debtor's group_debt
        for (const member of memberRows) {
            await connection.query(
                'UPDATE user SET group_debt = group_debt + ? WHERE id = ?',
                [amountPerPerson, member.id]
            );
        }

        // Update group balance
        await connection.query(
            'UPDATE `groups` SET balance = balance + ? WHERE id = ?',
            [amount, groupId]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            data: {
                transactionId: transactionResult.insertId,
                amount: parseFloat(amount),
                splitAmong: numDebtors,
                amountPerPerson: parseFloat(amountPerPerson.toFixed(2))
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating transaction:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create transaction' 
        });
    } finally {
        connection.release();
    }
};

export const closeTransaction = async (req: Request, res: Response, next: NextFunction) => {
    const { transactionId } = req.params;
    const { userId } = req.body; // User attempting to close

    if (!userId) {
        return res.status(400).json({ 
            success: false, 
            message: 'User ID is required' 
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Get transaction details
        const [transactionRows] = await connection.query<RowDataPacket[]>(
            'SELECT id, userId, groupId, amount FROM group_transaction WHERE id = ?',
            [transactionId]
        );

        if (transactionRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ 
                success: false, 
                message: 'Transaction not found' 
            });
        }

        const transaction = transactionRows[0];

        // Verify the requester is the transaction creator
        if (transaction.userId !== parseInt(userId)) {
            await connection.rollback();
            return res.status(403).json({ 
                success: false, 
                message: 'Only the transaction creator can close this transaction' 
            });
        }

        const amount = parseFloat(transaction.amount);
        const groupId = transaction.groupId;

        // Get all group members except the payer
        const [memberRows] = await connection.query<RowDataPacket[]>(
            'SELECT id FROM user WHERE groupId = ? AND id != ?',
            [groupId, transaction.userId]
        );

        const numDebtors = memberRows.length;
        const amountPerPerson = amount / numDebtors;

        // Update payer's group_spend (reduce)
        await connection.query(
            'UPDATE user SET group_spend = group_spend - ? WHERE id = ?',
            [amount, transaction.userId]
        );

        // Update each debtor's group_debt (reduce)
        for (const member of memberRows) {
            await connection.query(
                'UPDATE user SET group_debt = group_debt - ? WHERE id = ?',
                [amountPerPerson, member.id]
            );
        }

        // Update group balance (reduce)
        await connection.query(
            'UPDATE `groups` SET balance = balance - ? WHERE id = ?',
            [amount, groupId]
        );

        // Delete the transaction
        await connection.query(
            'DELETE FROM group_transaction WHERE id = ?',
            [transactionId]
        );

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Transaction closed successfully',
            data: {
                transactionId: parseInt(transactionId),
                amountSettled: amount
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error closing transaction:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to close transaction' 
        });
    } finally {
        connection.release();
    }
};

export const markTransactionPaid = async (req: Request, res: Response, next: NextFunction) => {
    const { transactionId } = req.params;
    const { userId, paid } = req.body; // paid is boolean

    if (!userId || paid === undefined) {
        return res.status(400).json({ 
            success: false, 
            message: 'User ID and paid status are required' 
        });
    }

    try {
        // Verify transaction exists and user is a debtor (not the creator)
        const [transactionRows] = await pool.query<RowDataPacket[]>(
            'SELECT id, userId, groupId FROM group_transaction WHERE id = ?',
            [transactionId]
        );

        if (transactionRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Transaction not found' 
            });
        }

        const transaction = transactionRows[0];

        // User shouldn't mark their own transaction as paid (they're the creditor)
        if (transaction.userId === parseInt(userId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'You cannot mark your own transaction as paid' 
            });
        }

        // Verify user is in the same group
        const [userRows] = await pool.query<RowDataPacket[]>(
            'SELECT groupId FROM user WHERE id = ?',
            [userId]
        );

        if (userRows.length === 0 || userRows[0].groupId !== transaction.groupId) {
            return res.status(403).json({ 
                success: false, 
                message: 'You are not a member of this group' 
            });
        }

        // Insert or update payment status
        if (paid) {
            await pool.query(
                `INSERT INTO group_payment_status (transactionId, userId, marked_paid, marked_at)
                 VALUES (?, ?, TRUE, NOW())
                 ON DUPLICATE KEY UPDATE marked_paid = TRUE, marked_at = NOW()`,
                [transactionId, userId]
            );
        } else {
            await pool.query(
                `INSERT INTO group_payment_status (transactionId, userId, marked_paid, marked_at)
                 VALUES (?, ?, FALSE, NULL)
                 ON DUPLICATE KEY UPDATE marked_paid = FALSE, marked_at = NULL`,
                [transactionId, userId]
            );
        }

        res.status(200).json({
            success: true,
            message: paid ? 'Marked as paid' : 'Unmarked as paid',
            data: {
                transactionId: parseInt(transactionId),
                userId: parseInt(userId),
                paid
            }
        });
    } catch (error) {
        console.error('Error marking transaction paid:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update payment status' 
        });
    }
};

// ============================================
// QUERY ENDPOINTS
// ============================================

export const getUserGroupDetails = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
        // Get user with group info
        const [userRows] = await pool.query<RowDataPacket[]>(
            `SELECT u.id, u.firstName, u.groupId, u.group_spend, u.group_debt,
                    g.name as groupName, g.balance as groupBalance
             FROM user u
             LEFT JOIN \`groups\` g ON u.groupId = g.id
             WHERE u.id = ?`,
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const user = userRows[0];

        if (!user.groupId) {
            return res.status(200).json({
                success: true,
                message: 'User is not in a group',
                data: null
            });
        }

        // Get all group members
        const [memberRows] = await pool.query<RowDataPacket[]>(
            `SELECT id, firstName, group_spend, group_debt
             FROM user
             WHERE groupId = ?`,
            [user.groupId]
        );

        res.status(200).json({
            success: true,
            data: {
                group: {
                    id: user.groupId,
                    name: user.groupName,
                    balance: parseFloat(user.groupBalance),
                    memberCount: memberRows.length
                },
                userStats: {
                    totalOwed: parseFloat(user.group_spend),
                    totalOwes: parseFloat(user.group_debt),
                    group_spend: parseFloat(user.group_spend),
                    group_debt: parseFloat(user.group_debt)
                },
                members: memberRows.map(m => ({
                    id: m.id,
                    firstName: m.firstName,
                    group_spend: parseFloat(m.group_spend),
                    group_debt: parseFloat(m.group_debt)
                }))
            }
        });
    } catch (error) {
        console.error('Error getting user group details:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get group details' 
        });
    }
};

export const getUserDebts = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
        // Get user's group
        const [userRows] = await pool.query<RowDataPacket[]>(
            'SELECT groupId, group_debt FROM user WHERE id = ?',
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        if (!userRows[0].groupId) {
            return res.status(200).json({
                success: true,
                data: { debts: [], totalOwed: 0 }
            });
        }

        const groupId = userRows[0].groupId;

        // Get all open transactions where this user is NOT the creator
        const [transactionRows] = await pool.query<RowDataPacket[]>(
            `SELECT gt.id, gt.userId, gt.amount, gt.reference, gt.timestamp,
                    u.firstName as creditorName,
                    gps.marked_paid, gps.marked_at
             FROM group_transaction gt
             LEFT JOIN user u ON gt.userId = u.id
             LEFT JOIN group_payment_status gps ON gt.id = gps.transactionId AND gps.userId = ?
             WHERE gt.groupId = ? AND (gt.userId != ? OR gt.userId IS NULL)`,
            [userId, groupId, userId]
        );

        // Calculate this user's share of each transaction
        const [memberCount] = await pool.query<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM user WHERE groupId = ?',
            [groupId]
        );

        const numMembers = memberCount[0].count;

        const debts = transactionRows.map(t => {
            const totalAmount = parseFloat(t.amount);
            const numDebtors = numMembers - 1; // Exclude the payer
            const userShare = totalAmount / numDebtors;

            return {
                transactionId: t.id,
                creditorId: t.userId,
                creditorName: t.creditorName || 'User Deleted',
                amount: parseFloat(userShare.toFixed(2)),
                reference: t.reference,
                timestamp: t.timestamp,
                markedPaid: t.marked_paid === 1 || t.marked_paid === true,
                markedAt: t.marked_at
            };
        });

        const totalOwed = debts.reduce((sum, debt) => sum + debt.amount, 0);

        res.status(200).json({
            success: true,
            data: {
                debts,
                totalOwed: parseFloat(totalOwed.toFixed(2))
            }
        });
    } catch (error) {
        console.error('Error getting user debts:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get debt breakdown' 
        });
    }
};

export const getUserCredits = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
        // Get user's group
        const [userRows] = await pool.query<RowDataPacket[]>(
            'SELECT groupId, group_spend FROM user WHERE id = ?',
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        if (!userRows[0].groupId) {
            return res.status(200).json({
                success: true,
                data: { credits: [], totalOwed: 0 }
            });
        }

        const groupId = userRows[0].groupId;

        // Get all transactions created by this user
        const [transactionRows] = await pool.query<RowDataPacket[]>(
            `SELECT gt.id, gt.amount, gt.reference, gt.timestamp
             FROM group_transaction gt
             WHERE gt.groupId = ? AND gt.userId = ?`,
            [groupId, userId]
        );

        // Get all group members except this user
        const [memberRows] = await pool.query<RowDataPacket[]>(
            `SELECT id, firstName FROM user WHERE groupId = ? AND id != ?`,
            [groupId, userId]
        );

        // For each transaction, calculate what each member owes
        const credits: any[] = [];

        for (const transaction of transactionRows) {
            const totalAmount = parseFloat(transaction.amount);
            const amountPerDebtor = totalAmount / memberRows.length;

            for (const member of memberRows) {
                credits.push({
                    transactionId: transaction.id,
                    debtorId: member.id,
                    debtorName: member.firstName,
                    amount: parseFloat(amountPerDebtor.toFixed(2)),
                    reference: transaction.reference,
                    timestamp: transaction.timestamp,
                    status: 'open'
                });
            }
        }

        const totalOwed = credits.reduce((sum, credit) => sum + credit.amount, 0);

        res.status(200).json({
            success: true,
            data: {
                credits,
                totalOwed: parseFloat(totalOwed.toFixed(2))
            }
        });
    } catch (error) {
        console.error('Error getting user credits:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get credit breakdown' 
        });
    }
};

export const getGroupTransactions = async (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    const { status } = req.query; // 'open', 'closed', 'all'

    try {
        // For now, we only have open transactions (closed ones are deleted)
        const [transactionRows] = await pool.query<RowDataPacket[]>(
            `SELECT gt.id, gt.userId, gt.amount, gt.reference, gt.timestamp,
                    u.firstName as userName
             FROM group_transaction gt
             LEFT JOIN user u ON gt.userId = u.id
             WHERE gt.groupId = ?
             ORDER BY gt.timestamp DESC`,
            [groupId]
        );

        const transactions = transactionRows.map(t => ({
            id: t.id,
            userId: t.userId,
            userName: t.userName || 'User Deleted',
            amount: parseFloat(t.amount),
            reference: t.reference,
            timestamp: t.timestamp,
            status: 'open'
        }));

        res.status(200).json({
            success: true,
            data: {
                groupId: parseInt(groupId),
                transactions
            }
        });
    } catch (error) {
        console.error('Error getting group transactions:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get group transactions' 
        });
    }
};
