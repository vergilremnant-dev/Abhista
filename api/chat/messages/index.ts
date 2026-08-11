import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../../utils/auth.js';
import { sendMessage } from '../../services/chatService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  const method = req.method;

  if (method === 'POST') {
    try {
      const message = await sendMessage(user.id, req.body);
      return res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message,
      });
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('Access denied')) {
        return res.status(403).json({ success: false, message: msg });
      }
      return res.status(400).json({ success: false, message: msg });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
