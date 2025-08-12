import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const api = axios.create({ baseURL: API_URL, withCredentials: true });

// Attach access token to headers
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

import axiosOriginal from 'axios';
// Refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      try {
        const { data } = await axiosOriginal.post(
          `${API_URL}/auth/refresh`, {}, { withCredentials: true }
        );
        localStorage.setItem('accessToken', data.accessToken);
        err.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosOriginal(err.config);
      } catch {
        localStorage.removeItem('accessToken');
        window.location.assign('/login');
      }
    }
    return Promise.reject(err);
  }
);

export default api;
