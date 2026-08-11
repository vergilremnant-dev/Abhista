export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  durationDays: number;
  description: string | null;
  features: unknown;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface UserSubscription {
  id: string;
  userId: string;
  planId: number;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  transactionReference: string | null;
  createdAt: string;
  plan?: SubscriptionPlan | null;
}

export interface CreatePlanRequest {
  name: string;
  price: number;
  durationDays: number;
  description?: string | null;
  features?: unknown;
}

export interface UpdatePlanRequest {
  name?: string;
  price?: number;
  durationDays?: number;
  description?: string | null;
  features?: unknown;
  isActive?: boolean;
}
