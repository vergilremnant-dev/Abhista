import { verifyToken } from '../../../utils/auth.js';
import { updateReadReceipt } from '../../../services/chatService.js';
export default async function handler(req, res) {
    const method = req.method;
    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    const { id } = req.query;
    const conversationId = Array.isArray(id) ? id[0] : id;
    if (!conversationId) {
        return res.status(400).json({ success: false, message: 'Missing conversation ID parameter' });
    }
    const { messageId } = req.body;
    if (!messageId) {
        return res.status(400).json({ success: false, message: 'Missing target messageId parameter' });
    }
    try {
        if (method === 'POST') {
            const receipt = await updateReadReceipt(messageId, user.id);
            return res.status(200).json({ success: true, data: receipt, message: 'Message read receipt updated' });
        }
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}
