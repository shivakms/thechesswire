// src/services/api.ts
import axios from 'axios';
import toast from 'react-hot-toast';

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
    const token = localStorage.getItem('chesswire_token');
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
      // Unauthorized - clear token and redirect
      localStorage.removeItem('chesswire_token');
      localStorage.removeItem('chesswire_user');
      window.location.href = '/auth/gateway';
    } else if (error.response?.status === 429) {
      // Rate limited
      toast.error('Too many requests. Please slow down.');
    } else if (error.response?.status === 403) {
      // Forbidden - possible abuse detection
      toast.error('Access denied. If this persists, please contact support.');
    }
    return Promise.reject(error);
  }
);

// Types
interface SignUpData {
  username: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  echoOrigin?: string;
  voiceMode?: string;
  isTitledPlayer?: boolean;
  titledPlayerData?: {
    title?: string;
    platform?: string;
    username?: string;
    verifiedAt?: string;
  };
}

interface SignInData {
  email?: string;
  username?: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
    email?: string;
    isTitledPlayer?: boolean;
    echoOrigin?: string;
    echoRank?: number;
  };
}

// Auth endpoints
export const auth = {
  register: async (data: SignUpData): Promise<AuthResponse> => {
    // Get onboarding data from sessionStorage
    const onboardingDataStr = sessionStorage.getItem('chesswire_onboarding');
    const onboardingData = onboardingDataStr ? JSON.parse(onboardingDataStr) : {};
    
    const response = await api.post<AuthResponse>('/auth/register', {
      ...data,
      ...onboardingData, // Include echo origin, voice mode, etc.
    });
    
    if (response.data.token) {
      localStorage.setItem('chesswire_token', response.data.token);
      localStorage.setItem('chesswire_user', JSON.stringify(response.data.user));
      
      // Clear onboarding data after successful registration
      sessionStorage.removeItem('chesswire_onboarding');
    }
    
    return response.data;
  },

  login: async (data: SignInData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    if (response.data.token) {
      localStorage.setItem('chesswire_token', response.data.token);
      localStorage.setItem('chesswire_user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('chesswire_token');
    localStorage.removeItem('chesswire_user');
    window.location.href = '/';
  },

  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data.valid;
    } catch {
      return false;
    }
  }
};

// Username checking
export const username = {
  checkAvailability: async (username: string) => {
    const response = await api.get(`/check-username/${username}`);
    return response.data;
  }
};

// Titled player verification
export const titledPlayer = {
  verify: async (data: { 
    platform: string; 
    username: string; 
    fideId?: string 
  }) => {
    const response = await api.post('/verify-titled-player', data);
    return response.data;
  }
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

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('chesswire_token');
};

// Utility function to get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('chesswire_user');
  return userStr ? JSON.parse(userStr) : null;
};

export default api;
