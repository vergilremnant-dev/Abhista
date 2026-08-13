import { VercelResponse } from '@vercel/node';
import { VercelRequestWithUser } from '../../api-lib/middleware/authMiddleware.js';
import { requirePermission } from '../../api-lib/middleware/permissionMiddleware.js';
import { getProfile, getProfileCompletion } from '../../api-lib/services/profileService.js';

async function handler(req: VercelRequestWithUser, res: VercelResponse) {
  const method = req.method;
  const user = req.user!;

  if (method === 'GET') {
    try {
      const profile = await getProfile(user.id, user.role);
      const completion = getProfileCompletion(profile, user.role);
      return res.status(200).json({ success: true, ...completion });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}

export default requirePermission('profile:update')(handler);
