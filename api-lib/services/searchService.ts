import { db } from '../utils/db.js';

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

export async function searchProviders(params: ProviderSearchParams) {
  const limit = params.limit ? Number(params.limit) : 10;
  const whereClause: any = {};

  // Filters mapping
  if (params.search) {
    whereClause.OR = [
      { fullName: { contains: params.search, mode: 'insensitive' } },
      { businessName: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  if (params.categoryId) {
    whereClause.categoryId = Number(params.categoryId);
  }

  if (params.city) {
    whereClause.city = { contains: params.city, mode: 'insensitive' };
  }

  if (params.experience) {
    whereClause.experienceYears = { gte: Number(params.experience) };
  }

  if (params.rating) {
    whereClause.averageRating = { gte: Number(params.rating) };
  }

  if (params.verificationStatus) {
    whereClause.verificationStatus = params.verificationStatus as any;
  } else {
    // Public search only returns verified providers
    whereClause.verificationStatus = 'VERIFIED';
  }

  if (params.isFeatured !== undefined) {
    whereClause.isFeatured = params.isFeatured;
  }

  if (params.canProvideServices !== undefined) {
    whereClause.canProvideServices = params.canProvideServices;
  }

  if (params.canProvideConsultation !== undefined) {
    whereClause.canProvideConsultation = params.canProvideConsultation;
  }

  // Cursor pagination
  if (params.cursor) {
    whereClause.id = { gt: params.cursor };
  }

  // Sorting
  const orderBy: any[] =
    params.sort === 'rating'
      ? [{ averageRating: 'desc' }, { totalReviews: 'desc' }, { id: 'asc' }]
      : params.sort === 'experience'
      ? [{ experienceYears: 'desc' }, { averageRating: 'desc' }, { id: 'asc' }]
      : params.sort === 'price_asc'
      ? [{ consultationFee: 'asc' }, { averageRating: 'desc' }, { id: 'asc' }]
      : params.sort === 'price_desc'
      ? [{ consultationFee: 'desc' }, { averageRating: 'desc' }, { id: 'asc' }]
      : params.sort === 'newest'
      ? [{ createdAt: 'desc' }, { id: 'asc' }]
      : [
      { isFeatured: 'desc' },
      { averageRating: 'desc' },
      { totalReviews: 'desc' },
      { id: 'asc' },
    ];

  // Fetch take limit + 1 to check if another page is available
  const providers = await db.providerProfile.findMany({
    where: whereClause,
    orderBy,
    take: limit + 1,
    include: {
      category: true,
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  let nextCursor: string | null = null;
  const hasMore = providers.length > limit;

  if (hasMore) {
    // Remove the extra item, use its ID as next cursor
    const lastItem = providers.pop();
    if (lastItem) {
      nextCursor = lastItem.id;
    }
  }

  return {
    success: true,
    data: providers,
    nextCursor,
    hasMore,
  };
}

export async function globalSearch(keyword: string) {
  const cleanKeyword = keyword.trim();
  if (!cleanKeyword) {
    return { success: true, categories: [], providers: [] };
  }

  const [categories, providers] = await Promise.all([
    db.serviceCategory.findMany({
      where: {
        name: { contains: cleanKeyword, mode: 'insensitive' },
        isActive: true,
        deletedAt: null,
      },
      take: 5,
    }),
    db.providerProfile.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        OR: [
          { fullName: { contains: cleanKeyword, mode: 'insensitive' } },
          { businessName: { contains: cleanKeyword, mode: 'insensitive' } },
        ],
      },
      include: {
        category: true,
      },
      take: 5,
    }),
  ]);

  return {
    success: true,
    categories,
    providers,
  };
}
