import { db } from '../_utils/../_utils/db.js';
import { BookingStatus } from '@prisma/client';

export interface CreateBookingInput {
  providerId: string;
  categoryId: number;
  preferredDate: string;
  preferredTime: string;
  customerAddress: string;
  city: string;
  state: string;
  notes?: string | null;
  estimatedBudget?: number | null;
}

export async function createBooking(customerId: string, input: CreateBookingInput) {
  // 1. Fetch customer profile to get user context
  const customer = await db.customerProfile.findUnique({
    where: { id: customerId },
    include: { user: true },
  });
  if (!customer) {
    throw new Error('Customer profile not found');
  }

  // 2. Fetch provider profile
  const provider = await db.providerProfile.findUnique({
    where: { id: input.providerId },
    include: { user: true },
  });
  if (!provider) {
    throw new Error('Selected provider does not exist');
  }

  // 3. Validations
  if (!provider.isAvailable) {
    throw new Error('Provider is currently unavailable for bookings');
  }

  if (provider.userId === customer.userId) {
    throw new Error('Forbidden: You cannot book your own provider profile');
  }

  const preferredDate = new Date(input.preferredDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (preferredDate < today) {
    throw new Error('Preferred date cannot be in the past');
  }

  if (!input.customerAddress || input.customerAddress.trim() === '') {
    throw new Error('Customer address is required');
  }
  if (!input.city || input.city.trim() === '') {
    throw new Error('City is required');
  }
  if (!input.state || input.state.trim() === '') {
    throw new Error('State is required');
  }

  // 4. Generate unique Booking Number
  const bookingNumber = `BK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 5. Create Booking
  const booking = await db.booking.create({
    data: {
      customerId: customer.id,
      providerId: provider.id,
      categoryId: Number(input.categoryId),
      bookingNumber,
      bookingStatus: BookingStatus.REQUESTED,
      preferredDate,
      preferredTime: input.preferredTime,
      customerAddress: input.customerAddress,
      city: input.city,
      state: input.state,
      notes: input.notes,
      estimatedBudget: input.estimatedBudget ? Number(input.estimatedBudget) : null,
    },
    include: {
      customer: true,
      provider: true,
      category: true,
    },
  });

  // 6. Trigger Notification for Provider
  await db.notification.create({
    data: {
      userId: provider.userId,
      title: 'New Booking Request',
      content: `You have received a new booking request ${bookingNumber} from ${customer.fullName} for ${booking.category.name}.`,
    },
  });

  return booking;
}

export async function getMyBookings(customerId: string) {
  return await db.booking.findMany({
    where: { customerId },
    include: {
      provider: true,
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getProviderBookings(providerId: string) {
  return await db.booking.findMany({
    where: { providerId },
    include: {
      customer: true,
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getBookingById(id: string) {
  const booking = await db.booking.findFirst({
    where: {
      OR: [
        { id },
        { bookingNumber: id },
      ],
    },
    include: {
      customer: true,
      provider: true,
      category: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  return booking;
}

export async function cancelBooking(bookingId: string, customerId: string) {
  const booking = await db.booking.findFirst({
    where: {
      OR: [
        { id: bookingId },
        { bookingNumber: bookingId },
      ],
    },
    include: { provider: true, customer: true },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.customerId !== customerId) {
    throw new Error('Unauthorized: You can only cancel your own bookings');
  }

  const updated = await db.booking.update({
    where: { id: booking.id },
    data: { bookingStatus: BookingStatus.CANCELLED },
    include: { provider: true, customer: true, category: true },
  });

  // Trigger Notification for Provider
  if (booking.provider?.userId) {
    await db.notification.create({
      data: {
        userId: booking.provider.userId,
        title: 'Booking Cancelled',
        content: `Booking request ${booking.bookingNumber} was cancelled by the customer.`,
      },
    });
  }

  return updated;
}

export async function acceptBooking(bookingId: string, providerId: string) {
  const booking = await db.booking.findFirst({
    where: {
      OR: [
        { id: bookingId },
        { bookingNumber: bookingId },
      ],
    },
    include: { customer: true, provider: true },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.providerId !== providerId) {
    throw new Error('Unauthorized: You can only accept bookings submitted to you');
  }

  const updated = await db.booking.update({
    where: { id: booking.id },
    data: { bookingStatus: BookingStatus.ACCEPTED },
    include: { customer: true, provider: true, category: true },
  });

  // Trigger Notification for Customer
  if (booking.customer?.userId) {
    await db.notification.create({
      data: {
        userId: booking.customer.userId,
        title: 'Booking Accepted',
        content: `Your booking request ${booking.bookingNumber} has been accepted by ${updated.provider.fullName}.`,
      },
    });
  }

  return updated;
}

export async function rejectBooking(bookingId: string, providerId: string) {
  const booking = await db.booking.findFirst({
    where: {
      OR: [
        { id: bookingId },
        { bookingNumber: bookingId },
      ],
    },
    include: { customer: true, provider: true },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.providerId !== providerId) {
    throw new Error('Unauthorized: You can only reject bookings submitted to you');
  }

  const updated = await db.booking.update({
    where: { id: booking.id },
    data: { bookingStatus: BookingStatus.REJECTED },
    include: { customer: true, provider: true, category: true },
  });

  // Trigger Notification for Customer
  if (booking.customer?.userId) {
    await db.notification.create({
      data: {
        userId: booking.customer.userId,
        title: 'Booking Rejected',
        content: `Your booking request ${booking.bookingNumber} has been declined by ${updated.provider.fullName}.`,
      },
    });
  }

  return updated;
}

export async function startBooking(bookingId: string, providerId: string) {
  const booking = await db.booking.findFirst({
    where: {
      OR: [
        { id: bookingId },
        { bookingNumber: bookingId },
      ],
    },
    include: { customer: true, provider: true },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.providerId !== providerId) {
    throw new Error('Unauthorized: You can only start bookings assigned to you');
  }

  const updated = await db.booking.update({
    where: { id: booking.id },
    data: { bookingStatus: BookingStatus.IN_PROGRESS },
    include: { customer: true, provider: true, category: true },
  });

  // Trigger Notification for Customer
  if (booking.customer?.userId) {
    await db.notification.create({
      data: {
        userId: booking.customer.userId,
        title: 'Booking In Progress',
        content: `Your booking ${booking.bookingNumber} has been started by ${updated.provider.fullName}.`,
      },
    });
  }

  return updated;
}

export async function completeBooking(bookingId: string, providerId: string) {
  const booking = await db.booking.findFirst({
    where: {
      OR: [
        { id: bookingId },
        { bookingNumber: bookingId },
      ],
    },
    include: { customer: true, provider: true },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.providerId !== providerId) {
    throw new Error('Unauthorized: You can only complete bookings assigned to you');
  }

  const updated = await db.booking.update({
    where: { id: booking.id },
    data: { bookingStatus: BookingStatus.COMPLETED },
    include: { customer: true, provider: true, category: true },
  });

  // Increment provider total bookings
  try {
    await db.providerProfile.update({
      where: { id: providerId },
      data: { totalBookings: { increment: 1 } },
    });
  } catch (e) {
    console.error('Failed to increment provider totalBookings:', e);
  }

  // Trigger Notification for Customer
  if (booking.customer?.userId) {
    await db.notification.create({
      data: {
        userId: booking.customer.userId,
        title: 'Booking Completed',
        content: `The booking request ${booking.bookingNumber} has been marked as completed by ${updated.provider.fullName}.`,
      },
    });
  }

  return updated;
}

// Admin operations
export async function adminGetBookings() {
  return await db.booking.findMany({
    include: {
      customer: true,
      provider: true,
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function adminUpdateBookingStatus(id: string, status: string) {
  if (!Object.values(BookingStatus).includes(status as BookingStatus)) {
    throw new Error('Invalid booking status');
  }

  const booking = await db.booking.findFirst({
    where: {
      OR: [
        { id },
        { bookingNumber: id },
      ],
    },
  });
  if (!booking) {
    throw new Error('Booking not found');
  }

  return await db.booking.update({
    where: { id: booking.id },
    data: { bookingStatus: status as BookingStatus },
    include: {
      customer: true,
      provider: true,
      category: true,
    },
  });
}
