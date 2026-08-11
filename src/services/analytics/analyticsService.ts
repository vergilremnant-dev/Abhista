import { axiosClient } from '../auth/axiosClient';
import type {
  OverviewData,
  BookingsData,
  ProvidersData,
  CustomersData,
  SubscriptionsData,
  ConsultationsData,
  CallbacksData,
  ContentData,
  AnalyticsFilterParams,
} from '../../types/analytics/analyticsTypes';

export const analyticsApi = {
  async getOverview(params?: AnalyticsFilterParams): Promise<OverviewData> {
    const response = await axiosClient.get<{ success: boolean; data: OverviewData }>(
      '/api/admin/analytics/overview',
      { params }
    );
    return response.data.data;
  },

  async getBookings(params?: AnalyticsFilterParams): Promise<BookingsData> {
    const response = await axiosClient.get<{ success: boolean; data: BookingsData }>(
      '/api/admin/analytics/bookings',
      { params }
    );
    return response.data.data;
  },

  async getProviders(params?: AnalyticsFilterParams): Promise<ProvidersData> {
    const response = await axiosClient.get<{ success: boolean; data: ProvidersData }>(
      '/api/admin/analytics/providers',
      { params }
    );
    return response.data.data;
  },

  async getCustomers(params?: AnalyticsFilterParams): Promise<CustomersData> {
    const response = await axiosClient.get<{ success: boolean; data: CustomersData }>(
      '/api/admin/analytics/customers',
      { params }
    );
    return response.data.data;
  },

  async getSubscriptions(params?: AnalyticsFilterParams): Promise<SubscriptionsData> {
    const response = await axiosClient.get<{ success: boolean; data: SubscriptionsData }>(
      '/api/admin/analytics/subscriptions',
      { params }
    );
    return response.data.data;
  },

  async getConsultations(params?: AnalyticsFilterParams): Promise<ConsultationsData> {
    const response = await axiosClient.get<{ success: boolean; data: ConsultationsData }>(
      '/api/admin/analytics/consultations',
      { params }
    );
    return response.data.data;
  },

  async getCallbacks(params?: AnalyticsFilterParams): Promise<CallbacksData> {
    const response = await axiosClient.get<{ success: boolean; data: CallbacksData }>(
      '/api/admin/analytics/callbacks',
      { params }
    );
    return response.data.data;
  },

  async getContent(params?: AnalyticsFilterParams): Promise<ContentData> {
    const response = await axiosClient.get<{ success: boolean; data: ContentData }>(
      '/api/admin/analytics/content',
      { params }
    );
    return response.data.data;
  },
};
