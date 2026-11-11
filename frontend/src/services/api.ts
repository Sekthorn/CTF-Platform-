import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000,
  withCredentials: true, // Sends HttpOnly session cookies for SSO
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach in-memory / storage token if available as bearer fallback
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('websec_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If JWT expires or is invalid, clear token and redirect to login
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem('websec_token');
      localStorage.removeItem('websec_token');
      if (
        hadToken &&
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login?expired=1';
      }
    }

    const message =
      error.response?.data?.message ||
      (Array.isArray(error.response?.data?.message)
        ? error.response.data.message.join(', ')
        : error.message) ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
