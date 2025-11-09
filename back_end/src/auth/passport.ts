import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getUserByGoogleId, createUser as dbCreateUser, getUserById } from '../../DBHelpers/db_helpers';
import bcrypt from 'bcryptjs';

// Configure Google Strategy
export default function configurePassport() {
    const clientID = process.env.GOOGLE_CLIENT_ID as string;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
    const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/v0/auth/google/callback';

    if (!clientID || !clientSecret) {
        console.warn('Google OAuth credentials are not set in env. Passport GoogleStrategy will not be fully functional.');
    }

    passport.use(new GoogleStrategy(
        {
            clientID,
            clientSecret,
            callbackURL,
        },
        // verify callback
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
            try {
                // profile.id is Google's unique id for the user
                const googleId = profile.id;

                // try to find user by googleId
                const existing = await getUserByGoogleId(googleId);
                if (existing) {
                    return done(null, existing);
                }

                // create a new user record
                const email = profile.emails && profile.emails[0] && profile.emails[0].value ? profile.emails[0].value : null;
                const firstName = profile.name?.givenName || profile.displayName || '';
                const surname = profile.name?.familyName || '';

                // create a username from email local part or displayName
                let username = '';
                if (email) username = email.split('@')[0];
                if (!username) username = (profile.displayName || `guser_${googleId}`).replace(/\s+/g, '_').toLowerCase();

                // For OAuth users we still need a password_hash and salt (DB schema requires NOT NULL)
                const randomPassword = Math.random().toString(36).slice(-12);
                const salt = await bcrypt.genSalt(10);
                const password_hash = await bcrypt.hash(randomPassword, salt);

                const newUserId = await dbCreateUser({
                    username,
                    email: email || `${username}@no-email.local`,
                    firstName,
                    surname,
                    password_hash,
                    salt,
                    googleId: Number(googleId)
                });

                const created = { id: newUserId, username, email };
                return done(null, created);
            } catch (err) {
                return done(err as any);
            }
        }
    ));

    // Passport serialize/deserialize - keep minimal since using session=false in routes
    // Stateless strategy: we don't use sessions. JWTs are issued by the oauth callback.
}
