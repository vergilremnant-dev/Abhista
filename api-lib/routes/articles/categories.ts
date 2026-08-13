import { VercelRequest, VercelResponse } from '@vercel/node';
import { listBlogCategories } from '../../services/articleService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  if (method === 'GET') {
    try {
      const categories = await listBlogCategories(true);
      return res.status(200).json({ success: true, data: categories });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
