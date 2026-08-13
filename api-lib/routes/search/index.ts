import { VercelRequest, VercelResponse } from '@vercel/node';
import { globalSearch } from '../../services/searchService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  try {
    const { q } = req.query;
    const queryStr = Array.isArray(q) ? q[0] : q || '';
    const results = await globalSearch(queryStr);
    return res.status(200).json(results);
  } catch (err: unknown) {
    return res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Internal Server Error' });
  }
}
