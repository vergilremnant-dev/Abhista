import { describe, it, expect, vi } from 'vitest';
import { isValidTransition } from '../../api-lib/services/appointmentWorkflow.js';
import { checkConflict, getProviderAvailableSlots, createAppointment } from '../../api-lib/services/appointmentService.js';
import { db } from '../../api-lib/utils/db.js';
import { AppointmentStatus } from '@prisma/client';

vi.mock('../../api-lib/utils/db.js', () => {
  return {
    db: {
      appointment: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        findUnique: vi.fn(),
      },
      availabilityBlock: {
        findMany: vi.fn(),
      },
      reminderQueue: {
        createMany: vi.fn(),
      },
      appointmentResource: {
        createMany: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(db)),
    },
  };
});

describe('Appointment Workflow Engine', () => {
  it('should validate allowed appointment transitions', () => {
    expect(isValidTransition(AppointmentStatus.DRAFT, AppointmentStatus.SCHEDULED)).toBe(true);
    expect(isValidTransition(AppointmentStatus.PENDING_CONFIRMATION, AppointmentStatus.CONFIRMED)).toBe(true);
    expect(isValidTransition(AppointmentStatus.CONFIRMED, AppointmentStatus.RESCHEDULED)).toBe(true);
    expect(isValidTransition(AppointmentStatus.IN_PROGRESS, AppointmentStatus.COMPLETED)).toBe(true);
  });

  it('should reject invalid appointment transitions', () => {
    expect(isValidTransition(AppointmentStatus.COMPLETED, AppointmentStatus.DRAFT)).toBe(false);
    expect(isValidTransition(AppointmentStatus.CANCELLED, AppointmentStatus.CONFIRMED)).toBe(false);
  });
});

describe('Conflict Detection Evaluator', () => {
  it('should detect booking overlaps correctly', async () => {
    const mockFindFirst = vi.spyOn(db.appointment, 'findFirst').mockResolvedValueOnce({
      id: 'apt-overlap',
    } as any);

    const hasConflict = await checkConflict('prov-123', new Date('2026-07-25T10:00:00Z'), new Date('2026-07-25T11:00:00Z'));
    expect(hasConflict).toBe(true);
    expect(mockFindFirst).toHaveBeenCalled();
  });

  it('should pass if no booking overlaps exist', async () => {
    vi.spyOn(db.appointment, 'findFirst').mockResolvedValueOnce(null);
    const hasConflict = await checkConflict('prov-123', new Date('2026-07-25T10:00:00Z'), new Date('2026-07-25T11:00:00Z'));
    expect(hasConflict).toBe(false);
  });
});

describe('Availability slots generator', () => {
  it('should construct hourly slots outside active bookings', async () => {
    vi.spyOn(db.availabilityBlock, 'findMany').mockResolvedValueOnce([
      {
        id: 'block-1',
        providerId: 'prov-123',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
      },
    ] as any);

    vi.spyOn(db.appointment, 'findMany').mockResolvedValueOnce([
      {
        startTime: new Date('2026-07-27T10:00:00Z'), // overlaps 10:00 - 11:00 slot
        endTime: new Date('2026-07-27T11:00:00Z'),
      },
    ] as any);

    const slots = await getProviderAvailableSlots('prov-123', new Date('2026-07-27T00:00:00Z')); // Monday (dayOfWeek=1)
    expect(slots).toContain('09:00');
    expect(slots).not.toContain('10:00'); // Booked
    expect(slots).toContain('11:00');
  });
});
