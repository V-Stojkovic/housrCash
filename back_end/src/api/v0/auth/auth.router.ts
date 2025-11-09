import { Router } from 'express';
import passport from 'passport';
import { oauthCallback } from './auth.controller';

const router = Router();

// Initiates Google OAuth flow
// Start Google OAuth flow (stateless: session disabled)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// Callback URL Google will redirect to
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    oauthCallback
);

export default router;
