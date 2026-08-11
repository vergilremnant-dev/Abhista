import { axiosClient } from '../auth/axiosClient';
import type {
  ProviderDashboardOverview,
  ProviderPerformance,
  ProviderCalendar,
} from '../../types/providerDashboard/providerDashboardTypes';

export const providerDashboardApi = {
  async getOverview(): Promise<ProviderDashboardOverview> {
    const response = await axiosClient.get<{ success: boolean; data: ProviderDashboardOverview }>(
      '/api/provider/dashboard'
    );
    return response.data.data;
  },

  async getPerformance(): Promise<ProviderPerformance> {
    const response = await axiosClient.get<{ success: boolean; data: ProviderPerformance }>(
      '/api/provider/performance'
    );
    return response.data.data;
  },

  async getCalendar(): Promise<ProviderCalendar> {
    const response = await axiosClient.get<{ success: boolean; data: ProviderCalendar }>(
      '/api/provider/calendar'
    );
    return response.data.data;
  },

  async toggleBlockedDate(request: {
    date: string;
    reason?: string;
    action: 'BLOCK' | 'UNBLOCK';
  }): Promise<unknown> {
    const response = await axiosClient.post<{ success: boolean; data: unknown }>(
      '/api/provider/calendar/blocked-dates',
      request
    );
    return response.data.data;
  },

  async saveAvailability(
    slots: { dayOfWeek: number; startTime: string; endTime: string; isAvailable?: boolean }[]
  ): Promise<unknown> {
    const response = await axiosClient.post<{ success: boolean; data: unknown }>(
      '/api/provider/calendar/availability',
      slots
    );
    return response.data.data;
  },
};
