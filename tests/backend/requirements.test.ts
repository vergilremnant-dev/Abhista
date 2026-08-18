import { describe, it, expect, vi } from 'vitest';
import { isValidTransition } from '../../api-lib/services/workflowService.js';
import { createRequirement } from '../../api-lib/services/requirementService.js';
import { db } from '../../api-lib/utils/db.js';

vi.mock('../../api-lib/utils/db.js', () => {
  return {
    db: {
      requirement: {
        create: vi.fn(),
        findUnique: vi.fn(),
      },
      requirementHistory: {
        create: vi.fn(),
      },
      requirementAttachment: {
        createMany: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
    },
  };
});

describe('Requirements Lifecycle Workflow', () => {
  it('should validate allowed status transitions', () => {
    expect(isValidTransition('DRAFT', 'SUBMITTED')).toBe(true);
    expect(isValidTransition('DRAFT', 'CANCELLED')).toBe(true);
    expect(isValidTransition('DRAFT', 'COMPLETED')).toBe(false);
  });

  it('should reject invalid status transitions', () => {
    expect(isValidTransition('COMPLETED', 'DRAFT')).toBe(false);
    expect(isValidTransition('CLOSED', 'IN_PROGRESS')).toBe(false);
  });
});

describe('Requirements Service CRUD Mock Tests', () => {
  it('should create draft requirement successfully', async () => {
    const mockCreate = vi.spyOn(db.requirement, 'create');
    mockCreate.mockResolvedValueOnce({
      id: 42,
      customerId: 'cust-123',
      title: 'Fix Roof',
      description: 'Leaking roof needs fixing',
      serviceCategory: 'Roofing',
      serviceCategoryId: 10,
      location: 'New York',
      budgetMin: 500,
      budgetMax: 1000,
      preferredStartDate: null,
      status: 'DRAFT',
    } as any);

    const result = await createRequirement('cust-123', 'user-456', {
      title: 'Fix Roof',
      description: 'Leaking roof needs fixing',
      serviceCategory: 'Roofing',
      serviceCategoryId: 10,
      location: 'New York',
      budgetMin: 500,
      budgetMax: 1000,
      status: 'DRAFT',
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(42);
    expect(result.status).toBe('DRAFT');
    expect(mockCreate).toHaveBeenCalled();
  });

  it('should fail creation if budget range is invalid', async () => {
    await expect(
      createRequirement('cust-123', 'user-456', {
        title: 'Fix Roof',
        description: 'Leaking roof needs fixing',
        serviceCategory: 'Roofing',
        location: 'New York',
        budgetMin: 1000,
        budgetMax: 500,
      })
    ).rejects.toThrow('Invalid budget range');
  });
});
