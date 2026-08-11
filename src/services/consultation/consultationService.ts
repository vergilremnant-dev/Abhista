import { axiosClient } from '../auth/axiosClient';
import type {
  ConsultationBooking,
  ConsultationAvailability,
  CreateConsultationRequest,
} from '../../types/consultation/consultationTypes';

export const consultationApi = {
  // Customer APIs
  async createBooking(request: CreateConsultationRequest): Promise<ConsultationBooking> {
    const response = await axiosClient.post<{ success: boolean; data: ConsultationBooking }>(
      '/api/consultations',
      request
    );
    return response.data.data;
  },

  async listMyConsultations(): Promise<ConsultationBooking[]> {
    const response = await axiosClient.get<{ success: boolean; data: ConsultationBooking[] }>(
      '/api/consultations/my'
    );
    return response.data.data;
  },

  async getConsultationDetail(id: string): Promise<ConsultationBooking> {
    const response = await axiosClient.get<{ success: boolean; data: ConsultationBooking }>(
      `/api/consultations/${id}`
    );
    return response.data.data;
  },

  async cancelConsultation(id: string): Promise<ConsultationBooking> {
    const response = await axiosClient.patch<{ success: boolean; data: ConsultationBooking }>(
      `/api/consultations/${id}/cancel`
    );
    return response.data.data;
  },

  // Provider APIs
  async listProviderConsultations(): Promise<ConsultationBooking[]> {
    const response = await axiosClient.get<{ success: boolean; data: ConsultationBooking[] }>(
      '/api/provider/consultations'
    );
    return response.data.data;
  },

  async acceptConsultation(id: string, meetingLink?: string): Promise<ConsultationBooking> {
    const response = await axiosClient.patch<{ success: boolean; data: ConsultationBooking }>(
      `/api/provider/consultations/${id}/accept`,
      { meetingLink }
    );
    return response.data.data;
  },

  async rejectConsultation(id: string, providerNotes?: string): Promise<ConsultationBooking> {
    const response = await axiosClient.patch<{ success: boolean; data: ConsultationBooking }>(
      `/api/provider/consultations/${id}/reject`,
      { providerNotes }
    );
    return response.data.data;
  },

  async rescheduleConsultation(id: string, newDate: string, newTime: string): Promise<ConsultationBooking> {
    const response = await axiosClient.patch<{ success: boolean; data: ConsultationBooking }>(
      `/api/provider/consultations/${id}/reschedule`,
      { newDate, newTime }
    );
    return response.data.data;
  },

  async completeConsultation(id: string, providerNotes?: string): Promise<ConsultationBooking> {
    const response = await axiosClient.patch<{ success: boolean; data: ConsultationBooking }>(
      `/api/provider/consultations/${id}/complete`,
      { providerNotes }
    );
    return response.data.data;
  },

  async getAvailability(): Promise<ConsultationAvailability[]> {
    const response = await axiosClient.get<{ success: boolean; data: ConsultationAvailability[] }>(
      '/api/provider/availability'
    );
    return response.data.data;
  },

  async updateAvailability(availabilities: Partial<ConsultationAvailability>[]): Promise<void> {
    await axiosClient.put('/api/provider/availability', { availabilities });
  },

  // Admin APIs
  async adminListConsultations(): Promise<ConsultationBooking[]> {
    const response = await axiosClient.get<{ success: boolean; data: ConsultationBooking[] }>(
      '/api/admin/consultations'
    );
    return response.data.data;
  },

  async adminUpdateConsultation(id: string, data: Partial<ConsultationBooking>): Promise<ConsultationBooking> {
    const response = await axiosClient.patch<{ success: boolean; data: ConsultationBooking }>(
      `/api/admin/consultations/${id}`,
      data
    );
    return response.data.data;
  },
};
export type { ConsultationBooking, ConsultationAvailability, CreateConsultationRequest };
