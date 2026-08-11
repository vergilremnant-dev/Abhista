export interface OverviewData {
  totalCustomers: number;
  totalProviders: number;
  activeProviders: number;
  verifiedProviders: number;
  activeSubscriptions: number;
  totalBookings: number;
  completedBookings: number;
  activeConsultations: number;
  pendingCallbacks: number;
  publishedArticles: number;
  avgProviderRating: number;
}

export interface BookingsData {
  total: number;
  dailyTrend: { date: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
  statusDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  cityDistribution: Record<string, number>;
}

export interface ProvidersData {
  totalProviders: number;
  topRated: {
    id: string;
    fullName: string;
    businessName: string | null;
    city: string;
    avgRating: number;
    bookingCount: number;
  }[];
  mostBooked: {
    id: string;
    fullName: string;
    businessName: string | null;
    city: string;
    avgRating: number;
    bookingCount: number;
  }[];
  awaitingVerification: {
    id: string;
    fullName: string;
    businessName: string | null;
    city: string;
    createdAt: string;
  }[];
  providersByCategory: { categoryName: string; count: number }[];
  providersByCity: { city: string; count: number }[];
}

export interface CustomersData {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  mostActiveCustomers: { name: string; count: number }[];
  subscriptionAdoptionRate: number;
}

export interface SubscriptionsData {
  totalActiveRevenue: number;
  revenueByPlan: Record<string, number>;
  monthlyRevenueTrend: { month: string; revenue: number }[];
  statusBreakdown: { active: number; expired: number };
}

export interface ConsultationsData {
  totalConsultations: number;
  completedConsultations: number;
  conversionRate: number;
  topConsultants: { name: string; count: number }[];
}

export interface CallbacksData {
  totalCallbacks: number;
  pendingCallbacks: number;
  convertedToConsultation: number;
  convertedToBooking: number;
  avgResponseTimeHours: number;
}

export interface ContentData {
  topViewedArticles: { id: string; title: string; viewsCount: number }[];
  categoryViews: Record<string, number>;
  totalConsultationConversions: number;
  totalCallbackConversions: number;
}

export interface AnalyticsFilterParams {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
  city?: string;
}
