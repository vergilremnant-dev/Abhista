import { db } from '../utils/db.js';
import { RequirementStatus } from '@prisma/client';
import { validateTransition } from './workflowService.js';
import { logRequirementHistory } from './auditService.js';

export interface CreateRequirementInput {
  title: string;
  description: string;
  serviceCategory: string;
  serviceCategoryId?: number | null;
  location: string;
  budgetMin: number;
  budgetMax: number;
  preferredStartDate?: Date | null;
  status?: RequirementStatus;
  attachments?: { fileName: string; fileUrl: string; fileType: string }[];
}

export interface UpdateRequirementInput {
  title?: string;
  description?: string;
  serviceCategory?: string;
  serviceCategoryId?: number | null;
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredStartDate?: Date | null;
  status?: RequirementStatus;
}

export async function createRequirement(customerId: string, userId: string, input: CreateRequirementInput) {
  if (input.budgetMin < 0 || input.budgetMax < input.budgetMin) {
    throw new Error('Invalid budget range');
  }

  const initialStatus = input.status || RequirementStatus.DRAFT;

  const requirement = await db.requirement.create({
    data: {
      customerId,
      title: input.title,
      description: input.description,
      serviceCategory: input.serviceCategory,
      serviceCategoryId: input.serviceCategoryId || null,
      location: input.location,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      preferredStartDate: input.preferredStartDate || null,
      status: initialStatus,
    },
  });

  // Log audit history
  await logRequirementHistory({
    requirementId: requirement.id,
    fromStatus: null,
    toStatus: initialStatus,
    changedById: userId,
    changeReason: 'Requirement initialized',
    newValues: {
      title: requirement.title,
      budgetMin: requirement.budgetMin,
      budgetMax: requirement.budgetMax,
    },
  });

  // Create attachments if provided
  if (input.attachments && input.attachments.length > 0) {
    const attachRecords = input.attachments.map((a) => ({
      requirementId: requirement.id,
      fileName: a.fileName,
      fileUrl: a.fileUrl,
      fileType: a.fileType,
    }));
    await db.requirementAttachment.createMany({
      data: attachRecords,
    });
  }

  return requirement;
}

export async function getRequirementById(id: number) {
  return await db.requirement.findUnique({
    where: { id },
    include: {
      customer: true,
      serviceCategoryRel: true,
      attachments: true,
      history: {
        orderBy: { createdAt: 'desc' },
      },
      notes: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function updateRequirement(id: number, userId: string, input: UpdateRequirementInput) {
  const existing = await db.requirement.findUnique({
    where: { id },
    include: { customer: true },
  });

  if (!existing) {
    throw new Error('Requirement not found');
  }

  // Enforce customer ownership check (caller must be the creator, or admin)
  const isOwner = existing.customer.userId === userId;
  const changer = await db.user.findUnique({ where: { id: userId } });
  const isAdmin = changer?.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    throw new Error('Unauthorized update access');
  }

  if (input.budgetMin !== undefined && input.budgetMax !== undefined) {
    if (input.budgetMin < 0 || input.budgetMax < input.budgetMin) {
      throw new Error('Invalid budget range');
    }
  }

  const previousValues: any = {};
  const newValues: any = {};

  if (input.title !== undefined && input.title !== existing.title) {
    previousValues.title = existing.title;
    newValues.title = input.title;
  }
  if (input.budgetMin !== undefined && input.budgetMin !== existing.budgetMin) {
    previousValues.budgetMin = existing.budgetMin;
    newValues.budgetMin = input.budgetMin;
  }
  if (input.budgetMax !== undefined && input.budgetMax !== existing.budgetMax) {
    previousValues.budgetMax = existing.budgetMax;
    newValues.budgetMax = input.budgetMax;
  }

  const updated = await db.requirement.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      serviceCategory: input.serviceCategory,
      serviceCategoryId: input.serviceCategoryId,
      location: input.location,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      preferredStartDate: input.preferredStartDate,
    },
  });

  await logRequirementHistory({
    requirementId: id,
    fromStatus: existing.status,
    toStatus: existing.status,
    changedById: userId,
    changeReason: 'Requirement fields edited',
    previousValues,
    newValues,
  });

  return updated;
}

export async function transitionRequirementStatus(
  id: number,
  userId: string,
  newStatus: RequirementStatus,
  reason?: string
) {
  const existing = await db.requirement.findUnique({
    where: { id },
    include: { customer: true },
  });

  if (!existing) {
    throw new Error('Requirement not found');
  }

  const changer = await db.user.findUnique({ where: { id: userId } });
  const isAdmin = changer?.role === 'ADMIN';
  const isOwner = existing.customer.userId === userId;

  // Validate authorization
  // Customers can cancel drafts/open requests, Admins/Providers can review/approve/publish
  if (newStatus === RequirementStatus.CANCELLED) {
    if (!isOwner && !isAdmin) {
      throw new Error('Unauthorized status cancellation request');
    }
  } else {
    // Other transitions are guarded by Admin/Provider access or system workflows
    if (!isAdmin && changer?.role !== 'PROVIDER' && !isOwner) {
      throw new Error('Unauthorized status transition access');
    }
  }

  // Validate state machine transitions
  validateTransition(existing.status, newStatus);

  const updated = await db.requirement.update({
    where: { id },
    data: { status: newStatus },
  });

  await logRequirementHistory({
    requirementId: id,
    fromStatus: existing.status,
    toStatus: newStatus,
    changedById: userId,
    changeReason: reason || `Status transitioned to ${newStatus}`,
  });

  return updated;
}

export async function addRequirementNote(requirementId: number, authorId: string, content: string, isPrivate = false) {
  return await db.requirementNote.create({
    data: {
      requirementId,
      authorId,
      content,
      isPrivate,
    },
  });
}

export async function addRequirementAttachment(
  requirementId: number,
  fileName: string,
  fileUrl: string,
  fileType: string
) {
  return await db.requirementAttachment.create({
    data: {
      requirementId,
      fileName,
      fileUrl,
      fileType,
    },
  });
}

export async function deleteRequirement(id: number, userId: string) {
  const existing = await db.requirement.findUnique({
    where: { id },
    include: { customer: true },
  });

  if (!existing) {
    throw new Error('Requirement not found');
  }

  const changer = await db.user.findUnique({ where: { id: userId } });
  const isAdmin = changer?.role === 'ADMIN';
  const isOwner = existing.customer.userId === userId;

  if (!isOwner && !isAdmin) {
    throw new Error('Unauthorized deletion access');
  }

  return await db.requirement.delete({
    where: { id },
  });
}
