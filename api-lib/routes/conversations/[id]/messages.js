import { verifyToken } from '../../../utils/auth.js';
import { db } from '../../../utils/db.js';
import { sendMessage } from '../../../services/chatService.js';
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
    try {
        if (method === 'GET') {
            const messages = await db.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'asc' },
                include: {
                    sender: true,
                    readReceipts: true,
                    reactions: true,
                },
            });
            return res.status(200).json({ success: true, data: messages });
        }
        if (method === 'POST') {
            const { content, messageType, attachmentUrl } = req.body;
            if (!content) {
                return res.status(400).json({ success: false, message: 'Missing message content' });
            }
            const msg = await sendMessage(conversationId, user.id, content, messageType, attachmentUrl);
            return res.status(201).json({ success: true, data: msg });
        }
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}
