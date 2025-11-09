const USER_ID_KEY = 'housr_user_id';

// Backend base url
export const API_BASE = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL)
  ? process.env.NEXT_PUBLIC_API_URL
  : 'http://localhost:4000';
console.log(`API BASE ${API_BASE}`);
export const loginEndpoint = '/api/v0/user/login';

// Called on the frontend OAuth landing page
export const processOAuthCallback = (router) => {
  if (typeof window === 'undefined') return { success: false };
  const params = new URLSearchParams(window.location.search);
  // We don't need to manually grab the token here anymore if the backend set the cookie on redirect.
  // If your Google callback backend didn't set a cookie, you might still need this temporarily.
  // Assuming standard flow where backend handles everything:
  const userId = params.get('userId') || params.get('user_id');

  if (userId) {
    localStorage.setItem(USER_ID_KEY, userId);

    // Cleanup URL
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    url.searchParams.delete('userId');
    url.searchParams.delete('user_id');
    window.history.replaceState({}, document.title, url.pathname + url.hash);

    // Force redirect to home
    window.location.href = '/';
    return { success: true, userId };
  }

  return { success: false };
};

export const getCurrentUserId = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_ID_KEY);
};

export const handleSignIn = async (credentials) => {
  try {
    const url = `${API_BASE}${loginEndpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      // VITAL: This allows the browser to accept and save the 'auth-token' cookie from the backend
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      // Try to parse error message from JSON if available
      try {
          const errData = await response.json();
          throw new Error(errData.message || `HTTP error! status: ${response.status}`);
      } catch (e) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data = await response.json();

    // Only save userId to localStorage for UI convenience.
    // The actual auth is now handled by the 'auth-token' cookie.
    if (data.userId) {
      localStorage.setItem(USER_ID_KEY, data.userId);
    }

    // Force full page reload to dashboard to ensure all components pick up new auth state
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }

    return { success: true, data };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
};

export const handleSignOut = async () => {
   // Optional: Call backend to clear cookie properly
   // await fetch(`${API_BASE}/api/v0/user/logout`, { method: 'POST', credentials: 'include' });

  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_ID_KEY);
    // We can try to manually expire the cookie too if it wasn't httpOnly,
    // but best to let backend handle it or just rely on browser clearing it eventually.
    document.cookie = 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/login';
  }
};