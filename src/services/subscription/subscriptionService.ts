import { axiosClient } from '../auth/axiosClient';
import type {
  SubscriptionPlan,
  UserSubscription,
  CreatePlanRequest,
  UpdatePlanRequest,
} from '../../types/subscription/subscriptionTypes';

export const subscriptionApi = {
  // Customer APIs
  async listPlans(): Promise<SubscriptionPlan[]> {
    const response = await axiosClient.get<{ success: boolean; data: SubscriptionPlan[] }>(
      '/api/subscriptions/plans'
    );
    return response.data.data;
  },

  async getMySubscription(): Promise<UserSubscription | null> {
    const response = await axiosClient.get<{ success: boolean; data: UserSubscription | null }>(
      '/api/subscriptions/my'
    );
    return response.data.data;
  },

  async activateSubscription(planId: number): Promise<UserSubscription> {
    const response = await axiosClient.post<{ success: boolean; message: string; data: UserSubscription }>(
      '/api/subscriptions/activate',
      { planId }
    );
    return response.data.data;
  },

  async cancelSubscription(): Promise<UserSubscription> {
    const response = await axiosClient.post<{ success: boolean; message: string; data: UserSubscription }>(
      '/api/subscriptions/cancel'
    );
    return response.data.data;
  },

  // Admin APIs
  async adminCreatePlan(request: CreatePlanRequest): Promise<SubscriptionPlan> {
    const response = await axiosClient.post<{ success: boolean; message: string; data: SubscriptionPlan }>(
      '/api/admin/subscriptions/plans',
      request
    );
    return response.data.data;
  },

  async adminUpdatePlan(id: number, request: UpdatePlanRequest): Promise<SubscriptionPlan> {
    const response = await axiosClient.put<{ success: boolean; message: string; data: SubscriptionPlan }>(
      `/api/admin/subscriptions/plans/${id}`,
      request
    );
    return response.data.data;
  },

  async adminDeletePlan(id: number): Promise<SubscriptionPlan> {
    const response = await axiosClient.delete<{ success: boolean; message: string; data: SubscriptionPlan }>(
      `/api/admin/subscriptions/plans/${id}`
    );
    return response.data.data;
  },

  async createRazorpayOrder(planId: number): Promise<{ orderId: string; amount: number; currency: string; keyId: string }> {
    const response = await axiosClient.post<{
      success: boolean;
      data: { orderId: string; amount: number; currency: string; keyId: string };
    }>('/api/subscriptions/create-order', { planId });
    return response.data.data;
  },

  async verifyRazorpayPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<UserSubscription> {
    const response = await axiosClient.post<{
      success: boolean;
      data: UserSubscription;
    }>('/api/subscriptions/verify-payment', {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    return response.data.data;
  },
};
