import { db } from '../utils/db.js';
import { Prisma } from '@prisma/client';

interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
  city?: string;
}

/**
 * Builds base filters for Booking model.
 */
function getBookingWhereClause(filters: AnalyticsFilters): Prisma.BookingWhereInput {
  const where: Prisma.BookingWhereInput = {};
  if (filters.startDate || filters.endDate) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (filters.startDate) createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) createdAt.lte = new Date(filters.endDate);
    where.createdAt = createdAt;
  }
  if (filters.categoryId) {
    where.categoryId = Number(filters.categoryId);
  }
  if (filters.city) {
    where.city = { equals: filters.city, mode: 'insensitive' };
  }
  return where;
}

/**
 * Builds base filters for ProviderProfile model.
 */
function getProviderWhereClause(filters: AnalyticsFilters): Prisma.ProviderProfileWhereInput {
  const where: Prisma.ProviderProfileWhereInput = {};
  if (filters.startDate || filters.endDate) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (filters.startDate) createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) createdAt.lte = new Date(filters.endDate);
    where.createdAt = createdAt;
  }
  if (filters.categoryId) {
    where.categoryId = Number(filters.categoryId);
  }
  if (filters.city) {
    where.city = { equals: filters.city, mode: 'insensitive' };
  }
  return where;
}

/**
 * Builds base filters for CustomerProfile model.
 */
function getCustomerWhereClause(filters: AnalyticsFilters): Prisma.CustomerProfileWhereInput {
  const where: Prisma.CustomerProfileWhereInput = {};
  if (filters.startDate || filters.endDate) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (filters.startDate) createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) createdAt.lte = new Date(filters.endDate);
    where.createdAt = createdAt;
  }
  if (filters.city) {
    where.city = { equals: filters.city, mode: 'insensitive' };
  }
  return where;
}

/**
 * Builds base filters for ConsultationBooking model.
 */
function getConsultationWhereClause(filters: AnalyticsFilters): Prisma.ConsultationBookingWhereInput {
  const where: Prisma.ConsultationBookingWhereInput = {};
  if (filters.startDate || filters.endDate) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (filters.startDate) createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) createdAt.lte = new Date(filters.endDate);
    where.createdAt = createdAt;
  }
  if (filters.categoryId || filters.city) {
    const providerWhere: Prisma.ProviderProfileWhereInput = {};
    if (filters.categoryId) {
      providerWhere.categoryId = Number(filters.categoryId);
    }
    if (filters.city) {
      providerWhere.city = { equals: filters.city, mode: 'insensitive' };
    }
    where.provider = { is: providerWhere };
  }
  return where;
}

/**
 * Builds base filters for CallbackRequest model.
 */
function getCallbackWhereClause(filters: AnalyticsFilters): Prisma.CallbackRequestWhereInput {
  const where: Prisma.CallbackRequestWhereInput = {};
  if (filters.startDate || filters.endDate) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (filters.startDate) createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) createdAt.lte = new Date(filters.endDate);
    where.createdAt = createdAt;
  }
  if (filters.categoryId) {
    where.serviceCategoryId = Number(filters.categoryId);
  }
  if (filters.city) {
    where.city = { equals: filters.city, mode: 'insensitive' };
  }
  return where;
}

/**
 * 1. GET OVERVIEW METRICS
 */
