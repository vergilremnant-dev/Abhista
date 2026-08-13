import { db } from '../_utils/../_utils/db.js';
import { Prisma } from '@prisma/client';

/**
 * Converts a string to a clean URL-friendly slug.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Creates a blog category.
 */
export async function createBlogCategory(name: string, description?: string) {
  const slug = slugify(name);
  return await db.blogCategory.create({
    data: {
      name: name.trim(),
      slug,
      description: description ? description.trim() : null,
      isActive: true,
    },
  });
}

/**
 * Updates a blog category.
 */
export async function updateBlogCategory(id: number, name?: string, description?: string, isActive?: boolean) {
  const dataToUpdate: Prisma.BlogCategoryUpdateInput = {};
  if (name !== undefined) {
    dataToUpdate.name = name.trim();
    dataToUpdate.slug = slugify(name);
  }
  if (description !== undefined) {
    dataToUpdate.description = description ? description.trim() : null;
  }
  if (isActive !== undefined) {
    dataToUpdate.isActive = isActive;
  }

  return await db.blogCategory.update({
    where: { id: Number(id) },
    data: dataToUpdate,
  });
}

/**
 * Lists categories.
 */
export async function listBlogCategories(activeOnly = true) {
  return await db.blogCategory.findMany({
    where: activeOnly ? { isActive: true } : {},
    orderBy: { name: 'asc' },
  });
}

/**
 * Creates an educational article.
 */
export async function createArticle(input: {
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  authorProviderId?: string;
  categoryId: number;
  tags?: string;
  readTime?: number;
  isPublished?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}) {
  if (!input.title || !input.title.trim()) {
    throw new Error('Article title is required');
  }
  if (!input.content || !input.content.trim()) {
    throw new Error('Article content is required');
  }
  if (!input.categoryId) {
    throw new Error('Category is required');
  }

  let slug = slugify(input.title);

  // Ensure slug uniqueness
  const existing = await db.article.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const category = await db.blogCategory.findUnique({
    where: { id: Number(input.categoryId) },
  });
  if (!category) {
    throw new Error('Category not found');
  }

  const isPublished = input.isPublished || false;

  return await db.article.create({
    data: {
      title: input.title.trim(),
      slug,
      excerpt: input.excerpt ? input.excerpt.trim() : input.content.substring(0, 150) + '...',
      content: input.content,
      featuredImage: input.featuredImage || null,
      authorProviderId: input.authorProviderId || null,
      categoryId: Number(input.categoryId),
      tags: input.tags ? input.tags.trim() : '',
      readTime: input.readTime ? Number(input.readTime) : 5,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      seoTitle: input.seoTitle ? input.seoTitle.trim() : input.title.trim(),
      seoDescription: input.seoDescription ? input.seoDescription.trim() : input.excerpt ? input.excerpt.trim() : undefined,
    },
  });
}

/**
 * Updates an educational article.
 */
