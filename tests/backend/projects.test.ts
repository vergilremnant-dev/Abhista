import { describe, it, expect, vi } from 'vitest';
import { isValidTransition } from '../../api/services/projectWorkflow.js';
import { transitionProjectStatus, createProjectMilestone, createWorkOrder } from '../../api/services/projectService.js';
import { db } from '../../api/utils/db.js';
import { ProjectStatus } from '@prisma/client';

vi.mock('../../api/utils/db.js', () => {
  return {
    db: {
      project: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      projectMilestone: {
        create: vi.fn(),
      },
      workOrder: {
        create: vi.fn(),
      },
      projectTimeline: {
        create: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(db)),
    },
  };
});

describe('Project Workflow Engine', () => {
  it('should validate allowed project transitions', () => {
    expect(isValidTransition(ProjectStatus.CREATED, ProjectStatus.ASSIGNED)).toBe(true);
    expect(isValidTransition(ProjectStatus.IN_PROGRESS, ProjectStatus.COMPLETED)).toBe(true);
    expect(isValidTransition(ProjectStatus.COMPLETED, ProjectStatus.CUSTOMER_APPROVAL)).toBe(true);
    expect(isValidTransition(ProjectStatus.CUSTOMER_APPROVAL, ProjectStatus.CLOSED)).toBe(true);
  });

  it('should reject invalid project transitions', () => {
    expect(isValidTransition(ProjectStatus.CLOSED, ProjectStatus.IN_PROGRESS)).toBe(false);
    expect(isValidTransition(ProjectStatus.CANCELLED, ProjectStatus.IN_PROGRESS)).toBe(false);
  });
});

describe('Project Service Actions Mock Tests', () => {
  it('should transition project status successfully', async () => {
    vi.spyOn(db.project, 'findUnique').mockResolvedValueOnce({
      id: 'proj-123',
      status: ProjectStatus.CREATED,
    } as any);

    const mockUpdate = vi.spyOn(db.project, 'update').mockResolvedValueOnce({
      id: 'proj-123',
      status: ProjectStatus.ASSIGNED,
    } as any);

    const result = await transitionProjectStatus('proj-123', 'user-abc', ProjectStatus.ASSIGNED);

    expect(result).toBeDefined();
    expect(result.status).toBe(ProjectStatus.ASSIGNED);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('should create milestone successfully', async () => {
    const mockCreate = vi.spyOn(db.projectMilestone, 'create').mockResolvedValueOnce({
      id: 'ms-999',
      projectId: 'proj-123',
      name: 'Foundation Work',
      budgetAllocation: 5000,
    } as any);

    const result = await createProjectMilestone('proj-123', 'user-abc', 'Foundation Work', 'Concrete foundation', 5000);

    expect(result).toBeDefined();
    expect(result.id).toBe('ms-999');
    expect(result.budgetAllocation).toBe(5000);
    expect(mockCreate).toHaveBeenCalled();
  });

  it('should create work order successfully', async () => {
    const mockCreate = vi.spyOn(db.workOrder, 'create').mockResolvedValueOnce({
      id: 'wo-101',
      projectId: 'proj-123',
      title: 'Excavation',
      priority: 'HIGH',
    } as any);

    const result = await createWorkOrder('proj-123', 'user-abc', {
      title: 'Excavation',
      priority: 'HIGH',
    });

    expect(result).toBeDefined();
    expect(result.id).toBe('wo-101');
    expect(mockCreate).toHaveBeenCalled();
  });
});
