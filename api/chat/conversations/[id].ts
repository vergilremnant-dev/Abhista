import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../../../api-lib/utils/auth.js';
import { getConversationDetails } from '../../../api-lib/services/chatService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  const { id } = req.query;
  const paramId = Array.isArray(id) ? id[0] : id;

  if (!paramId) {
    return res.status(400).json({ success: false, message: 'Conversation ID is required' });
  }

  const method = req.method;

  if (method === 'GET') {
    try {
      const conversation = await getConversationDetails(user.id, paramId);
      return res.status(200).json({ success: true, data: conversation });
    } catch (err: any) {
      const message = err.message || '';
      if (message.includes('not found')) {
        return res.status(404).json({ success: false, message });
      }
      if (message.includes('Access denied')) {
        return res.status(403).json({ success: false, message });
      }
      return res.status(500).json({ success: false, message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
