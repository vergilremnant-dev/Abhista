export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  authorProviderId: string | null;
  categoryId: number;
  tags: string;
  readTime: number;
  isPublished: boolean;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  viewsCount: number;
  totalReadingTime: number;
  consultationConversions: number;
  callbackConversions: number;
  createdAt: string;
  updatedAt: string;
  category?: BlogCategory;
  authorProvider?: {
    fullName: string;
    businessName: string | null;
  } | null;
}

export interface FeaturedArticlesResponse {
  latest: Article[];
  popular: Article[];
}

export interface ArticleListResponse {
  articles: Article[];
  totalCount: number;
}

export interface ArticleAnalyticsItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  views: number;
  avgReadTimeSeconds: number;
  consultationConversions: number;
  callbackConversions: number;
}

export interface ArticleAnalyticsReport {
  totalArticles: number;
  totalViews: number;
  totalConsultationConversions: number;
  totalCallbackConversions: number;
  articles: ArticleAnalyticsItem[];
}
