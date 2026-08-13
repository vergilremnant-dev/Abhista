import { VercelRequest, VercelResponse } from '@vercel/node';
import { searchProviders } from '../_services/searchService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  try {
    const { limit } = req.query;
    const results = await searchProviders({
      isFeatured: true,
      verificationStatus: 'VERIFIED',
      limit: limit ? Number(limit) : 5,
    });
    return res.status(200).json(results);
  } catch (err: unknown) {
    return res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Internal Server Error' });
  }
}
