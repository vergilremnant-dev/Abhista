import { verifyToken } from '../../../../utils/auth.js';
import { markMessageAsRead } from '../../../../services/chatService.js';
export default async function handler(req, res) {
    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    const { id } = req.query;
    const messageId = Array.isArray(id) ? id[0] : id;
    if (!messageId) {
        return res.status(400).json({ success: false, message: 'Message ID is required' });
    }
    const method = req.method;
    if (method === 'PATCH') {
        try {
            const updated = await markMessageAsRead(user.id, messageId);
            return res.status(200).json({
                success: true,
                message: 'Message marked as read',
                data: updated,
            });
        }
        catch (err) {
            const msg = err.message || '';
            if (msg.includes('Access denied')) {
                return res.status(403).json({ success: false, message: msg });
            }
            return res.status(400).json({ success: false, message: msg });
        }
    }
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
