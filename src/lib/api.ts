import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const API_KEY = import.meta.env.VITE_API_KEY;

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (API_KEY) {
    config.headers['x-api-key'] = API_KEY;
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
  tag: string;
  name: string;
  meals: Meal[];
}

export const promotionAPI = {
  getAll: async () => {
    const { data } = await api.get<Promotion[]>('/promotion');
    return data;
  },

  getOne: async (tag: string) => {
    const { data } = await api.get<{ promotion: Promotion; image: string }>(`/promotion/${tag}`);
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

// Menu API
export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  position: number;
}

export type MenuItemInput = Omit<MenuItem, 'id' | 'position'> & { position?: number };

export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  position: number;
  items: MenuItem[];
}

export interface Menu {
  id: number;
  tag: string;
  categories: MenuCategory[];
}

export type MenuCategoryInput = Omit<MenuCategory, 'id' | 'items'> & {
  items?: MenuItemInput[];
};

export const menuAPI = {
  getAll: async () => {
    const { data } = await api.get<Menu[]>('/menu');
    return data;
  },

  getOne: async (tag: string) => {
    const { data } = await api.get<Menu>(`/menu/${tag}`);
    return data;
  },

  delete: async (tag: string) => {
    const { data } = await api.delete(`/menu/${tag}`);
    return data;
  },

  createCategory: async (tag: string, category: MenuCategoryInput) => {
    const { data } = await api.post(`/menu/${tag}/categories`, category);
    return data;
  },

  updateCategory: async (id: number, category: Partial<MenuCategoryInput>) => {
    const { data } = await api.put(`/menu/categories/${id}`, category);
    return data;
  },

  deleteCategory: async (id: number) => {
    const { data } = await api.delete(`/menu/categories/${id}`);
    return data;
  },

  createItem: async (categoryId: number, item: MenuItemInput) => {
    const { data } = await api.post(`/menu/categories/${categoryId}/items`, item);
    return data;
  },

  updateItem: async (id: number, item: Partial<MenuItemInput>) => {
    const { data } = await api.put(`/menu/items/${id}`, item);
    return data;
  },

  deleteItem: async (id: number) => {
    const { data } = await api.delete(`/menu/items/${id}`);
    return data;
  },

  rebuild: async () => {
    const { data } = await api.post('/menu/rebuild');
    return data;
  },
};
