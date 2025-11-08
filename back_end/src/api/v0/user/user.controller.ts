import { Request, Response, NextFunction } from 'express';
import { getId, getPasswordHash } from '../../../../DBHelpers/db_helpers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Just an example interface
interface CreateUserDTO {
    username: string;
    email: string;
}

interface AuthenticateUserDTO{
    username: string;
    password_string: string;
}

export const createUser = async (req: Request<{}, {}, CreateUserDTO>, res: Response, next: NextFunction) => {
    try {
        const { username, email } = req.body;
        // ... logic to save user to DB ...
        
        res.status(201).json({
            success: true,
            data: { id: 123, username, email }
        });
    } catch (error) {
        next(error);
    }
};

export const authUser = async (
    req: Request<{}, {}, AuthenticateUserDTO>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { username, password_string } = req.body;


        // 1. Find user in DB
        const user = await getPasswordHash(username);

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
            { userId: user.id, username: user.username }, // Payload (data to include in token)
            process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod', // Secret key
            { expiresIn: '1h' } // Token expiry
        );

        // 5. Success response
        res.status(200)
        .cookie("auth-token",token)
        .json({
            message: 'Authentication successful',
            userId: user.id
        });

    } catch (error) {
        next(error);
    }
};

// You can add more controller functions here, e.g., getUser, deleteUser