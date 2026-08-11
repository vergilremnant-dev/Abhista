import type { CustomerProfile } from '../customer/customerProfileTypes';
import type { ProviderProfile } from '../provider/providerTypes';

export type ConsultationStatus = 'REQUESTED' | 'ACCEPTED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface ConsultationAvailability {
  id: string;
  providerId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationBooking {
  id: string;
  bookingNumber: string;
  customerId: string;
  providerId: string;
  consultationTopic: string;
  consultationType: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  customerNotes?: string | null;
  providerNotes?: string | null;
  meetingLink?: string | null;
  status: ConsultationStatus;
  createdAt: string;
  updatedAt: string;
  customer?: CustomerProfile;
  provider?: ProviderProfile;
}

export interface CreateConsultationRequest {
  providerId: string;
  consultationTopic: string;
  consultationType: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes?: number;
  customerNotes?: string;
}
