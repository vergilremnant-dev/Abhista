import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../utils/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  const { q = '' } = req.query;
  const keyword = String(q).trim().toLowerCase();

  if (!keyword || keyword.length < 2) {
    return res.status(200).json({
      success: true,
      suggestions: {
        categories: [],
        professionals: [],
        locations: ['Hyderabad', 'Bangalore', 'Chennai'],
        popularSearches: ['Architect', 'Interior Designer', 'Plumber', 'Contractor'],
      },
    });
  }

  try {
    const [categories, professionals] = await Promise.all([
      db.serviceCategory.findMany({
        where: {
          name: { contains: keyword, mode: 'insensitive' },
          isActive: true,
          deletedAt: null,
        },
        select: { id: true, name: true, slug: true },
        take: 4,
      }),
      db.providerProfile.findMany({
        where: {
          verificationStatus: 'VERIFIED',
          OR: [
            { fullName: { contains: keyword, mode: 'insensitive' } },
            { businessName: { contains: keyword, mode: 'insensitive' } },
          ],
        },
        select: { id: true, fullName: true, businessName: true },
        take: 4,
      }),
    ]);

    // Popular matching locations list
    const citiesList = ['Hyderabad', 'Bangalore', 'Chennai', 'Mumbai', 'Delhi', 'Pune', 'Kolkata'];
    const matchedLocations = citiesList.filter(c => c.toLowerCase().includes(keyword));

    return res.status(200).json({
      success: true,
      suggestions: {
        categories: categories.map(c => ({ id: c.id, name: c.name, type: 'category', slug: c.slug })),
        professionals: professionals.map(p => ({ id: p.id, name: p.fullName, businessName: p.businessName, type: 'professional' })),
        locations: matchedLocations,
        popularSearches: ['Architect', 'Interior Designer', 'Plumber', 'Contractor'].filter(term => term.toLowerCase().includes(keyword)),
      },
    });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Internal Server Error' });
  }
}
