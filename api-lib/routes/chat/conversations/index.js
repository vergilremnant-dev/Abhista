import { verifyToken } from '../../../utils/auth.js';
import { createConversation, listConversations } from '../../../services/chatService.js';
export default async function handler(req, res) {
    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    const method = req.method;
    if (method === 'GET') {
        try {
            const conversations = await listConversations(user.id);
            return res.status(200).json({ success: true, data: conversations });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
    else if (method === 'POST') {
        try {
            const conversation = await createConversation(user.id, req.body);
            return res.status(201).json({
                success: true,
                message: 'Conversation initialized successfully',
                data: conversation,
            });
        }
        catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
