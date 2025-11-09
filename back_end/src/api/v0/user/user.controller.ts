import { Request, Response, NextFunction } from 'express'
import { getId, getPasswordHash, createUser as dbCreateUser } from '../../../../DBHelpers/db_helpers';
import pool from '../../../../DBHelpers';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Just an example interface
interface CreateUserDTO {
    email: string;
    password: string;
    firstName: string;
    balance?: number
}

interface AuthenticateUserDTO{
    email: string;
    password_string: string;
}

export const createUser = async (req: Request<{}, {}, CreateUserDTO>, res: Response, next: NextFunction) => {
    try {
        const { email, password, firstName } = req.body;

        // Basic validation
        if (!email || !password || !firstName) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Generate salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Persist to DB using helper
        const newUserId = await dbCreateUser({
            email,
            firstName,
            password_hash,
        });

        // Issue JWT so client can authenticate immediately (stateless)
        const token = jwt.sign(
            { userId: newUserId, email },
            process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod',
            { expiresIn: '1h' }
        );

        // Set cookie for convenience (frontend can also read token from response)
        res.status(201)
        .cookie('auth-token', token, {
            httpOnly: false, // front-end currently reads token from response; consider true for production
            secure: process.env.NODE_ENV === 'production'
        })
        .json({
            success: true,
            data: { id: newUserId, email },
            token,
            userId: newUserId  // Include userId at top level for consistency
        });
    } catch (error) {
        // mysql2 throws an error with code 'ER_DUP_ENTRY' for unique constraint violations
        // Type 'any' here because error shape can vary
        const err: any = error;
        if (err && err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }

        next(error);
    }
};

export const authUser = async (
    req: Request<{}, {}, AuthenticateUserDTO>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password_string } = req.body;
        console.log(`[DEBUG]: REQUEST: {email}`)

        // 1. Find user in DB
        const user = await getPasswordHash(email);

        // 2. Generic error if user doesn't exist (security best practice: don't say "User not found")
        if (!user) {
             return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // 3. Compare provided plain text password with stored hash
        // bcrypt.compare(plainText, hash) returns a promise that resolves to true/false
        const isMatch = await bcrypt.compare(password_string, user.password_hash);

        if (!isMatch) {
             return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // This token will be sent with every future request to prove who they are
        const token = jwt.sign(
            { userId: user.id, email: user.email }, // Payload (data to include in token)
            process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod', // Secret key
            { expiresIn: '1h' } // Token expiry
        );

        // 5. Success response — include token in JSON so frontend can store it
        res.status(200)
        .cookie('auth-token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production'
        })
        .json({
            message: 'Authentication successful',
            userId: user.id,
            token
        });

    } catch (error) {
        next(error);
    }
};

export const getUserBalance = async (req: Request, res: Response) => {
    try {
        // Get the user ID from the token (set by your auth middleware)

        const userId = (req as any).user.userId;


        // Failsafe: if middleware didn't run or failed to set user
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Query database using the trusted userId from the token
        const sql = 'SELECT id, email, balance FROM user WHERE id = ? LIMIT 1';
        const [rows] = await pool.query<RowDataPacket[]>(sql, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = rows[0];

        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                balance: parseFloat(user.balance)
            }
        });
    } catch (error) {
        console.error("Error getting balance:", error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const logoutUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Clear the auth-token cookie if it exists
        res.clearCookie('auth-token', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production'
        });

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        next(error);
    }
};

// You can add more controller functions here, e.g., getUser, deleteUser