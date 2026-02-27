import axios from 'axios';
import { AUTH_TOKEN_KEY } from './constants';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isUnauthorized = err.response?.status === 401;
    const requestUrl =
      typeof err.config?.url === 'string' ? err.config.url : '';
    const isLoginRequest = requestUrl.includes('/auth/login');
    const isLoginPage = window.location.pathname === '/login';

    if (isUnauthorized && !isLoginRequest) {
      localStorage.removeItem(AUTH_TOKEN_KEY);

      if (!isLoginPage) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(err);
  }
);

export default api;
