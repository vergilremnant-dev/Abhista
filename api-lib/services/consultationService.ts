import { db } from '../utils/db.js';
import { verifyActiveSubscription } from './subscriptionService.js';
import { ConsultationStatus } from '@prisma/client';

export function parseTimeToMinutes(timeStr: string): number {
  const clean = timeStr.trim().toUpperCase();
  const isAmPm = clean.endsWith('AM') || clean.endsWith('PM');

  if (isAmPm) {
    const ampm = clean.slice(-2);
    const timeParts = clean.slice(0, -2).trim().split(':');
    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1] || '0', 10);

    if (ampm === 'PM' && hours < 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    return hours * 60 + minutes;
  } else {
    const timeParts = clean.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1] || '0', 10);
    return hours * 60 + minutes;
  }
}

/**
 * Validates availability and overlap constraints for a provider.
 */
export async function validateProviderAvailability(
  providerId: string,
  dateStr: string,
  timeStr: string,
  durationMinutes: number,
  bufferMinutes: number = 15,
  excludeBookingId?: string
) {
  const scheduledDate = new Date(dateStr);
  if (isNaN(scheduledDate.getTime())) {
    throw new Error('Invalid scheduledDate format');
  }

  // Prevent past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (scheduledDate < today) {
    throw new Error('Cannot schedule consultations in the past');
  }

  const dayOfWeek = scheduledDate.getDay(); // 0 (Sunday) to 6 (Saturday)
  const reqStart = parseTimeToMinutes(timeStr);
  const reqEnd = reqStart + durationMinutes;

  // 1. Check weekly availability template
  const availability = await db.consultationAvailability.findFirst({
    where: {
      providerId,
      dayOfWeek,
      isAvailable: true,
    },
  });

  if (!availability) {
    throw new Error('Provider is not available for consultations on this day of the week');
  }

  const availStart = parseTimeToMinutes(availability.startTime);
  const availEnd = parseTimeToMinutes(availability.endTime);

  if (reqStart < availStart || reqEnd > availEnd) {
    throw new Error(
      `Booking time falls outside the provider's active hours (${availability.startTime} to ${availability.endTime})`
    );
  }

  // 2. Overlap Check: Avoid overlaps with other non-cancelled, non-rejected bookings
  const existingBookings = await db.consultationBooking.findMany({
    where: {
      providerId,
      scheduledDate: {
        gte: new Date(scheduledDate.setHours(0, 0, 0, 0)),
        lt: new Date(scheduledDate.setHours(23, 59, 59, 999)),
      },
      status: {
        in: [ConsultationStatus.REQUESTED, ConsultationStatus.ACCEPTED, ConsultationStatus.RESCHEDULED],
      },
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
    },
  });

  for (const b of existingBookings) {
    const existStart = parseTimeToMinutes(b.scheduledTime);
    // Add buffer time to the existing booking's end
    const existEnd = existStart + b.durationMinutes + bufferMinutes;

    // Check overlap: requested start is before existing end and requested end is after existing start
    if (reqStart < existEnd && (reqEnd + bufferMinutes) > existStart) {
      throw new Error('Time slot overlaps with an existing consultation booking');
    }
  }
}

/**
 * Creates a consultation request for a customer.
 */
