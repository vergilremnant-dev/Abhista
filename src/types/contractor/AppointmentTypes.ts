export type AppointmentStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'REMINDER_SENT'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ARCHIVED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NO_SHOW'
  | 'EXPIRED'
  | 'REJECTED';

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  eventType: string;
  status: AppointmentStatus;
  startTime: string;
  endTime: string;
  customerId?: string;
  providerId?: string;
  projectId?: string;
  requirementId?: number;
  meetingLink?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    fullName: string;
  };
  provider?: {
    id: string;
    fullName: string;
  };
  project?: {
    id: string;
    requirement?: {
      title: string;
    };
  };
  resources?: AppointmentResource[];
}

export interface AppointmentResource {
  id: string;
  appointmentId: string;
  resourceName: string;
  resourceType: string;
  quantity: number;
}

export interface AvailabilityBlock {
  id: string;
  providerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}
