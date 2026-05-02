import { api } from './authService';
import { getImageUrl } from '../lib/imageUrl';

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  image: string;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const normalize = (raw: Record<string, unknown>): CategoryItem => ({
  id: (raw._id ?? raw.id ?? '') as string,
  name: (raw.name ?? '') as string,
  description: (raw.description ?? '') as string,
  image: getImageUrl((raw.image ?? raw.image_url ?? '') as string),
  is_active: (raw.is_active ?? true) as boolean,
  createdAt: (raw.createdAt ?? raw.created_at ?? '') as string,
  updatedAt: (raw.updatedAt ?? raw.updated_at ?? '') as string,
});

const multipartHeaders = { 'Content-Type': 'multipart/form-data' };

export const categoryService = {
  getAll: async (): Promise<CategoryItem[]> => {
    const { data } = await api.get('/categories');
    const list: unknown[] = data?.data ?? data ?? [];
    return Array.isArray(list) ? list.map((r) => normalize(r as Record<string, unknown>)) : [];
  },

  getById: async (id: string): Promise<CategoryItem> => {
    const { data } = await api.get(`/categories/${id}`);
    const raw: Record<string, unknown> = data?.data ?? data;
    return normalize(raw);
  },

  // FormData must contain: name, description (optional), image (File, optional)
  create: async (formData: FormData) => {
    const { data } = await api.post('/categories', formData, { headers: multipartHeaders });
    return data;
  },

  // FormData may contain: name, description, image (File — only if changing image)
  update: async (id: string, formData: FormData) => {
    const { data } = await api.put(`/categories/${id}`, formData, { headers: multipartHeaders });
    return data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },

  toggleActive: async (id: string) => {
    const { data } = await api.patch(`/categories/${id}/toggle-active`);
    return data;
  },
};
