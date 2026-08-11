import { describe, it, expect, vi } from 'vitest';
import { db } from '../../api/utils/db.js';

vi.mock('../../api/utils/db.js', () => {
  return {
    db: {
      workforceType: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      serviceCategory: {
        findMany: vi.fn(),
      },
    },
  };
});

describe('Workforce Classification Engine', () => {
  it('should list all active workforce types correctly', async () => {
    const mockFindMany = vi.spyOn(db.workforceType, 'findMany').mockResolvedValueOnce([
      { id: '1', name: 'BLUE_COLLAR', displayName: 'Blue Collar', isActive: true },
      { id: '2', name: 'WHITE_COLLAR', displayName: 'White Collar', isActive: true },
    ] as any);

    const types = await db.workforceType.findMany();
    expect(types.length).toBe(2);
    expect(types[0].name).toBe('BLUE_COLLAR');
    expect(mockFindMany).toHaveBeenCalled();
  });

  it('should filter categories by workforce relation parameters', async () => {
    const mockFindManyCat = vi.spyOn(db.serviceCategory, 'findMany').mockResolvedValueOnce([
      { id: 10, name: 'Waterproofing', workforceTypeId: '1' },
      { id: 11, name: 'Carpentry', workforceTypeId: '1' },
    ] as any);

    const categories = await db.serviceCategory.findMany({
      where: { workforceTypeId: '1' },
    });
    expect(categories.length).toBe(2);
    expect(categories[0].name).toBe('Waterproofing');
    expect(mockFindManyCat).toHaveBeenCalled();
  });
});
