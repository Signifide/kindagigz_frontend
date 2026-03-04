import toast from 'react-hot-toast'; // Or your preferred toast library

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export const apiClient = async (endpoint: string, options: RequestOptions = {}) => {
  const { params, ...customConfig } = options;
  
  // 1. Build URL with query params if they exist
  const url = new URL(endpoint);
  if (params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  }

  // 2. Standard Headers
  const headers = {
    'Content-Type': 'application/json',
    ...customConfig.headers,
  };

  const config: RequestInit = {
    ...customConfig,
    headers,
    credentials: 'include', // Crucial for your httpOnly cookies
  };

  try {
    const response = await fetch(url.toString(), config);

    // --- GLOBAL INTERCEPTOR LOGIC ---
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitTime = retryAfter ? ` in ${retryAfter} seconds` : ' shortly';
      
      toast.error(`Slow down! Too many requests. Please try again${waitTime}.`, {
        id: 'throttle-toast', // Prevents toast spamming
        duration: 5000,
      });
      
      throw new Error('Throttled');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { status: response.status, ...errorData };
    }

    // Return JSON if there is content
    return response.status === 204 ? {} : await response.json();

  } catch (error: any) {
    if (error.message === 'Throttled') return Promise.reject(error);
    
    // Handle other global errors (like 500s)
    console.error('API Error:', error);
    return Promise.reject(error);
  }
};