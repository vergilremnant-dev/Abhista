import { VercelResponse } from '@vercel/node';
import { VercelRequestWithUser } from '../../api-lib/middleware/authMiddleware.js';
import { requirePermission } from '../../api-lib/middleware/permissionMiddleware.js';
import { reorderCategories } from '../../api-lib/services/categoryService.js';

async function handler(req: VercelRequestWithUser, res: VercelResponse) {
  const method = req.method;

  if (method === 'POST') {
    try {
      const { orders } = req.body;
      if (!Array.isArray(orders)) {
        return res.status(400).json({ success: false, message: 'orders must be an array of { id, displayOrder }' });
      }

      await reorderCategories(orders);
      return res.status(200).json({ success: true, message: 'Categories reordered successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}

export default requirePermission('category:manage')(handler);
