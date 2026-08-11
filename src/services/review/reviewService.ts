import { axiosClient } from '../auth/axiosClient';
import type { Review, RatingSummary, SubmitReviewRequest } from '../../types/review/reviewTypes';

export const reviewApi = {
  // Public APIs
  async getProviderReviews(providerId: string): Promise<Review[]> {
    const response = await axiosClient.get<{ success: boolean; data: Review[] }>(
      `/api/providers/${providerId}/reviews`
    );
    return response.data.data;
  },

  async getProviderRatingSummary(providerId: string): Promise<RatingSummary> {
    const response = await axiosClient.get<{ success: boolean; data: RatingSummary }>(
      `/api/providers/${providerId}/rating-summary`
    );
    return response.data.data;
  },

  // Customer APIs
  async submitReview(request: SubmitReviewRequest): Promise<Review> {
    const response = await axiosClient.post<{ success: boolean; data: Review }>(
      '/api/reviews',
      request
    );
    return response.data.data;
  },

  async updateReview(id: string, request: Partial<SubmitReviewRequest>): Promise<Review> {
    const response = await axiosClient.put<{ success: boolean; data: Review }>(
      `/api/reviews/${id}`,
      request
    );
    return response.data.data;
  },

  async deleteReview(id: string): Promise<void> {
    await axiosClient.delete(`/api/reviews/${id}`);
  },

  async getMyReviews(): Promise<Review[]> {
    const response = await axiosClient.get<{ success: boolean; data: Review[] }>(
      '/api/reviews/my'
    );
    return response.data.data;
  },

  // Provider APIs
  async submitReply(reviewId: string, responseText: string): Promise<Review> {
    const response = await axiosClient.post<{ success: boolean; data: Review }>(
      `/api/provider/reviews/${reviewId}/reply`,
      { response: responseText }
    );
    return response.data.data;
  },

  async getProviderReviewsForSelf(): Promise<Review[]> {
    const response = await axiosClient.get<{ success: boolean; data: Review[] }>(
      '/api/provider/reviews'
    );
    return response.data.data;
  },

  // Admin APIs
  async adminListReviews(): Promise<Review[]> {
    const response = await axiosClient.get<{ success: boolean; data: Review[] }>(
      '/api/admin/reviews'
    );
    return response.data.data;
  },

  async adminHideReview(id: string): Promise<Review> {
    const response = await axiosClient.patch<{ success: boolean; data: Review }>(
      `/api/admin/reviews/${id}/hide`
    );
    return response.data.data;
  },

  async adminRestoreReview(id: string): Promise<Review> {
    const response = await axiosClient.patch<{ success: boolean; data: Review }>(
      `/api/admin/reviews/${id}/restore`
    );
    return response.data.data;
  },

  async adminDeleteReview(id: string): Promise<void> {
    await axiosClient.delete(`/api/admin/reviews/${id}`);
  },
};
