import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, hasRole } from '../../../utils/auth.js';
import { updateArticle, deleteArticle } from '../../../services/articleService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  if (!hasRole(user, ['ADMIN'])) {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }

  const { id } = req.query;
  const paramId = Array.isArray(id) ? id[0] : id;

  if (!paramId) {
    return res.status(400).json({ success: false, message: 'Article ID is required' });
  }

  const method = req.method;

  if (method === 'PUT') {
    try {
      const updated = await updateArticle(paramId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Article updated successfully',
        data: updated,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  } else if (method === 'DELETE') {
    try {
      await deleteArticle(paramId);
      return res.status(200).json({
        success: true,
        message: 'Article deleted successfully',
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
