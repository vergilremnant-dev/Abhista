import { verifyToken, hasRole } from '../../../../utils/auth.js';
import { adminGetCallbackDetail } from '../../../../services/callbackService.js';
export default async function handler(req, res) {
    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    if (!hasRole(user, ['ADMIN'])) {
        return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }
    const { id } = req.query;
    const paramId = Array.isArray(id) ? id[0] : id;
    if (!paramId) {
        return res.status(400).json({ success: false, message: 'Missing callback ID parameter' });
    }
    const method = req.method;
    if (method === 'GET') {
        try {
            const detail = await adminGetCallbackDetail(paramId);
            return res.status(200).json({ success: true, data: detail });
        }
        catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
