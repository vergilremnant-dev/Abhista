import { RequirementStatus } from '@prisma/client';

export const ALLOWED_TRANSITIONS: Record<RequirementStatus, RequirementStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['PUBLISHED', 'REJECTED', 'CANCELLED'],
  PUBLISHED: ['PROVIDER_REVIEW', 'EXPIRED', 'CANCELLED', 'ON_HOLD'],
  PROVIDER_REVIEW: ['QUOTATION_RECEIVED', 'PUBLISHED', 'CANCELLED', 'ON_HOLD'],
  QUOTATION_RECEIVED: ['CUSTOMER_REVIEW', 'CANCELLED', 'ON_HOLD'],
  CUSTOMER_REVIEW: ['QUOTATION_ACCEPTED', 'PROVIDER_REVIEW', 'CANCELLED', 'ON_HOLD'],
  QUOTATION_ACCEPTED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: ['DRAFT'],
  REJECTED: ['DRAFT'],
  EXPIRED: ['DRAFT'],
  ON_HOLD: ['PUBLISHED', 'CANCELLED'],
};

export function isValidTransition(from: RequirementStatus, to: RequirementStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[from] || [];
  return allowed.includes(to);
}

export function validateTransition(from: RequirementStatus, to: RequirementStatus): void {
  if (!isValidTransition(from, to)) {
    throw new Error(`Invalid status transition from ${from} to ${to}`);
  }
}
