// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for CORS with credentials
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  register: async (data: { username: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  },

  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
};

// PGN Analysis endpoints
export const pgn = {
  analyze: async (pgn: string) => {
    const response = await api.post('/public/analyze-pgn', { pgn });
    return response.data;
  },
};

// SoulCinema endpoints
export const soulcinema = {
  checkRemaining: async () => {
    const response = await api.get('/free/soulcinema/remaining');
    return response.data;
  },

  render: async (data: { pgn: string; title?: string }) => {
    const response = await api.post('/soulcinema/render', data);
    return response.data;
  },
};

export default api;