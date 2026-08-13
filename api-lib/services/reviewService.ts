import { db } from '../utils/db.js';

/**
 * Re-aggregates a provider's ratings from visible reviews and persists it.
 */
export async function recalculateProviderRatings(providerId: string) {
  const reviews = await db.review.findMany({
    where: {
      providerId,
      isVisible: true,
    },
    select: {
      rating: true,
    },
  });

  const totalReviews = reviews.length;
  let sum = 0;
  let r1 = 0, r2 = 0, r3 = 0, r4 = 0, r5 = 0;

  for (const r of reviews) {
    sum += r.rating;
    if (r.rating === 1) r1++;
    else if (r.rating === 2) r2++;
    else if (r.rating === 3) r3++;
    else if (r.rating === 4) r4++;
    else if (r.rating === 5) r5++;
  }

  const averageRating = totalReviews > 0 ? Number((sum / totalReviews).toFixed(1)) : 0.0;

  await db.providerProfile.update({
    where: { id: providerId },
    data: {
      averageRating,
      totalReviews,
      rating1Count: r1,
      rating2Count: r2,
      rating3Count: r3,
      rating4Count: r4,
      rating5Count: r5,
    },
  });
}

/**
 * Submits a new review for a provider.
 */
export async function submitReview(
  customerId: string,
  input: {
    providerId: string;
    bookingId?: string;
    consultationBookingId?: string;
    rating: number;
    reviewTitle: string;
    reviewDescription: string;
    wouldRecommend?: boolean;
  }
) {
  const rating = Number(input.rating);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  if (!input.reviewTitle || !input.reviewTitle.trim()) {
    throw new Error('Review title is required');
  }
  if (!input.reviewDescription || !input.reviewDescription.trim()) {
    throw new Error('Review description is required');
  }
  if (!input.bookingId && !input.consultationBookingId) {
    throw new Error('A review must be linked to a completed booking or consultation');
  }

  // Fetch profiles
  const customer = await db.customerProfile.findUnique({
    where: { id: customerId },
  });
  if (!customer) {
    throw new Error('Customer profile not found');
  }

  const provider = await db.providerProfile.findUnique({
    where: { id: input.providerId },
  });
  if (!provider) {
    throw new Error('Provider not found');
  }

  // Prevent self review
  if (customer.userId === provider.userId) {
    throw new Error('You cannot submit a review for yourself');
  }

  let isVerified = false;

  // Validate Booking Linkage
  if (input.bookingId) {
    const booking = await db.booking.findUnique({
      where: { id: input.bookingId },
    });
    if (!booking) {
      throw new Error('Booking not found');
    }
    if (booking.customerId !== customerId) {
      throw new Error('You can only review bookings created by you');
    }
    if (booking.providerId !== input.providerId) {
      throw new Error('Booking provider mismatch');
    }
    if (booking.bookingStatus !== 'COMPLETED') {
      throw new Error('Only completed bookings can be reviewed');
    }

    // Check duplicate
    const existing = await db.review.findUnique({
      where: { bookingId: input.bookingId },
    });
    if (existing) {
      throw new Error('You have already submitted a review for this booking');
    }
    isVerified = true;
  }

  // Validate Consultation Linkage
  if (input.consultationBookingId) {
    const consultation = await db.consultationBooking.findUnique({
      where: { id: input.consultationBookingId },
    });
    if (!consultation) {
      throw new Error('Consultation not found');
    }
    if (consultation.customerId !== customerId) {
      throw new Error('You can only review consultations booked by you');
    }
    if (consultation.providerId !== input.providerId) {
      throw new Error('Consultation provider mismatch');
    }
    if (consultation.status !== 'COMPLETED') {
      throw new Error('Only completed consultations can be reviewed');
    }

    // Check duplicate
    const existing = await db.review.findUnique({
      where: { consultationBookingId: input.consultationBookingId },
    });
    if (existing) {
      throw new Error('You have already submitted a review for this consultation');
    }
    isVerified = true;
  }

  // Create review
  const review = await db.review.create({
    data: {
      customerId,
      providerId: input.providerId,
      bookingId: input.bookingId || null,
      consultationBookingId: input.consultationBookingId || null,
      rating,
      reviewTitle: input.reviewTitle.trim(),
      reviewDescription: input.reviewDescription.trim(),
      wouldRecommend: input.wouldRecommend !== undefined ? input.wouldRecommend : true,
      isVerified,
      isVisible: true,
    },
  });

  // Aggregation
  await recalculateProviderRatings(input.providerId);

  // Notify Provider
  try {
    await db.notification.create({
      data: {
        userId: provider.userId,
        title: 'New Review Submitted',
        content: `${customer.fullName} left a ${rating}★ review on your profile.`,
      },
    });
  } catch (err) {
    console.error('Failed to notify provider', err);
  }

  return review;
}

