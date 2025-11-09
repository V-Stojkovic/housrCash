
type ApiFetchOptions = RequestInit & {
  redirectOnError?: boolean;
};

const apiFetch = async (url: string, options: ApiFetchOptions = {}) => {
  const { redirectOnError = true, ...fetchOptions } = options;

  const response = await fetch(url, fetchOptions);

  if (!response.ok && response.status >= 400 && response.status < 500 && redirectOnError) {
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  return response;
};

export default apiFetch;
