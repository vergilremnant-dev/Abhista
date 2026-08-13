import { VercelResponse } from '@vercel/node';
import { VercelRequestWithUser } from '../_middleware/authMiddleware.js';
import { getCategoryBySlug, updateCategory, deleteCategory } from '../_services/categoryService.js';
import { requirePermission } from '../_middleware/permissionMiddleware.js';

async function handler(req: VercelRequestWithUser, res: VercelResponse) {
  const { slugOrId } = req.query;
  const param = Array.isArray(slugOrId) ? slugOrId[0] : slugOrId;

  if (!param) {
    return res.status(400).json({ success: false, message: 'Missing category parameter' });
  }

  const method = req.method;

  switch (method) {
    case 'GET':
      try {
        const category = await getCategoryBySlug(param);
        if (!category) {
          return res.status(404).json({ success: false, message: 'Category not found' });
        }
        return res.status(200).json({ success: true, data: category });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }

    case 'PUT': {
      const id = Number(param);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid category ID parameter for updates' });
      }

      try {
        const updated = await updateCategory(id, req.body);
        return res.status(200).json({
          success: true,
          message: 'Category updated successfully',
          data: updated,
        });
      } catch (err: any) {
        const message = err.message || '';
        if (message.includes('not found')) {
          return res.status(404).json({ success: false, message });
        }
        if (message.includes('already exists') || message.includes('cannot be blank') || message.includes('Invalid')) {
          return res.status(400).json({ success: false, message });
        }
        return res.status(500).json({ success: false, message });
      }
    }

    case 'DELETE': {
      const id = Number(param);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid category ID parameter for deletion' });
      }

      try {
        await deleteCategory(id);
        return res.status(200).json({
          success: true,
          message: 'Category deleted successfully (soft-delete completed)',
        });
      } catch (err: any) {
        const message = err.message || '';
        if (message.includes('not found')) {
          return res.status(404).json({ success: false, message });
        }
        return res.status(500).json({ success: false, message });
      }
    }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}

export default async function entryHandler(req: any, res: any) {
  if (req.method === 'PUT' || req.method === 'DELETE') {
    return requirePermission('category:manage')(handler)(req, res);
  }
  return handler(req, res);
}
