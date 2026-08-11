import axios from 'axios';
import { axiosClient } from '../auth/axiosClient.js';
import type { Appointment, AvailabilityBlock } from '../../types/contractor/AppointmentTypes.js';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export const AppointmentService = {
  async listAppointments(status?: string): Promise<Appointment[]> {
    try {
      const response = await axiosClient.get<ApiResponse<Appointment[]>>('/api/appointments', {
        params: { status },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load appointments'), { cause: error });
    }
  },

  async getAppointmentDetail(id: string): Promise<Appointment> {
    try {
      const response = await axiosClient.get<ApiResponse<Appointment>>(`/api/appointments/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load appointment details'), { cause: error });
    }
  },

  async bookAppointment(payload: {
    title: string;
    description?: string;
    eventType?: string;
    startTime: string;
    endTime: string;
    providerId?: string;
    projectId?: string;
    requirementId?: number;
    resources?: { resourceName: string; resourceType: string; quantity?: number }[];
  }): Promise<Appointment> {
    try {
      const response = await axiosClient.post<ApiResponse<Appointment>>('/api/appointments', payload);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to book appointment'), { cause: error });
    }
  },

  async getAvailableSlots(providerId: string, date: string): Promise<string[]> {
    try {
      const response = await axiosClient.get<ApiResponse<string[]>>('/api/appointments/availability', {
        params: { providerId, date },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to fetch available time slots'), { cause: error });
    }
  },

  async saveAvailabilityBlocks(blocks: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive?: boolean;
  }[]): Promise<AvailabilityBlock[]> {
    try {
      const response = await axiosClient.put<ApiResponse<AvailabilityBlock[]>>('/api/appointments/availability', {
        blocks,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to save availability blocks'), { cause: error });
    }
  },

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment> {
    try {
      const response = await axiosClient.put<ApiResponse<Appointment>>(`/api/appointments/${id}/status`, {
        status,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to update appointment status'), { cause: error });
    }
  },
};
