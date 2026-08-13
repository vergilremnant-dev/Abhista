import { VercelRequest, VercelResponse } from '@vercel/node';
import { listArticles } from '../_services/articleService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  if (method === 'GET') {
    try {
      const { categorySlug, query, limit, offset } = req.query;

      const result = await listArticles({
        categorySlug: categorySlug ? String(categorySlug) : undefined,
        query: query ? String(query) : undefined,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
        publishedOnly: true,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
