import { axiosClient } from '../auth/axiosClient';
import type {
  ServiceCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../types/category/categoryTypes';

let categoriesCache: ServiceCategory[] | null = null;
let categoryTreeCache: ServiceCategory[] | null = null;
let featuredCategoriesCache: ServiceCategory[] | null = null;

export const categoryApi = {
  async getCategories(): Promise<ServiceCategory[]> {
    if (categoriesCache) {
      return categoriesCache;
    }
    const response = await axiosClient.get<{ data: ServiceCategory[] }>('/api/categories');
    categoriesCache = response.data.data;
    return response.data.data;
  },

  async getCategoryTree(): Promise<ServiceCategory[]> {
    if (categoryTreeCache) {
      return categoryTreeCache;
    }
    const response = await axiosClient.get<{ data: ServiceCategory[] }>('/api/categories/tree');
    categoryTreeCache = response.data.data;
    return response.data.data;
  },

  async getFeaturedCategories(): Promise<ServiceCategory[]> {
    if (featuredCategoriesCache) {
      return featuredCategoriesCache;
    }
    const response = await axiosClient.get<{ data: ServiceCategory[] }>('/api/categories/featured');
    featuredCategoriesCache = response.data.data;
    return response.data.data;
  },

  async getCategory(slug: string): Promise<ServiceCategory> {
    const response = await axiosClient.get<{ data: ServiceCategory }>(`/api/categories/${slug}`);
    return response.data.data;
  },

  async createCategory(request: CreateCategoryRequest): Promise<ServiceCategory> {
    clearCache();
    const response = await axiosClient.post<{ message: string; data: ServiceCategory }>(
      '/api/categories',
      request
    );
    return response.data.data;
  },

  async updateCategory(id: number, request: UpdateCategoryRequest): Promise<ServiceCategory> {
    clearCache();
    const response = await axiosClient.put<{ message: string; data: ServiceCategory }>(
      `/api/categories/${id}`,
      request
    );
    return response.data.data;
  },

  async reorderCategories(orders: { id: number; displayOrder: number }[]): Promise<void> {
    clearCache();
    await axiosClient.post('/api/categories/reorder', { orders });
  },

  async deleteCategory(id: number): Promise<void> {
    clearCache();
    await axiosClient.delete(`/api/categories/${id}`);
  },
};

function clearCache() {
  categoriesCache = null;
  categoryTreeCache = null;
  featuredCategoriesCache = null;
}
