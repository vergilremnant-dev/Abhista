import { VercelRequest, VercelResponse } from '@vercel/node';
import { listProviders } from '../../services/providerService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  try {
    const { page, limit, categoryId, city, search, isFeatured, canProvideServices, canProvideConsultation } = req.query;

    const filters: any = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      city: city ? String(city) : undefined,
      search: search ? String(search) : undefined,
      isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
      canProvideServices: canProvideServices === 'true' ? true : canProvideServices === 'false' ? false : undefined,
      canProvideConsultation: canProvideConsultation === 'true' ? true : canProvideConsultation === 'false' ? false : undefined,
    };

    const results = await listProviders(filters);
    return res.status(200).json(results);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
