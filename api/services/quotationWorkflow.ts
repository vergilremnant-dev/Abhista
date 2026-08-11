import { QuotationStatus } from '@prisma/client';

export const ALLOWED_TRANSITIONS: Record<QuotationStatus, QuotationStatus[]> = {
  DRAFT: ['SUBMITTED', 'WITHDRAWN'],
  SUBMITTED: ['VIEWED', 'WITHDRAWN', 'REJECTED', 'EXPIRED'],
  VIEWED: ['UNDER_REVIEW', 'NEGOTIATION', 'WITHDRAWN', 'REJECTED', 'EXPIRED'],
  UNDER_REVIEW: ['NEGOTIATION', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED'],
  NEGOTIATION: ['REVISED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED'],
  REVISED: ['UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED'],
  ACCEPTED: ['ARCHIVED'],
  REJECTED: ['ARCHIVED'],
  WITHDRAWN: ['DRAFT', 'ARCHIVED'],
  EXPIRED: ['ARCHIVED'],
  ARCHIVED: [],
};

export function isValidTransition(from: QuotationStatus, to: QuotationStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[from] || [];
  return allowed.includes(to);
}

export function validateTransition(from: QuotationStatus, to: QuotationStatus): void {
  if (!isValidTransition(from, to)) {
    throw new Error(`Invalid status transition from ${from} to ${to}`);
  }
}
