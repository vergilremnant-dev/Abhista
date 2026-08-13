import { db } from '../_utils/../_utils/db.js';
import { CallbackStatus } from '@prisma/client';

export interface CreateCallbackInput {
  fullName: string;
  phoneNumber: string;
  email?: string;
  city?: string;
  state?: string;
  preferredLanguage?: string;
  serviceCategoryId?: string | number;
  projectType?: string;
  estimatedBudget?: string | number;
  preferredCallTime?: string;
  message?: string;
  source?: string;
}

/**
 * Creates a new callback request lead.
 */
export async function createCallbackRequest(input: CreateCallbackInput) {
  if (!input.fullName || !input.fullName.trim()) {
    throw new Error('Full name is required');
  }
  if (!input.phoneNumber || !input.phoneNumber.trim()) {
    throw new Error('Phone number is required');
  }

  // Duplicate Check: same phoneNumber in the last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const duplicate = await db.callbackRequest.findFirst({
    where: {
      phoneNumber: input.phoneNumber.trim(),
      createdAt: { gte: oneDayAgo },
    },
  });

  if (duplicate) {
    throw new Error('A callback request has already been submitted for this phone number within the last 24 hours');
  }

  const referenceNumber = `CB-TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const request = await db.callbackRequest.create({
    data: {
      referenceNumber,
      fullName: input.fullName.trim(),
      phoneNumber: input.phoneNumber.trim(),
      email: input.email ? input.email.trim() : null,
      city: input.city || 'Hyderabad',
      state: input.state || 'Telangana',
      preferredLanguage: input.preferredLanguage || 'Telugu',
      serviceCategoryId: input.serviceCategoryId ? Number(input.serviceCategoryId) : null,
      projectType: input.projectType || 'General Consultation',
      estimatedBudget: input.estimatedBudget ? Number(input.estimatedBudget) : null,
      preferredCallTime: input.preferredCallTime || 'Anytime',
      message: input.message || 'No additional details provided.',
      source: input.source || 'Website',
      status: CallbackStatus.NEW,
    },
  });

  // Notify all Admins
  const admins = await db.user.findMany({
    where: { role: 'ADMIN' },
  });

  for (const admin of admins) {
    await db.notification.create({
      data: {
        userId: admin.id,
        title: 'New Callback Request',
        content: `A new callback request (${referenceNumber}) has been submitted by ${input.fullName}.`,
      },
    });
  }

  return request;
}

/**
 * Fetches public-safe status checks using the reference number.
 */
export async function getCallbackStatus(referenceNumber: string) {
  const request = await db.callbackRequest.findUnique({
    where: { referenceNumber },
    include: { category: true },
  });

  if (!request) {
    throw new Error('Callback request not found with the provided reference number');
  }

  // Remove internal notes & assignments before returning to guest
  return {
    referenceNumber: request.referenceNumber,
    fullName: request.fullName,
    phoneNumber: request.phoneNumber,
    status: request.status,
    city: request.city,
    state: request.state,
    projectType: request.projectType,
    preferredCallTime: request.preferredCallTime,
    categoryName: request.category?.name || null,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

/**
 * Admins fetch all callback requests.
 */
export async function adminGetCallbacks() {
  return db.callbackRequest.findMany({
    include: { category: true, provider: true },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Admins fetch single request detail (with internal notes).
 */
export async function adminGetCallbackDetail(id: string) {
  const request = await db.callbackRequest.findUnique({
    where: { id },
    include: { category: true, provider: true },
  });

  if (!request) {
    throw new Error('Callback request not found');
  }

  return request;
}

/**
 * Assigns callback to a Provider or Admin.
 */
export async function adminAssignCallback(
  id: string,
  assignedProviderId?: string,
  assignedAdminId?: string
) {
  const request = await db.callbackRequest.findUnique({
    where: { id },
  });

  if (!request) {
    throw new Error('Callback request not found');
  }

  const updated = await db.callbackRequest.update({
    where: { id },
    data: {
      assignedProviderId: assignedProviderId || null,
      assignedAdminId: assignedAdminId || null,
      status: CallbackStatus.ASSIGNED,
    },
  });

  // Notify targets
  if (assignedProviderId) {
    const provider = await db.providerProfile.findUnique({ where: { id: assignedProviderId } });
    if (provider) {
      await db.notification.create({
        data: {
          userId: provider.userId,
          title: 'Assigned Callback Lead',
          content: `You have been assigned callback lead ${request.referenceNumber} for ${request.fullName}.`,
        },
      });
    }
  }

  return updated;
}

/**
 * Updates status of a callback request.
 */
export async function adminUpdateCallbackStatus(id: string, status: CallbackStatus) {
  const request = await db.callbackRequest.findUnique({
    where: { id },
  });

  if (!request) {
    throw new Error('Callback request not found');
  }

  const updated = await db.callbackRequest.update({
    where: { id },
    data: { status },
  });

  // Notify Admins on conversion
  if (status === CallbackStatus.CONSULTATION_BOOKED || status === CallbackStatus.SERVICE_BOOKED) {
    const admins = await db.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await db.notification.create({
        data: {
          userId: admin.id,
          title: 'Callback Converted',
          content: `Callback lead ${request.referenceNumber} has been marked as ${status}.`,
        },
      });
    }
  }

  return updated;
}

/**
 * Appends internal administrative notes.
 */
export async function adminAddCallbackNotes(id: string, notes: string) {
  const request = await db.callbackRequest.findUnique({
    where: { id },
  });

  if (!request) {
    throw new Error('Callback request not found');
  }

  return db.callbackRequest.update({
    where: { id },
    data: { notes },
  });
}

/**
 * Providers view assigned callback requests.
 */
export async function providerGetCallbacks(userId: string) {
  const provider = await db.providerProfile.findUnique({
    where: { userId },
  });
  if (!provider) {
    throw new Error('Provider profile not found');
  }

  return db.callbackRequest.findMany({
    where: { assignedProviderId: provider.id },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Providers mark lead as contacted.
 */
export async function providerMarkContacted(id: string, userId: string) {
  const provider = await db.providerProfile.findUnique({ where: { userId } });
  if (!provider) throw new Error('Provider profile not found');

  const request = await db.callbackRequest.findFirst({
    where: { id, assignedProviderId: provider.id },
  });

  if (!request) throw new Error('Callback request lead not found or not assigned to you');

  return db.callbackRequest.update({
    where: { id },
    data: { status: CallbackStatus.CONTACTED },
  });
}

/**
 * Providers convert lead to consultation.
 */
export async function providerConvertConsultation(id: string, userId: string) {
  const provider = await db.providerProfile.findUnique({ where: { userId } });
  if (!provider) throw new Error('Provider profile not found');

  const request = await db.callbackRequest.findFirst({
    where: { id, assignedProviderId: provider.id },
  });

  if (!request) throw new Error('Callback request lead not found or not assigned to you');

  const updated = await db.callbackRequest.update({
    where: { id },
    data: { status: CallbackStatus.CONSULTATION_BOOKED },
  });

  // Notify Admins
  const admins = await db.user.findMany({ where: { role: 'ADMIN' } });
  for (const admin of admins) {
    await db.notification.create({
      data: {
        userId: admin.id,
        title: 'Callback Converted to Consultation',
        content: `Lead ${request.referenceNumber} converted to a consultation booking by ${provider.fullName}.`,
      },
    });
  }

  return updated;
}

/**
 * Providers convert lead to service booking.
 */
export async function providerConvertService(id: string, userId: string) {
  const provider = await db.providerProfile.findUnique({ where: { userId } });
  if (!provider) throw new Error('Provider profile not found');

  const request = await db.callbackRequest.findFirst({
    where: { id, assignedProviderId: provider.id },
  });

  if (!request) throw new Error('Callback request lead not found or not assigned to you');

  const updated = await db.callbackRequest.update({
    where: { id },
    data: { status: CallbackStatus.SERVICE_BOOKED },
  });

  // Notify Admins
  const admins = await db.user.findMany({ where: { role: 'ADMIN' } });
  for (const admin of admins) {
    await db.notification.create({
      data: {
        userId: admin.id,
        title: 'Callback Converted to Service Booking',
        content: `Lead ${request.referenceNumber} converted to a service booking by ${provider.fullName}.`,
      },
    });
  }

  return updated;
}

/**
 * Calculates dashboard metrics for callbacks.
 */
export async function getCallbackAnalytics() {
  const total = await db.callbackRequest.count();
  const assigned = await db.callbackRequest.count({ where: { status: CallbackStatus.ASSIGNED } });
  const contacted = await db.callbackRequest.count({ where: { status: CallbackStatus.CONTACTED } });
  const consultationBooked = await db.callbackRequest.count({
    where: { status: CallbackStatus.CONSULTATION_BOOKED },
  });
  const serviceBooked = await db.callbackRequest.count({
    where: { status: CallbackStatus.SERVICE_BOOKED },
  });

  const conversionRate = total > 0 ? (consultationBooked + serviceBooked) / total : 0;

  // Group by serviceCategoryId
  const groupCategory = await db.callbackRequest.groupBy({
    by: ['serviceCategoryId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });

  // Fetch category names
  const topCategories = await Promise.all(
    groupCategory.map(async (gc) => {
      if (!gc.serviceCategoryId) return { name: 'General / Unselected', count: gc._count.id };
      const cat = await db.serviceCategory.findUnique({ where: { id: gc.serviceCategoryId } });
      return { name: cat?.name || 'General', count: gc._count.id };
    })
  );

  // Group by city
  const groupCity = await db.callbackRequest.groupBy({
    by: ['city'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });

  const topCities = groupCity.map((gc) => ({
    city: gc.city,
    count: gc._count.id,
  }));

  return {
    total,
    assigned,
    contacted,
    consultationBooked,
    serviceBooked,
    conversionRate: Number(conversionRate.toFixed(2)),
    topCategories,
    topCities,
  };
}
