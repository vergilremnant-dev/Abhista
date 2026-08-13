import { db } from '../_utils/../_utils/db.js';

/**
 * Returns provider profile associated with target user.
 */
export async function getProviderProfileOrThrow(userId: string) {
  const provider = await db.providerProfile.findUnique({
    where: { userId },
  });
  if (!provider) {
    throw new Error('Access Denied: Provider profile not found');
  }
  return provider;
}

/**
 * Calculates Profile Completion Percentage.
 */
export function calculateProfileCompletion(provider: any, portfolioCount: number) {
  let score = 0;
  if (provider.description && provider.description.trim()) score += 15;
  if (provider.businessName && provider.businessName.trim()) score += 10;
  if (provider.profileImage && provider.profileImage.trim()) score += 10;
  if (provider.coverImage && provider.coverImage.trim()) score += 10;
  if (provider.serviceAreas && provider.serviceAreas.trim()) score += 10;
  if (provider.experienceYears > 0) score += 10;
  if (provider.consultationFee > 0) score += 10;
  
  if (portfolioCount > 0) {
    score += portfolioCount === 1 ? 15 : 25;
  }
  
  return score;
}

/**
 * 1. GET PROVIDER WORKSPACE OVERVIEW
 */
export async function getDashboardOverview(userId: string) {
  const provider = await getProviderProfileOrThrow(userId);

  // Fetch counts in parallel
  const [
    pendingBookings,
    acceptedBookings,
    totalReviews,
    ratingsAgg,
    portfolioCount,
    activeSub,
    todayBookingsCount,
    upcomingConsultationsCount,
  ] = await Promise.all([
    db.booking.count({ where: { providerId: provider.id, bookingStatus: 'REQUESTED' } }),
    db.booking.count({ where: { providerId: provider.id, bookingStatus: { in: ['ACCEPTED', 'IN_PROGRESS'] } } }),
    db.review.count({ where: { providerId: provider.id } }),
    db.review.aggregate({
      where: { providerId: provider.id },
      _avg: { rating: true },
    }),
    db.portfolio.count({ where: { providerId: provider.id } }),
    db.userSubscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { plan: true },
    }),
    // Bookings scheduled for today
    db.booking.count({
      where: {
        providerId: provider.id,
        bookingStatus: { not: 'CANCELLED' },
        preferredDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    // Consultations starting today or in future
    db.consultationBooking.count({
      where: {
        providerId: provider.id,
        status: { in: ['REQUESTED', 'ACCEPTED'] },
        scheduledDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  const completionPercent = calculateProfileCompletion(provider, portfolioCount);
  const activeSubscription = activeSub?.plan.name || 'Free Tier';

  // Mock views counters based on reviews & bookings
  const bookingsSeed = provider.totalBookings || 1;
  const portfolioViews = bookingsSeed * 8 + 14;
  const profileViews = bookingsSeed * 12 + 42;

  const avgRating = ratingsAgg._avg.rating ? Number(ratingsAgg._avg.rating.toFixed(2)) : 0;

  return {
    pendingBookings,
    acceptedBookings,
    todayBookings: todayBookingsCount,
    upcomingConsultations: upcomingConsultationsCount,
    averageRating: avgRating,
    totalReviews,
    portfolioViews,
    profileViews,
    activeSubscription,
    profileCompletionPercentage: completionPercent,
  };
}

/**
 * 2. GET PERFORMANCE STATS
 */
export async function getPerformanceMetrics(userId: string) {
  const provider = await getProviderProfileOrThrow(userId);

  const [bookings, consultations, repeatGroups, reviews] = await Promise.all([
    db.booking.findMany({
      where: { providerId: provider.id },
      select: { createdAt: true },
    }),
    db.consultationBooking.findMany({
      where: { providerId: provider.id },
      select: { createdAt: true },
    }),
    db.booking.groupBy({
      by: ['customerId'],
      where: { providerId: provider.id },
      _count: { id: true },
    }),
    db.review.findMany({
      where: { providerId: provider.id },
      select: { createdAt: true, rating: true },
    }),
  ]);

  // Aggregate monthly bookings/consultations (past 6 months)
  const bookingTrends: Record<string, number> = {};
  const consultationTrends: Record<string, number> = {};
  const reviewTrends: Record<string, { sum: number; count: number }> = {};

  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStr = d.toISOString().substring(0, 7); // YYYY-MM
    bookingTrends[mStr] = 0;
    consultationTrends[mStr] = 0;
    reviewTrends[mStr] = { sum: 0, count: 0 };
  }

  bookings.forEach((b) => {
    const mStr = b.createdAt.toISOString().substring(0, 7);
    if (bookingTrends[mStr] !== undefined) {
      bookingTrends[mStr]++;
    }
  });

  consultations.forEach((c) => {
    const mStr = c.createdAt.toISOString().substring(0, 7);
    if (consultationTrends[mStr] !== undefined) {
      consultationTrends[mStr]++;
    }
  });

  reviews.forEach((r) => {
    const mStr = r.createdAt.toISOString().substring(0, 7);
    if (reviewTrends[mStr] !== undefined) {
      reviewTrends[mStr].sum += r.rating;
      reviewTrends[mStr].count++;
    }
  });

  const monthlyRatings = Object.entries(reviewTrends).map(([month, details]) => ({
    month,
    avgRating: details.count > 0 ? Number((details.sum / details.count).toFixed(2)) : 0,
  }));

  const repeatCustomersCount = repeatGroups.filter((g) => g._count.id > 1).length;

  return {
    bookingTrends: Object.entries(bookingTrends).map(([month, count]) => ({ month, count })),
    consultationTrends: Object.entries(consultationTrends).map(([month, count]) => ({ month, count })),
    monthlyRatings,
    repeatCustomers: repeatCustomersCount,
  };
}

/**
 * 3. GET CALENDAR SCHEDULES
 */
export async function getCalendarSchedule(userId: string) {
  const provider = await getProviderProfileOrThrow(userId);

  const [bookings, consultations, blockedDates] = await Promise.all([
    db.booking.findMany({
      where: { providerId: provider.id },
      select: {
        id: true,
        bookingNumber: true,
        bookingStatus: true,
        preferredDate: true,
        preferredTime: true,
        customer: { select: { fullName: true } },
      },
    }),
    db.consultationBooking.findMany({
      where: { providerId: provider.id },
      select: {
        id: true,
        bookingNumber: true,
        status: true,
        scheduledDate: true,
        scheduledTime: true,
        customer: { select: { fullName: true } },
      },
    }),
    db.blockedDate.findMany({
      where: { providerId: provider.id },
      select: { date: true, reason: true },
    }),
  ]);

  return {
    bookings: bookings.map((b) => ({
      id: b.id,
      title: `Job Booking: ${b.customer?.fullName || 'Client'} (${b.bookingStatus})`,
      date: b.preferredDate,
      time: b.preferredTime,
      type: 'BOOKING',
      reference: b.bookingNumber,
    })),
    consultations: consultations.map((c) => ({
      id: c.id,
      title: `Consultation: ${c.customer?.fullName || 'Client'} (${c.status})`,
      date: c.scheduledDate,
      time: c.scheduledTime,
      type: 'CONSULTATION',
      reference: c.bookingNumber,
    })),
    blockedDates: blockedDates.map((d) => ({
      date: d.date,
      reason: d.reason || 'Blocked',
      type: 'BLOCKED',
    })),
  };
}

/**
 * 4. TOGGLE BLOCKED DATES
 */
export async function toggleBlockedDate(
  userId: string,
  input: { date: string; reason?: string; action: 'BLOCK' | 'UNBLOCK' }
) {
  const provider = await getProviderProfileOrThrow(userId);
  const targetDate = new Date(input.date);

  // Set time limits to normalize date matches
  targetDate.setHours(0, 0, 0, 0);

  if (input.action === 'BLOCK') {
    const existing = await db.blockedDate.findFirst({
      where: {
        providerId: provider.id,
        date: targetDate,
      },
    });
    if (existing) return existing;

    return await db.blockedDate.create({
      data: {
        providerId: provider.id,
        date: targetDate,
        reason: input.reason || 'Blocked Out',
      },
    });
  } else {
    await db.blockedDate.deleteMany({
      where: {
        providerId: provider.id,
        date: targetDate,
      },
    });
    return { success: true };
  }
}

/**
 * 5. SAVE CONSULTATION SLOTS AVAILABILITY
 */
export async function saveAvailabilitySettings(
  userId: string,
  slots: { dayOfWeek: number; startTime: string; endTime: string; isAvailable?: boolean }[]
) {
  const provider = await getProviderProfileOrThrow(userId);

  // Clear existing settings
  await db.consultationAvailability.deleteMany({
    where: { providerId: provider.id },
  });

  // Create new slots
  await db.consultationAvailability.createMany({
    data: slots.map((s) => ({
      providerId: provider.id,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      isAvailable: s.isAvailable !== undefined ? s.isAvailable : true,
    })),
  });

  return { success: true };
}
