import { VercelResponse } from '@vercel/node';
import { VercelRequestWithUser } from '../_middleware/authMiddleware.js';
import { getActiveCategories, createCategory } from '../_services/categoryService.js';
import { requirePermission } from '../_middleware/permissionMiddleware.js';
import { getCached, setCached, clearCache } from '../_utils/../_utils/cache.js';

async function handler(req: VercelRequestWithUser, res: VercelResponse) {
  const method = req.method;

  if (method === 'GET') {
    try {
      const cacheKey = 'public_categories';
      const cached = getCached<any>(cacheKey);
      if (cached) {
        return res.status(200).json({ success: true, data: cached });
      }

      const categories = await getActiveCategories();
      setCached(cacheKey, categories, 10 * 60 * 1000); // Cache for 10 minutes
      return res.status(200).json({ success: true, data: categories });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  } else if (method === 'POST') {
    try {
      const newCategory = await createCategory(req.body);
      clearCache('public_categories'); // Evict cache on update
      return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: newCategory,
      });
    } catch (err: any) {
      const message = err.message || '';
      if (message.includes('already exists') || message.includes('is required') || message.includes('Invalid')) {
        return res.status(400).json({ success: false, message });
      }
      return res.status(500).json({ success: false, message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}

export default async function entryHandler(req: any, res: any) {
  if (req.method === 'POST') {
    return requirePermission('category:manage')(handler)(req, res);
  }
  return handler(req, res);
}
