import { VercelRequest, VercelResponse } from '@vercel/node';
import { listArticles } from '../../services/articleService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const categorySlug = Array.isArray(slug) ? slug[0] : slug;

  if (!categorySlug) {
    return res.status(400).json({ success: false, message: 'Category slug is required' });
  }

  const method = req.method;
  if (method === 'GET') {
    try {
      const result = await listArticles({
        categorySlug,
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
