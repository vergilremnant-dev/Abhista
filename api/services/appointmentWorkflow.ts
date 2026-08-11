import { AppointmentStatus } from '@prisma/client';

export const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  DRAFT: ['SCHEDULED', 'CANCELLED'],
  SCHEDULED: ['PENDING_CONFIRMATION', 'CANCELLED'],
  PENDING_CONFIRMATION: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['REMINDER_SENT', 'IN_PROGRESS', 'RESCHEDULED', 'CANCELLED'],
  REMINDER_SENT: ['IN_PROGRESS', 'RESCHEDULED', 'NO_SHOW', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'NO_SHOW', 'CANCELLED'],
  COMPLETED: ['ARCHIVED'],
  ARCHIVED: [],
  CANCELLED: [],
  RESCHEDULED: ['PENDING_CONFIRMATION', 'CANCELLED'],
  NO_SHOW: ['ARCHIVED'],
  EXPIRED: ['ARCHIVED'],
  REJECTED: ['ARCHIVED'],
};

export function isValidTransition(from: AppointmentStatus, to: AppointmentStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[from] || [];
  return allowed.includes(to);
}

export function validateTransition(from: AppointmentStatus, to: AppointmentStatus): void {
  if (!isValidTransition(from, to)) {
    throw new Error(`Invalid status transition from ${from} to ${to}`);
  }
}
