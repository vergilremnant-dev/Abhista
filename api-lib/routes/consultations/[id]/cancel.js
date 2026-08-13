import { verifyToken, hasRole } from '../../../utils/auth.js';
import { cancelConsultation } from '../../../services/consultationService.js';
export default async function handler(req, res) {
    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    if (!hasRole(user, ['CUSTOMER'])) {
        return res.status(403).json({ success: false, message: 'Forbidden: Customer access required' });
    }
    const { id } = req.query;
    const paramId = Array.isArray(id) ? id[0] : id;
    if (!paramId) {
        return res.status(400).json({ success: false, message: 'Missing consultation ID parameter' });
    }
    const method = req.method;
    if (method === 'PATCH') {
        try {
            const updated = await cancelConsultation(paramId, user.id);
            return res.status(200).json({
                success: true,
                message: 'Consultation booking cancelled successfully.',
                data: updated,
            });
        }
        catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
