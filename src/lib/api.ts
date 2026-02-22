import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const { data } = await api.post('/auth/login', { username, password });
    return data;
  },
};

// Promotion API
export interface Meal {
  name: string;
  description?: string;
  additionals?: string;
  price: number;
}

export interface Promotion {
  id: string;
  name: string;
  meals: Meal[];
}

export const promotionAPI = {
  getAll: async () => {
    const { data } = await api.get<Promotion[]>('/promotion');
    return data;
  },

  getOne: async (id: string) => {
    const { data } = await api.get<{ promotion: Promotion; image: string }>(`/promotion/${id}`);
    return data;
  },

  create: async (promotion: Omit<Promotion, 'id'>) => {
    const { data } = await api.post('/promotion', promotion);
    return data;
  },

  update: async (id: string, promotion: Partial<Promotion> & { publishToFacebook?: boolean }) => {
    const { data } = await api.put(`/promotion/${id}`, promotion);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/promotion/${id}`);
    return data;
  },
};
