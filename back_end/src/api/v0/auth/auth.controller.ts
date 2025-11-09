import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// After successful passport authentication, user object is available on req.user
export const oauthCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user: any = (req as any).user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Authentication failed' });
        }

        // Create a token for the user
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod',
            { expiresIn: '1h' }
        );

        // If front-end URL is provided, redirect with token as query param. Otherwise return JSON.
        const frontend = process.env.FRONTEND_URL;
        if (frontend) {
            // Redirect to frontend with token in query string (client should grab it)
            const redirectUrl = `${frontend.replace(/\/$/, '')}/auth/success?token=${token}`;
            return res.redirect(302, redirectUrl);
        }

        // Default: return token in JSON
        return res.status(200).json({ success: true, token, userId: user.id });
    } catch (err) {
        next(err);
    }
};
