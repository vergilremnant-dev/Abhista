import { verifyToken } from '../../../utils/auth.js';
import { getMessages, markConversationAsRead } from '../../../services/chatService.js';
export default async function handler(req, res) {
    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    const { conversationId } = req.query;
    const paramConversationId = Array.isArray(conversationId) ? conversationId[0] : conversationId;
    if (!paramConversationId) {
        return res.status(400).json({ success: false, message: 'Conversation ID parameter is required' });
    }
    const method = req.method;
    if (method === 'GET') {
        try {
            const messages = await getMessages(user.id, paramConversationId);
            // Bulk read optimization: Mark conversation messages as read when fetched
            try {
                await markConversationAsRead(user.id, paramConversationId);
            }
            catch (readErr) {
                console.error('Failed to auto-mark conversation as read', readErr);
            }
            return res.status(200).json({ success: true, data: messages });
        }
        catch (err) {
            const msg = err.message || '';
            if (msg.includes('Access denied')) {
                return res.status(403).json({ success: false, message: msg });
            }
            return res.status(500).json({ success: false, message: msg });
        }
    }
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
