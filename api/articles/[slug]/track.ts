import { VercelRequest, VercelResponse } from '@vercel/node';
import { trackArticleInteraction } from '../../_services/articleService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const articleId = Array.isArray(slug) ? slug[0] : slug;

  if (!articleId) {
    return res.status(400).json({ success: false, message: 'Article ID is required' });
  }

  const method = req.method;
  if (method === 'POST') {
    try {
      const { type, duration } = req.body;
      if (!type || !['read_time', 'consultation', 'callback'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Invalid track type' });
      }

      await trackArticleInteraction(articleId, type, duration);
      return res.status(200).json({ success: true, message: 'Interaction tracked successfully' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
