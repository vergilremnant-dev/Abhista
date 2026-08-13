import { verifyToken, hasRole } from '../../../utils/auth.js';
import { providerGetCallbacks } from '../../../services/callbackService.js';
export default async function handler(req, res) {
    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    if (!hasRole(user, ['PROVIDER'])) {
        return res.status(403).json({ success: false, message: 'Forbidden: Provider access required' });
    }
    const method = req.method;
    if (method === 'GET') {
        try {
            const list = await providerGetCallbacks(user.id);
            return res.status(200).json({ success: true, data: list });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