export async function getOverview(filters: AnalyticsFilters) {
  const providerWhere = getProviderWhereClause(filters);
  const customerWhere = getCustomerWhereClause(filters);
  const bookingWhere = getBookingWhereClause(filters);
  const consultationWhere = getConsultationWhereClause(filters);
  const callbackWhere = getCallbackWhereClause(filters);

  const [
    totalCustomers,
    totalProviders,
    activeProviders,
    verifiedProviders,
    activeSubscriptions,
    totalBookings,
    completedBookings,
    activeConsultations,
    pendingCallbacks,
    publishedArticles,
    ratingsAgg,
  ] = await Promise.all([
    db.customerProfile.count({ where: customerWhere }),
    db.providerProfile.count({ where: providerWhere }),
    db.providerProfile.count({ where: { ...providerWhere, isAvailable: true } }),
    db.providerProfile.count({ where: { ...providerWhere, verificationStatus: 'VERIFIED' } }),
    db.userSubscription.count({ where: { status: 'ACTIVE' } }),
    db.booking.count({ where: bookingWhere }),
    db.booking.count({ where: { ...bookingWhere, bookingStatus: 'COMPLETED' } }),
    db.consultationBooking.count({
      where: {
        ...consultationWhere,
        status: { in: ['REQUESTED', 'ACCEPTED'] },
      },
    }),
    db.callbackRequest.count({ where: { ...callbackWhere, status: 'NEW' } }),
    db.article.count({ where: { isPublished: true } }),
    db.review.aggregate({
      _avg: { rating: true },
    }),
  ]);

  return {
    totalCustomers,
    totalProviders,
    activeProviders,
    verifiedProviders,
    activeSubscriptions,
    totalBookings,
    completedBookings,
    activeConsultations,
    pendingCallbacks,
    publishedArticles,
    avgProviderRating: ratingsAgg._avg.rating ? Number(ratingsAgg._avg.rating.toFixed(2)) : 0,
  };
}

/**
 * 2. BOOKINGS ANALYTICS
 */
export async function getBookingsAnalytics(filters: AnalyticsFilters) {
  const where = getBookingWhereClause(filters);

  // Fetch bookings in range
  const bookings = await db.booking.findMany({
    where,
    select: {
      createdAt: true,
      bookingStatus: true,
      city: true,
      category: { select: { name: true } },
    },
  });

  // Daily trend
  const dailyTrend: Record<string, number> = {};
  // Monthly trend
  const monthlyTrend: Record<string, number> = {};
  // Status counts
  const statusDistribution: Record<string, number> = {};
  // Category counts
  const categoryDistribution: Record<string, number> = {};
  // City counts
  const cityDistribution: Record<string, number> = {};

  bookings.forEach((b) => {
    // Daily grouping (YYYY-MM-DD)
    const day = b.createdAt.toISOString().split('T')[0];
    dailyTrend[day] = (dailyTrend[day] || 0) + 1;

    // Monthly grouping (YYYY-MM)
    const month = day.substring(0, 7);
    monthlyTrend[month] = (monthlyTrend[month] || 0) + 1;

    // Status
    statusDistribution[b.bookingStatus] = (statusDistribution[b.bookingStatus] || 0) + 1;

    // Category
    const catName = b.category?.name || 'Unknown';
    categoryDistribution[catName] = (categoryDistribution[catName] || 0) + 1;

    // City
    const city = b.city || 'Unknown';
    cityDistribution[city] = (cityDistribution[city] || 0) + 1;
  });

  return {
    total: bookings.length,
    dailyTrend: Object.entries(dailyTrend).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
    monthlyTrend: Object.entries(monthlyTrend).map(([month, count]) => ({ month, count })).sort((a, b) => a.month.localeCompare(b.month)),
    statusDistribution,
    categoryDistribution,
    cityDistribution,
  };
}

/**
 * 3. PROVIDERS ANALYTICS
 */