export async function updateArticle(
  id: string,
  input: {
    title?: string;
    excerpt?: string;
    content?: string;
    featuredImage?: string;
    authorProviderId?: string;
    categoryId?: number;
    tags?: string;
    readTime?: number;
    isPublished?: boolean;
    seoTitle?: string;
    seoDescription?: string;
  }
) {
  const article = await db.article.findUnique({ where: { id } });
  if (!article) {
    throw new Error('Article not found');
  }

  const dataToUpdate: Prisma.ArticleUpdateInput = {};
  if (input.title !== undefined) {
    dataToUpdate.title = input.title.trim();
    let slug = slugify(input.title);
    if (slug !== article.slug) {
      const existing = await db.article.findUnique({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
      dataToUpdate.slug = slug;
    }
  }

  if (input.excerpt !== undefined) dataToUpdate.excerpt = input.excerpt.trim();
  if (input.content !== undefined) dataToUpdate.content = input.content;
  if (input.featuredImage !== undefined) dataToUpdate.featuredImage = input.featuredImage;
  if (input.authorProviderId !== undefined) {
    dataToUpdate.authorProvider = { connect: { id: input.authorProviderId } };
  }
  if (input.categoryId !== undefined) {
    const category = await db.blogCategory.findUnique({ where: { id: Number(input.categoryId) } });
    if (!category) throw new Error('Category not found');
    dataToUpdate.category = { connect: { id: Number(input.categoryId) } };
  }
  if (input.tags !== undefined) dataToUpdate.tags = input.tags.trim();
  if (input.readTime !== undefined) dataToUpdate.readTime = Number(input.readTime);

  if (input.isPublished !== undefined) {
    dataToUpdate.isPublished = input.isPublished;
    if (input.isPublished && !article.isPublished) {
      dataToUpdate.publishedAt = new Date();
    } else if (!input.isPublished) {
      dataToUpdate.publishedAt = null;
    }
  }

  if (input.seoTitle !== undefined) dataToUpdate.seoTitle = input.seoTitle.trim();
  if (input.seoDescription !== undefined) dataToUpdate.seoDescription = input.seoDescription.trim();

  return await db.article.update({
    where: { id },
    data: dataToUpdate,
  });
}

/**
 * Deletes an article.
 */
export async function deleteArticle(id: string) {
  const article = await db.article.findUnique({ where: { id } });
  if (!article) throw new Error('Article not found');
  return await db.article.delete({ where: { id } });
}

/**
 * Gets a single article by slug and increments views atomically.
 */
export async function getArticleBySlug(slug: string) {
  const article = await db.article.findUnique({
    where: { slug },
    include: {
      category: true,
      authorProvider: {
        select: {
          fullName: true,
          businessName: true,
        },
      },
    },
  });

  if (!article) return null;

  // Increment views
  await db.article.update({
    where: { id: article.id },
    data: {
      viewsCount: { increment: 1 },
    },
  });

  return article;
}

/**
 * Lists articles with optional filters.
 */
export async function listArticles(params: {
  categorySlug?: string;
  query?: string;
  publishedOnly?: boolean;
  limit?: number;
  offset?: number;
}) {
  const whereClause: Prisma.ArticleWhereInput = {};

  if (params.publishedOnly !== false) {
    whereClause.isPublished = true;
  }

  if (params.categorySlug) {
    whereClause.category = {
      slug: params.categorySlug,
    };
  }

  if (params.query) {
    const q = params.query.trim().toLowerCase();
    whereClause.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { excerpt: { contains: q, mode: 'insensitive' } },
      { content: { contains: q, mode: 'insensitive' } },
      { tags: { contains: q, mode: 'insensitive' } },
    ];
  }

  const limit = params.limit ? Number(params.limit) : 20;
  const offset = params.offset ? Number(params.offset) : 0;

  const [articles, totalCount] = await Promise.all([
    db.article.findMany({
      where: whereClause,
      include: {
        category: true,
        authorProvider: {
          select: {
            fullName: true,
            businessName: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    db.article.count({ where: whereClause }),
  ]);

  return { articles, totalCount };
}

/**
 * Tracks reader interactions (reading time increments and conversions).
 */
export async function trackArticleInteraction(
  id: string,
  type: 'read_time' | 'consultation' | 'callback',
  durationSeconds?: number
) {
  const article = await db.article.findUnique({ where: { id } });
  if (!article) throw new Error('Article not found');

  const updateData: Prisma.ArticleUpdateInput = {};
  if (type === 'read_time') {
    const secs = durationSeconds ? Number(durationSeconds) : 5;
    updateData.totalReadingTime = { increment: secs };
  } else if (type === 'consultation') {
    updateData.consultationConversions = { increment: 1 };
  } else if (type === 'callback') {
    updateData.callbackConversions = { increment: 1 };
  }

  return await db.article.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Fetches dashboard analytics report.
 */
export async function getArticlesAnalytics() {
  const articles = await db.article.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      viewsCount: true,
      totalReadingTime: true,
      consultationConversions: true,
      callbackConversions: true,
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { viewsCount: 'desc' },
  });

  const totalArticles = articles.length;
  let totalViews = 0;
  let totalConsultationConversions = 0;
  let totalCallbackConversions = 0;

  const formattedArticles = articles.map((art) => {
    totalViews += art.viewsCount;
    totalConsultationConversions += art.consultationConversions;
    totalCallbackConversions += art.callbackConversions;

    const avgReadSeconds = art.viewsCount > 0 ? Math.round(art.totalReadingTime / art.viewsCount) : 0;

    return {
      id: art.id,
      title: art.title,
      slug: art.slug,
      category: art.category.name,
      views: art.viewsCount,
      avgReadTimeSeconds: avgReadSeconds,
      consultationConversions: art.consultationConversions,
      callbackConversions: art.callbackConversions,
    };
  });

  return {
    totalArticles,
    totalViews,
    totalConsultationConversions,
    totalCallbackConversions,
    articles: formattedArticles,
  };
}
