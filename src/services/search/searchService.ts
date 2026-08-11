import { axiosClient } from '../auth/axiosClient';
import type {
  ProviderSearchParams,
  SearchProvidersResponse,
  GlobalSearchResponse,
} from '../../types/search/searchTypes';

const searchCache: Record<string, SearchProvidersResponse> = {};

export const searchApi = {
  async searchProviders(params: ProviderSearchParams): Promise<SearchProvidersResponse> {
    const cacheKey = JSON.stringify(params);
    if (searchCache[cacheKey]) {
      return searchCache[cacheKey];
    }
    const response = await axiosClient.get<SearchProvidersResponse>('/api/search/providers', {
      params,
    });
    searchCache[cacheKey] = response.data;
    return response.data;
  },

  async globalSearch(query: string): Promise<GlobalSearchResponse> {
    const response = await axiosClient.get<GlobalSearchResponse>('/api/search', {
      params: { q: query },
    });
    return response.data;
  },

  async getFeaturedProviders(limit = 5): Promise<SearchProvidersResponse> {
    const response = await axiosClient.get<SearchProvidersResponse>('/api/search/featured', {
      params: { limit },
    });
    return response.data;
  },

  async getRecommendedProviders(limit = 5): Promise<SearchProvidersResponse> {
    const response = await axiosClient.get<SearchProvidersResponse>('/api/search/recommended', {
      params: { limit },
    });
    return response.data;
  },
};
