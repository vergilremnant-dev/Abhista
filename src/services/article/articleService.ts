import { axiosClient } from '../auth/axiosClient';
import type {
  Article,
  BlogCategory,
  FeaturedArticlesResponse,
  ArticleListResponse,
  ArticleAnalyticsReport,
} from '../../types/article/articleTypes';

export const articleApi = {
  // Public APIs
  async listArticles(params: {
    categorySlug?: string;
    query?: string;
    limit?: number;
    offset?: number;
  }): Promise<ArticleListResponse> {
    const response = await axiosClient.get<{ success: boolean; data: ArticleListResponse }>(
      '/api/articles',
      { params }
    );
    return response.data.data;
  },

  async getArticleDetail(slug: string): Promise<Article> {
    const response = await axiosClient.get<{ success: boolean; data: Article }>(
      `/api/articles/${slug}`
    );
    return response.data.data;
  },

  async getFeaturedArticles(): Promise<FeaturedArticlesResponse> {
    const response = await axiosClient.get<{ success: boolean; data: FeaturedArticlesResponse }>(
      '/api/articles/featured'
    );
    return response.data.data;
  },

  async getCategories(): Promise<BlogCategory[]> {
    const response = await axiosClient.get<{ success: boolean; data: BlogCategory[] }>(
      '/api/articles/categories'
    );
    return response.data.data;
  },

  async trackInteraction(
    id: string,
    type: 'read_time' | 'consultation' | 'callback',
    duration?: number
  ): Promise<void> {
    await axiosClient.post(`/api/articles/${id}/track`, { type, duration });
  },

  // Admin APIs
  async adminListArticles(params?: {
    categorySlug?: string;
    query?: string;
    limit?: number;
    offset?: number;
  }): Promise<ArticleListResponse> {
    const response = await axiosClient.get<{ success: boolean; data: ArticleListResponse }>(
      '/api/admin/articles',
      { params }
    );
    return response.data.data;
  },

  async adminCreateArticle(data: {
    title: string;
    excerpt: string;
    content: string;
    featuredImage?: string | null;
    categoryId: number;
    tags?: string;
    readTime?: number;
    isPublished?: boolean;
    seoTitle?: string;
    seoDescription?: string;
  }): Promise<Article> {
    const response = await axiosClient.post<{ success: boolean; data: Article }>(
      '/api/admin/articles',
      data
    );
    return response.data.data;
  },

  async adminUpdateArticle(
    id: string,
    data: Partial<{
      title: string;
      excerpt: string;
      content: string;
      featuredImage: string | null;
      categoryId: number;
      tags: string;
      readTime: number;
      isPublished: boolean;
      seoTitle: string;
      seoDescription: string;
    }>
  ): Promise<Article> {
    const response = await axiosClient.put<{ success: boolean; data: Article }>(
      `/api/admin/articles/${id}`,
      data
    );
    return response.data.data;
  },

  async adminDeleteArticle(id: string): Promise<void> {
    await axiosClient.delete(`/api/admin/articles/${id}`);
  },

  async adminListCategories(): Promise<BlogCategory[]> {
    const response = await axiosClient.get<{ success: boolean; data: BlogCategory[] }>(
      '/api/admin/categories'
    );
    return response.data.data;
  },

  async adminCreateCategory(data: { name: string; description?: string }): Promise<BlogCategory> {
    const response = await axiosClient.post<{ success: boolean; data: BlogCategory }>(
      '/api/admin/categories',
      data
    );
    return response.data.data;
  },

  async adminUpdateCategory(
    id: number,
    data: { name?: string; description?: string; isActive?: boolean }
  ): Promise<BlogCategory> {
    const response = await axiosClient.put<{ success: boolean; data: BlogCategory }>(
      `/api/admin/categories/${id}`,
      data
    );
    return response.data.data;
  },

  async adminGetAnalytics(): Promise<ArticleAnalyticsReport> {
    const response = await axiosClient.get<{ success: boolean; data: ArticleAnalyticsReport }>(
      '/api/admin/articles/analytics'
    );
    return response.data.data;
  },
};
