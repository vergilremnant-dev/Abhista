import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, hasRole } from '../../../../api-lib/utils/auth.js';
import { adminUpdateCallbackStatus } from '../../../../api-lib/services/callbackService.js';

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
    return res.status(400).json({ success: false, message: 'Missing callback ID parameter' });
  }

  const method = req.method;

  if (method === 'PATCH') {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'Missing status value' });
      }

      const updated = await adminUpdateCallbackStatus(paramId, status);
      return res.status(200).json({
        success: true,
        message: 'Callback request status updated successfully.',
        data: updated,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['PATCH']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
