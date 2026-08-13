import { verifyToken } from '../../utils/auth.js';
import { listConversations, createConversation } from '../../services/chatService.js';
export default async function handler(req, res) {
    const method = req.method;
    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    try {
        if (method === 'GET') {
            const list = await listConversations(user.id);
            return res.status(200).json({ success: true, data: list });
        }
        if (method === 'POST') {
            const { providerId, conversationType, requirementId, projectId, bookingId, consultationBookingId } = req.body;
            if (!providerId) {
                return res.status(400).json({ success: false, message: 'Missing parameter: providerId' });
            }
            const conversation = await createConversation(user.id, providerId, {
                conversationType,
                requirementId: requirementId ? Number(requirementId) : undefined,
                projectId,
                bookingId,
                consultationBookingId,
            });
            return res.status(201).json({
                success: true,
                data: conversation,
                message: 'Conversation established successfully',
            });
        }
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}
