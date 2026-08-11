import { describe, it, expect, vi } from 'vitest';
import { searchProviders } from '../../api/services/searchService.js';
import { db } from '../../api/utils/db.js';

vi.mock('../../api/utils/db.js', () => {
  return {
    db: {
      providerProfile: {
        findMany: vi.fn(),
      },
    },
  };
});

describe('Search Service Unit Tests', () => {
  it('should query providers with keyword filter', async () => {
    const mockFindMany = vi.spyOn(db.providerProfile, 'findMany');
    mockFindMany.mockResolvedValueOnce([
      { id: '1', fullName: 'John Doe', businessName: 'John Plumb', categoryId: 1 } as any,
    ]);

    const result = await searchProviders({ search: 'Plumb' });
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(1);
    expect(result.data[0].fullName).toBe('John Doe');

    expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        OR: [
          { fullName: { contains: 'Plumb', mode: 'insensitive' } },
          { businessName: { contains: 'Plumb', mode: 'insensitive' } },
          { description: { contains: 'Plumb', mode: 'insensitive' } },
        ],
      }),
    }));
  });
});
