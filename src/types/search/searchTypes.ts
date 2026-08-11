import type { ServiceCategory } from '../category/categoryTypes';
import type { ProviderProfile } from '../provider/providerTypes';

export interface ProviderSearchParams {
  search?: string;
  categoryId?: number;
  city?: string;
  experience?: number;
  rating?: number;
  verificationStatus?: string;
  isFeatured?: boolean;
  canProvideServices?: boolean;
  canProvideConsultation?: boolean;
  sort?: 'relevance' | 'rating' | 'experience' | 'price_asc' | 'price_desc' | 'newest';
  cursor?: string;
  limit?: number;
}

export interface SearchProvidersResponse {
  success: boolean;
  data: ProviderProfile[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface GlobalSearchResponse {
  success: boolean;
  categories: ServiceCategory[];
  providers: ProviderProfile[];
}