export async function createConsultationBooking(userId: string, input: any) {
  // 1. Verify Active Subscription
  const isActive = await verifyActiveSubscription(userId);
  if (!isActive) {
    throw new Error('An active subscription is required to book an expert consultation');
  }

  const customer = await db.customerProfile.findUnique({
    where: { userId },
  });
  if (!customer) {
    throw new Error('Customer profile not found');
  }

  const provider = await db.providerProfile.findUnique({
    where: { id: input.providerId },
    include: { user: true },
  });
  if (!provider) {
    throw new Error('Provider profile not found');
  }

  if (!provider.canProvideConsultation) {
    throw new Error('This provider is not registered to offer expert consultations');
  }

  const duration = input.durationMinutes ? Number(input.durationMinutes) : 30;
  const buffer = input.bufferMinutes ? Number(input.bufferMinutes) : 15;

  // 2. Validate availability & overlaps
  await validateProviderAvailability(
    provider.id,
    input.scheduledDate,
    input.scheduledTime,
    duration,
    buffer
  );

  const bookingNumber = `CNS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const booking = await db.consultationBooking.create({
    data: {
      bookingNumber,
      customerId: customer.id,
      providerId: provider.id,
      consultationTopic: input.consultationTopic,
      consultationType: input.consultationType,
      scheduledDate: new Date(input.scheduledDate),
      scheduledTime: input.scheduledTime,
      durationMinutes: duration,
      customerNotes: input.customerNotes || null,
      status: ConsultationStatus.REQUESTED,
    },
  });

  // Notification for Provider
  await db.notification.create({
    data: {
      userId: provider.userId,
      title: 'New Consultation Request',
      content: `Customer ${customer.fullName} requested a consultation on ${input.scheduledDate} at ${input.scheduledTime}.`,
    },
  });

  return booking;
}

/**
 * Lists consultations booked by a customer.
 */
export async function getCustomerConsultations(userId: string) {
  const customer = await db.customerProfile.findUnique({
    where: { userId },
  });
  if (!customer) {
    throw new Error('Customer profile not found');
  }

  return db.consultationBooking.findMany({
    where: { customerId: customer.id },
    include: {
      provider: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Load single consultation details (accessible to customer, provider, or admin).
 */
export async function getConsultationDetail(id: string, userId: string, role: string) {
  const booking = await db.consultationBooking.findUnique({
    where: { id },
    include: {
      customer: true,
      provider: true,
    },
  });

  if (!booking) {
    throw new Error('Consultation booking not found');
  }

  // Access validation check
  if (role === 'ADMIN') return booking;
  if (role === 'PROVIDER' && booking.provider.userId === userId) return booking;
  if (role === 'CUSTOMER' && booking.customer.userId === userId) return booking;

  throw new Error('Forbidden: You do not have access to view this consultation');
}

/**
 * Cancels a consultation (Customer action).
 */
export async function cancelConsultation(id: string, userId: string) {
  const customer = await db.customerProfile.findUnique({
    where: { userId },
  });
  if (!customer) {
    throw new Error('Customer profile not found');
  }

  const booking = await db.consultationBooking.findFirst({
    where: { id, customerId: customer.id },
    include: { provider: true },
  });

  if (!booking) {
    throw new Error('Consultation booking not found');
  }

  if (booking.status === ConsultationStatus.CANCELLED || booking.status === ConsultationStatus.COMPLETED) {
    throw new Error(`Cannot cancel a consultation that is already ${booking.status}`);
  }

  const updated = await db.consultationBooking.update({
    where: { id },
    data: { status: ConsultationStatus.CANCELLED },
  });

  // Notification for Provider
  await db.notification.create({
    data: {
      userId: booking.provider.userId,
      title: 'Consultation Cancelled',
      content: `Consultation ${booking.bookingNumber} has been cancelled by the customer.`,
    },
  });

  return updated;
}

/**
 * Incoming consultations for a provider.
 */
export async function getProviderConsultations(userId: string) {
  const provider = await db.providerProfile.findUnique({
    where: { userId },
  });
  if (!provider) {
    throw new Error('Provider profile not found');
  }

  return db.consultationBooking.findMany({
    where: { providerId: provider.id },
    include: {
      customer: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Accepts a consultation and attaches a meeting link.
 */
export async function acceptConsultation(id: string, userId: string, meetingLink?: string) {
  const provider = await db.providerProfile.findUnique({
    where: { userId },
  });
  if (!provider) {
    throw new Error('Provider profile not found');
  }

  const booking = await db.consultationBooking.findFirst({
    where: { id, providerId: provider.id },
    include: { customer: true },
  });

  if (!booking) {
    throw new Error('Consultation booking not found');
  }

  if (booking.status !== ConsultationStatus.REQUESTED) {
    throw new Error(`Cannot accept a booking that is currently ${booking.status}`);
  }

  const updated = await db.consultationBooking.update({
    where: { id },
    data: {
      status: ConsultationStatus.ACCEPTED,
      meetingLink: meetingLink || null,
    },
  });

  // Notification for Customer
  await db.notification.create({
    data: {
      userId: booking.customer.userId,
      title: 'Consultation Accepted',
      content: `Your consultation request ${booking.bookingNumber} has been accepted by ${provider.fullName}.`,
    },
  });

  return updated;
}

/**
 * Rejects an incoming consultation.
 */
export async function rejectConsultation(id: string, userId: string, providerNotes?: string) {
  const provider = await db.providerProfile.findUnique({
    where: { userId },
  });
  if (!provider) {
    throw new Error('Provider profile not found');
  }

  const booking = await db.consultationBooking.findFirst({
    where: { id, providerId: provider.id },
    include: { customer: true },
  });

  if (!booking) {
    throw new Error('Consultation booking not found');
  }

  if (booking.status !== ConsultationStatus.REQUESTED) {
    throw new Error(`Cannot reject a booking that is currently ${booking.status}`);
  }

  const updated = await db.consultationBooking.update({
    where: { id },
    data: {
      status: ConsultationStatus.CANCELLED,
      providerNotes: providerNotes || null,
    },
  });

  // Notification for Customer
  await db.notification.create({
    data: {
      userId: booking.customer.userId,
      title: 'Consultation Rejected',
      content: `Your consultation request ${booking.bookingNumber} has been rejected/declined.`,
    },
  });

  return updated;
}

/**
 * Reschedules a consultation booking.
 */
export async function rescheduleConsultation(
  id: string,
  userId: string,
  newDate: string,
  newTime: string
) {
  const provider = await db.providerProfile.findUnique({
    where: { userId },
  });
  if (!provider) {
    throw new Error('Provider profile not found');
  }

  const booking = await db.consultationBooking.findFirst({
    where: { id, providerId: provider.id },
    include: { customer: true },
  });

  if (!booking) {
    throw new Error('Consultation booking not found');
  }

  // Validate new slot
  await validateProviderAvailability(
    provider.id,
    newDate,
    newTime,
    booking.durationMinutes,
    15,
    id
  );

  const updated = await db.consultationBooking.update({
    where: { id },
    data: {
      status: ConsultationStatus.RESCHEDULED,
      scheduledDate: new Date(newDate),
      scheduledTime: newTime,
    },
  });

  // Notification for Customer
  await db.notification.create({
    data: {
      userId: booking.customer.userId,
      title: 'Consultation Rescheduled',
      content: `Your consultation request ${booking.bookingNumber} has been rescheduled to ${newDate} at ${newTime}.`,
    },
  });

  return updated;
}

/**
 * Marks consultation as completed.
 */
export async function completeConsultation(id: string, userId: string, providerNotes?: string) {
  const provider = await db.providerProfile.findUnique({
    where: { userId },
  });
  if (!provider) {
    throw new Error('Provider profile not found');
  }

  const booking = await db.consultationBooking.findFirst({
    where: { id, providerId: provider.id },
    include: { customer: true },
  });

  if (!booking) {
    throw new Error('Consultation booking not found');
  }

  if (booking.status !== ConsultationStatus.ACCEPTED && booking.status !== ConsultationStatus.RESCHEDULED) {
    throw new Error(`Cannot mark booking as completed from status ${booking.status}`);
  }

  const updated = await db.consultationBooking.update({
    where: { id },
    data: {
      status: ConsultationStatus.COMPLETED,
      providerNotes: providerNotes || null,
    },
  });

  // Increment total consultation counter
  await db.providerProfile.update({
    where: { id: provider.id },
    data: { totalConsultations: { increment: 1 } },
  });

  // Notification for Customer
  await db.notification.create({
    data: {
      userId: booking.customer.userId,
      title: 'Consultation Completed',
      content: `Your consultation ${booking.bookingNumber} has been successfully completed.`,
    },
  });

  return updated;
}

/**
 * Gets weekly availabilities for a provider.
 */
export async function getProviderAvailability(userId: string) {
  const provider = await db.providerProfile.findUnique({
    where: { userId },
  });
  if (!provider) {
    throw new Error('Provider profile not found');
  }

  return db.consultationAvailability.findMany({
    where: { providerId: provider.id },
    orderBy: { dayOfWeek: 'asc' },
  });
}

/**
 * Configures availability weekly schedule.
 */
export async function updateProviderAvailability(userId: string, availabilities: any[]) {
  const provider = await db.providerProfile.findUnique({
    where: { userId },
  });
  if (!provider) {
    throw new Error('Provider profile not found');
  }

  // Use a transaction to reset and create
  return db.$transaction(async (tx) => {
    await tx.consultationAvailability.deleteMany({
      where: { providerId: provider.id },
    });

    const data = availabilities.map((a) => ({
      providerId: provider.id,
      dayOfWeek: Number(a.dayOfWeek),
      startTime: a.startTime,
      endTime: a.endTime,
      isAvailable: a.isAvailable !== undefined ? Boolean(a.isAvailable) : true,
    }));

    return tx.consultationAvailability.createMany({
      data,
    });
  });
}

/**
 * Admins view all consultations.
 */
export async function adminGetConsultations() {
  return db.consultationBooking.findMany({
    include: {
      customer: true,
      provider: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Admin updates booking (resolves disputes).
 */
export async function adminUpdateConsultation(id: string, data: any) {
  const booking = await db.consultationBooking.findUnique({
    where: { id },
  });

  if (!booking) {
    throw new Error('Consultation booking not found');
  }

  return db.consultationBooking.update({
    where: { id },
    data: {
      status: data.status || undefined,
      meetingLink: data.meetingLink || undefined,
      providerNotes: data.providerNotes || undefined,
    },
  });
}
