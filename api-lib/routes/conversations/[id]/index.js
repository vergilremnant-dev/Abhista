import { verifyToken } from '../../../utils/auth.js';
import { getConversationDetail } from '../../../services/chatService.js';
import { db } from '../../../utils/db.js';
export default async function handler(req, res) {
    const method = req.method;
    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    const { id } = req.query;
    const paramId = Array.isArray(id) ? id[0] : id;
    if (!paramId) {
        return res.status(400).json({ success: false, message: 'Missing conversation ID parameter' });
    }
    try {
        if (method === 'GET') {
            const details = await getConversationDetail(paramId);
            if (!details) {
                return res.status(404).json({ success: false, message: 'Conversation not found' });
            }
            return res.status(200).json({ success: true, data: details });
        }
        if (method === 'DELETE') {
            await db.conversation.delete({ where: { id: paramId } });
            return res.status(200).json({ success: true, message: 'Conversation archived/removed successfully' });
        }
        res.setHeader('Allow', ['GET', 'DELETE']);
        return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}
