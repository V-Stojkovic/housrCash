const USER_ID_KEY = 'housr_user_id';

export const loginEndpoint = '/api/v0/user/login';
export const signupEndpoint = '/api/v0/user/create';

// Backend base url - use NEXT_PUBLIC_BACKEND_URL when available, fallback to localhost:4000
const BACKEND_BASE = "http://localhost:4000"

export const handleGoogleSignIn = () => {
  // Redirect the browser to the backend OAuth start endpoint
  if (typeof window !== 'undefined') {
    window.location.href = `/api/v0/auth/google`;
  }
};

// Called on the frontend OAuth landing page to capture token returned by backend
// processOAuthCallback(router?, redirectTo?)
// - router: an optional router object with `replace` or `push` (e.g., Next.js useRouter)
// - redirectTo: path to navigate to after processing (defaults to '/')
export const processOAuthCallback = (router, redirectTo = '/') => {
  if (typeof window === 'undefined') return { success: false };
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const userId = params.get('userId') || params.get('user_id');

  if (token) {
    // store token and userId locally
    localStorage.setItem('housr_auth_token', token);
    if (userId) localStorage.setItem(USER_ID_KEY, userId);

    // Optionally remove token from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    url.searchParams.delete('userId');
    url.searchParams.delete('user_id');
    window.history.replaceState({}, document.title, url.pathname + url.hash);

    // Use provided router (Next.js router etc.) if available to navigate client-side
    try {
      if (router && typeof router.replace === 'function') {
        router.replace(redirectTo);
      } else if (typeof window !== 'undefined') {
        window.location.replace(redirectTo);
      }
    } catch {
      // fallback to full redirect
      if (typeof window !== 'undefined') window.location.replace(redirectTo);
    }

    return { success: true, token, userId };
  }

  return { success: false };
};

export const getCurrentUserId = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_ID_KEY);
};

// handleSignIn(credentials, router?, redirectTo?)
// credentials should match backend expected shape: { email, password_string }
export const handleSignIn = async (credentials, router, redirectTo = '/') => {
  try {
    const response = await fetch(`${loginEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP error! status: ${response.status} ${text}`);
    }

    const data = await response.json();

    // Save token and userId to localStorage if present
    if (data.token) {
      localStorage.setItem('housr_auth_token', data.token);
    }
    if (data.userId) {
      localStorage.setItem(USER_ID_KEY, data.userId);
    }

    // If router provided, navigate client-side, otherwise fallback to full redirect
    try {
      if (router && typeof router.replace === 'function') {
        router.replace(redirectTo);
      } else if (typeof window !== 'undefined') {
        window.location.replace(redirectTo);
      }
    } catch {
      if (typeof window !== 'undefined') window.location.replace(redirectTo);
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// handleSignUp(userData, router?, redirectTo?)
// credentials should match backend expected shape: { email, password_string }
export const handleSignUp = async (userData, router, redirectTo = '/') => {
  try {
    const response = await fetch(`${signupEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Signup failed' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Save token and userId to localStorage if present
    if (data.token) {
      localStorage.setItem('housr_auth_token', data.token);
    }
    if (data.userId) {
      localStorage.setItem(USER_ID_KEY, data.userId);
    }

    // If router provided, navigate client-side, otherwise fallback to full redirect
    try {
      if (router && typeof router.replace === 'function') {
        router.replace(redirectTo);
      } else if (typeof window !== 'undefined') {
        window.location.replace(redirectTo);
      }
    } catch {
      if (typeof window !== 'undefined') window.location.replace(redirectTo);
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const handleSignOut = async () => {
  // Call backend logout endpoint
  try {
    await fetch(`/api/v0/user/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
  }

  // Clear local storage regardless of backend response
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem('housr_auth_token');
    // Redirect to login page
    window.location.href = '/login';
  }
};