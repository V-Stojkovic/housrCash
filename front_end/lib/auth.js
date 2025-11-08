import { signIn, signOut } from 'next-auth/react';

export const loginEndpoint = '/api/login';
export const handleGoogleSignIn = () => signIn('google');
export const handleSignOut = () => signOut();