/**
 * Updates a customer review.
 */
export async function updateReview(
  customerId: string,
  reviewId: string,
  input: {
    rating?: number;
    reviewTitle?: string;
    reviewDescription?: string;
    wouldRecommend?: boolean;
  }
) {
  const review = await db.review.findUnique({
    where: { id: reviewId },
  });
  if (!review) {
    throw new Error('Review not found');
  }
  if (review.customerId !== customerId) {
    throw new Error('Unauthorized to update this review');
  }

  const dataToUpdate: any = {};
  if (input.rating !== undefined) {
    const rating = Number(input.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    dataToUpdate.rating = rating;
  }
  if (input.reviewTitle !== undefined) {
    if (!input.reviewTitle.trim()) {
      throw new Error('Review title cannot be empty');
    }
    dataToUpdate.reviewTitle = input.reviewTitle.trim();
  }
  if (input.reviewDescription !== undefined) {
    if (!input.reviewDescription.trim()) {
      throw new Error('Review description cannot be empty');
    }
    dataToUpdate.reviewDescription = input.reviewDescription.trim();
  }
  if (input.wouldRecommend !== undefined) {
    dataToUpdate.wouldRecommend = input.wouldRecommend;
  }

  const updatedReview = await db.review.update({
    where: { id: reviewId },
    data: dataToUpdate,
  });

  // Re-aggregate
  await recalculateProviderRatings(review.providerId);

  return updatedReview;
}

/**
 * Deletes a customer review.
 */
export async function deleteReview(customerId: string, reviewId: string) {
  const review = await db.review.findUnique({
    where: { id: reviewId },
  });
  if (!review) {
    throw new Error('Review not found');
  }
  if (review.customerId !== customerId) {
    throw new Error('Unauthorized to delete this review');
  }

  await db.review.delete({
    where: { id: reviewId },
  });

  // Re-aggregate
  await recalculateProviderRatings(review.providerId);

  return { success: true };
}

/**
 * Provider replies to a review.
 */
export async function submitProviderReply(providerId: string, reviewId: string, response: string) {
  const review = await db.review.findUnique({
    where: { id: reviewId },
    include: {
      customer: true,
    },
  });
  if (!review) {
    throw new Error('Review not found');
  }
  if (review.providerId !== providerId) {
    throw new Error('Unauthorized to reply to this review');
  }

  const updated = await db.review.update({
    where: { id: reviewId },
    data: {
      providerResponse: response ? response.trim() : null,
    },
  });

  // Notify customer
  try {
    await db.notification.create({
      data: {
        userId: review.customer.userId,
        title: 'Provider Replied to Review',
        content: `A provider replied to your review: "${response.substring(0, 40)}..."`,
      },
    });
  } catch (err) {
    console.error('Failed to notify customer', err);
  }

  return updated;
}

/**
 * Admin hides a review.
 */
export async function hideReview(reviewId: string) {
  const review = await db.review.findUnique({
    where: { id: reviewId },
  });
  if (!review) {
    throw new Error('Review not found');
  }

  const updated = await db.review.update({
    where: { id: reviewId },
    data: { isVisible: false },
  });

  await recalculateProviderRatings(review.providerId);
  return updated;
}

/**
 * Admin restores a review.
 */
export async function restoreReview(reviewId: string) {
  const review = await db.review.findUnique({
    where: { id: reviewId },
  });
  if (!review) {
    throw new Error('Review not found');
  }

  const updated = await db.review.update({
    where: { id: reviewId },
    data: { isVisible: true },
  });

  await recalculateProviderRatings(review.providerId);
  return updated;
}

/**
 * Admin deletes a review.
 */
export async function adminDeleteReview(reviewId: string) {
  const review = await db.review.findUnique({
    where: { id: reviewId },
  });
  if (!review) {
    throw new Error('Review not found');
  }

  await db.review.delete({
    where: { id: reviewId },
  });

  await recalculateProviderRatings(review.providerId);
  return { success: true };
}
