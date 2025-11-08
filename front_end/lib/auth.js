import { signIn, signOut } from 'next-auth/react';

const USER_ID_KEY = 'housr_user_id';

export const loginEndpoint = '/api/v0/login';
export const handleGoogleSignIn = () => signIn('google');

export const getCurrentUserId = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_ID_KEY);
};

export const handleSignIn = async (credentials) => {
  try {
    const response = await fetch(loginEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Save userId to localStorage if it exists in the response
    if (data.userId) {
      localStorage.setItem(USER_ID_KEY, data.userId);
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const handleSignOut = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_ID_KEY);
  }
  return signOut();
};