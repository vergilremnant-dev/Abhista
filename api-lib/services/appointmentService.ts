import { db } from '../utils/db.js';
import { AppointmentStatus } from '@prisma/client';
import { validateTransition } from './appointmentWorkflow.js';

export interface CreateAppointmentInput {
  title: string;
  description?: string;
  eventType?: string;
  startTime: Date;
  endTime: Date;
  customerId?: string;
  providerId?: string;
  projectId?: string;
  requirementId?: number;
  resources?: { resourceName: string; resourceType: string; quantity?: number }[];
}

export interface AvailabilityBlockInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export async function checkConflict(
  providerId: string,
  startTime: Date,
  endTime: Date,
  excludeAppointmentId?: string
): Promise<boolean> {
  const overlap = await db.appointment.findFirst({
    where: {
      providerId,
      status: {
        notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.REJECTED],
      },
      id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
      OR: [
        {
          startTime: { lte: startTime },
          endTime: { gt: startTime },
        },
        {
          startTime: { lt: endTime },
          endTime: { gte: endTime },
        },
        {
          startTime: { gte: startTime },
          endTime: { lte: endTime },
        },
      ],
    },
  });

  return !!overlap;
}

export async function queueRemindersForAppointment(appointmentId: string, customerUserId: string, providerUserId: string) {
  const appointment = await db.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) return;

  const reminderTime = new Date(appointment.startTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours prior

  await db.reminderQueue.createMany({
    data: [
      {
        appointmentId,
        recipientId: customerUserId,
        reminderType: 'EMAIL',
        scheduledSendTime: reminderTime,
      },
      {
        appointmentId,
        recipientId: providerUserId,
        reminderType: 'EMAIL',
        scheduledSendTime: reminderTime,
      },
    ],
  });
}

export async function createAppointment(input: CreateAppointmentInput) {
  if (input.startTime >= input.endTime) {
    throw new Error('Appointment end time must be after the start time');
  }

  if (input.providerId) {
    // 1. Check double bookings conflict
    const hasConflict = await checkConflict(input.providerId, input.startTime, input.endTime);
    if (hasConflict) {
      throw new Error('Scheduling conflict: The provider is already booked at this time slot');
    }

    // 2. Check provider availability blocks
    const dayOfWeek = input.startTime.getUTCDay();
    const startHourStr = input.startTime.getUTCHours().toString().padStart(2, '0') + ':' + input.startTime.getUTCMinutes().toString().padStart(2, '0');
    const endHourStr = input.endTime.getUTCHours().toString().padStart(2, '0') + ':' + input.endTime.getUTCMinutes().toString().padStart(2, '0');

    const blocks = await db.availabilityBlock.findMany({
      where: {
        providerId: input.providerId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (blocks.length > 0) {
      const match = blocks.some((b) => b.startTime <= startHourStr && b.endTime >= endHourStr);
      if (!match) {
        throw new Error('Scheduling error: Requested time falls outside provider working hours availability');
      }
    }
  }

  return await db.$transaction(async (tx) => {
    const appointment = await tx.appointment.create({
      data: {
        title: input.title,
        description: input.description || null,
        eventType: input.eventType || 'CONSULTATION',
        startTime: input.startTime,
        endTime: input.endTime,
        customerId: input.customerId || null,
        providerId: input.providerId || null,
        projectId: input.projectId || null,
        requirementId: input.requirementId || null,
        status: AppointmentStatus.PENDING_CONFIRMATION,
      },
      include: {
        customer: true,
        provider: true,
      },
    });

    if (input.resources && input.resources.length > 0) {
      const res = input.resources.map((r) => ({
        appointmentId: appointment.id,
        resourceName: r.resourceName,
        resourceType: r.resourceType,
        quantity: r.quantity || 1,
      }));
      await tx.appointmentResource.createMany({ data: res });
    }

    // Queue reminders if users exist
    if (appointment.customer?.userId && appointment.provider?.userId) {
      const reminderTime = new Date(appointment.startTime.getTime() - 24 * 60 * 60 * 1000);
      await tx.reminderQueue.createMany({
        data: [
          {
            appointmentId: appointment.id,
            recipientId: appointment.customer.userId,
            reminderType: 'EMAIL',
            scheduledSendTime: reminderTime,
          },
          {
            appointmentId: appointment.id,
            recipientId: appointment.provider.userId,
            reminderType: 'EMAIL',
            scheduledSendTime: reminderTime,
          },
        ],
      });
    }

    return appointment;
  });
}

export async function getAppointmentById(id: string) {
  return await db.appointment.findUnique({
    where: { id },
    include: {
      customer: true,
      provider: true,
      project: true,
      requirement: true,
      resources: true,
      reminders: true,
    },
  });
}

export async function transitionAppointmentStatus(appointmentId: string, userId: string, newStatus: AppointmentStatus) {
  const existing = await db.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!existing) {
    throw new Error('Appointment not found');
  }

  // Validate state transitions
  validateTransition(existing.status, newStatus);

  return await db.appointment.update({
    where: { id: appointmentId },
    data: { status: newStatus },
  });
}

export async function setProviderAvailabilityBlocks(providerId: string, blocks: AvailabilityBlockInput[]) {
  return await db.$transaction(async (tx) => {
    // 1. Wipe existing availability blocks
    await tx.availabilityBlock.deleteMany({
      where: { providerId },
    });

    // 2. Insert new blocks
    const data = blocks.map((b) => ({
      providerId,
      dayOfWeek: b.dayOfWeek,
      startTime: b.startTime,
      endTime: b.endTime,
      isActive: b.isActive !== undefined ? b.isActive : true,
    }));

    await tx.availabilityBlock.createMany({ data });

    return await tx.availabilityBlock.findMany({
      where: { providerId },
    });
  });
}

export async function getProviderAvailableSlots(providerId: string, date: Date): Promise<string[]> {
  const dayOfWeek = date.getUTCDay();

  // 1. Get working blocks
  const blocks = await db.availabilityBlock.findMany({
    where: { providerId, dayOfWeek, isActive: true },
  });

  if (blocks.length === 0) {
    // Return default hourly working slots 9:00 - 17:00 if no blocks configured
    blocks.push({
      id: 'default',
      providerId,
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
      createdAt: new Date(),
    });
  }

  // 2. Get bookings on this day
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const bookings = await db.appointment.findMany({
    where: {
      providerId,
      status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.REJECTED] },
      startTime: { gte: startOfDay },
      endTime: { lte: endOfDay },
    },
  });

  const slots: string[] = [];

  // Generate hourly intervals inside blocks
  for (const block of blocks) {
    const [startHour] = block.startTime.split(':').map(Number);
    const [endHour] = block.endTime.split(':').map(Number);

    let currentHour = startHour;
    while (currentHour < endHour) {
      const slotTimeStr = currentHour.toString().padStart(2, '0') + ':00';
      
      // Check if slot overlaps with any active bookings
      const slotStart = new Date(date);
      slotStart.setUTCHours(currentHour, 0, 0, 0);
      const slotEnd = new Date(date);
      slotEnd.setUTCHours(currentHour + 1, 0, 0, 0);

      const hasBooking = bookings.some((b) => {
        return (
          (b.startTime <= slotStart && b.endTime > slotStart) ||
          (b.startTime < slotEnd && b.endTime >= slotEnd) ||
          (b.startTime >= slotStart && b.endTime <= slotEnd)
        );
      });

      if (!hasBooking) {
        slots.push(slotTimeStr);
      }

      currentHour++;
    }
  }

  return slots;
}