export async function getProvidersAnalytics(filters: AnalyticsFilters) {
  const where = getProviderWhereClause(filters);

  const [
    providers,
    awaitingVerification,
    categoryGroups,
    cityGroups,
  ] = await Promise.all([
    db.providerProfile.findMany({
      where,
      include: {
        reviews: { select: { rating: true } },
        bookings: { select: { id: true } },
      },
    }),
    db.providerProfile.findMany({
      where: { ...where, verificationStatus: 'PENDING' },
      select: {
        id: true,
        fullName: true,
        businessName: true,
        city: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
    db.providerProfile.groupBy({
      where,
      by: ['categoryId'],
      _count: { id: true },
    }),
    db.providerProfile.groupBy({
      where,
      by: ['city'],
      _count: { id: true },
    }),
  ]);

  // Compute calculated metrics
  const mapped = providers.map((p) => {
    const totalRating = p.reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = p.reviews.length > 0 ? Number((totalRating / p.reviews.length).toFixed(2)) : 0;
    return {
      id: p.id,
      fullName: p.fullName,
      businessName: p.businessName,
      city: p.city,
      avgRating,
      bookingCount: p.bookings.length,
    };
  });

  // Top Rated Providers
  const topRated = [...mapped].sort((a, b) => b.avgRating - a.avgRating).slice(0, 5);

  // Most Booked Providers
  const mostBooked = [...mapped].sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 5);

  // Resolve Category Names
  const categories = await db.serviceCategory.findMany({ select: { id: true, name: true } });
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const providersByCategory = categoryGroups.map((g) => ({
    categoryName: categoryMap.get(g.categoryId) || 'Unknown',
    count: g._count.id,
  }));

  const providersByCity = cityGroups.map((g) => ({
    city: g.city,
    count: g._count.id,
  }));

  return {
    totalProviders: providers.length,
    topRated,
    mostBooked,
    awaitingVerification,
    providersByCategory,
    providersByCity,
  };
}

/**
 * 4. CUSTOMER ANALYTICS
 */
export async function getCustomersAnalytics(filters: AnalyticsFilters) {
  const customerWhere = getCustomerWhereClause(filters);

  const [
    customers,
    bookings,
    activeSubsCount,
  ] = await Promise.all([
    db.customerProfile.findMany({
      where: customerWhere,
      include: {
        bookings: { select: { id: true } },
      },
    }),
    db.booking.findMany({
      select: { customerId: true, customer: { select: { fullName: true } } },
    }),
    db.userSubscription.count({ where: { status: 'ACTIVE' } }),
  ]);

  let newCustomers = 0;
  let returningCustomers = 0;

  customers.forEach((c) => {
    if (c.bookings.length > 1) {
      returningCustomers++;
    } else {
      newCustomers++;
    }
  });

  // Most active customers (group bookings by customer)
  const clientBookingCounts: Record<string, { name: string; count: number }> = {};
  bookings.forEach((b) => {
    if (!b.customerId) return;
    const name = b.customer?.fullName || 'Client';
    if (!clientBookingCounts[b.customerId]) {
      clientBookingCounts[b.customerId] = { name, count: 0 };
    }
    clientBookingCounts[b.customerId].count++;
  });

  const mostActiveCustomers = Object.values(clientBookingCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const subscriptionAdoptionRate =
    customers.length > 0 ? Number((activeSubsCount / customers.length).toFixed(4)) : 0;

  return {
    totalCustomers: customers.length,
    newCustomers,
    returningCustomers,
    mostActiveCustomers,
    subscriptionAdoptionRate,
  };
}

/**
 * 5. REVENUE & SUBSCRIPTION ANALYTICS
 */
export async function getSubscriptionsAnalytics(_filters: AnalyticsFilters) {
  // Fetch active subscriptions with plan details
  const [activeSubs, allSubs] = await Promise.all([
    db.userSubscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    }),
    db.userSubscription.findMany({
      include: { plan: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // Aggregate Revenue stats
  const totalActiveRevenue = activeSubs.reduce((sum, s) => sum + s.plan.price, 0);

  // Revenue splits by Tier/Plan
  const revenueByPlan: Record<string, number> = {};
  activeSubs.forEach((s) => {
    revenueByPlan[s.plan.name] = (revenueByPlan[s.plan.name] || 0) + s.plan.price;
  });

  // Monthly Revenue Trend
  const monthlyRevenueTrend: Record<string, number> = {};
  allSubs.forEach((s) => {
    const month = s.createdAt.toISOString().substring(0, 7); // YYYY-MM
    monthlyRevenueTrend[month] = (monthlyRevenueTrend[month] || 0) + s.plan.price;
  });

  const activeCount = activeSubs.length;
  const expiredCount = allSubs.length - activeCount;

  return {
    totalActiveRevenue,
    revenueByPlan,
    monthlyRevenueTrend: Object.entries(monthlyRevenueTrend).map(([month, revenue]) => ({
      month,
      revenue,
    })),
    statusBreakdown: {
      active: activeCount,
      expired: expiredCount,
    },
  };
}

/**
 * 6. CONSULTATION ANALYTICS
 */
export async function getConsultationsAnalytics(filters: AnalyticsFilters) {
  const where = getConsultationWhereClause(filters);

  const consultations = await db.consultationBooking.findMany({
    where,
    include: {
      provider: { select: { fullName: true, businessName: true } },
    },
  });

  const total = consultations.length;
  const completed = consultations.filter((c) => c.status === 'COMPLETED').length;
  const conversionRate = total > 0 ? Number((completed / total).toFixed(4)) : 0;

  // Top Consultants (providers with most completed consultations)
  const consultantCounts: Record<string, { name: string; count: number }> = {};
  consultations.forEach((c) => {
    if (c.status !== 'COMPLETED') return;
    const name = c.provider?.fullName || 'Provider Partner';
    if (!consultantCounts[c.providerId]) {
      consultantCounts[c.providerId] = { name, count: 0 };
    }
    consultantCounts[c.providerId].count++;
  });

  const topConsultants = Object.values(consultantCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalConsultations: total,
    completedConsultations: completed,
    conversionRate,
    topConsultants,
  };
}

/**
 * 7. CALLBACK ANALYTICS
 */
export async function getCallbacksAnalytics(filters: AnalyticsFilters) {
  const where = getCallbackWhereClause(filters);

  const callbacks = await db.callbackRequest.findMany({
    where,
  });

  const total = callbacks.length;
  const pending = callbacks.filter((c) => c.status === 'NEW').length;
  const convertedToConsultation = callbacks.filter((c) => c.status === 'CONSULTATION_BOOKED').length;
  const convertedToBooking = callbacks.filter((c) => c.status === 'SERVICE_BOOKED').length;

  // Average response time in hours (difference between callbackDate/updatedAt and createdAt)
  let responseTimesSum = 0;
  let responseCount = 0;

  callbacks.forEach((c) => {
    if (c.status !== 'NEW') {
      const completionTime = c.callbackDate ? new Date(c.callbackDate) : new Date(c.updatedAt);
      const diffMs = completionTime.getTime() - new Date(c.createdAt).getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours > 0) {
        responseTimesSum += diffHours;
        responseCount++;
      }
    }
  });

  const avgResponseTimeHours =
    responseCount > 0 ? Number((responseTimesSum / responseCount).toFixed(2)) : 0;

  return {
    totalCallbacks: total,
    pendingCallbacks: pending,
    convertedToConsultation,
    convertedToBooking,
    avgResponseTimeHours,
  };
}

/**
 * 8. CONTENT HUB ANALYTICS
 */
export async function getContentAnalytics(_filters: AnalyticsFilters) {
  const articles = await db.article.findMany({
    include: {
      category: { select: { name: true } },
    },
    orderBy: { viewsCount: 'desc' },
  });

  const topViews = articles.slice(0, 5).map((a) => ({
    id: a.id,
    title: a.title,
    viewsCount: a.viewsCount,
  }));

  // Category views mapping
  const categoryViews: Record<string, number> = {};
  articles.forEach((a) => {
    const catName = a.category?.name || 'Uncategorized';
    categoryViews[catName] = (categoryViews[catName] || 0) + a.viewsCount;
  });

  const totalConsultationConversions = articles.reduce((sum, a) => sum + a.consultationConversions, 0);
  const totalCallbackConversions = articles.reduce((sum, a) => sum + a.callbackConversions, 0);

  return {
    topViewedArticles: topViews,
    categoryViews,
    totalConsultationConversions,
    totalCallbackConversions,
  };
}
