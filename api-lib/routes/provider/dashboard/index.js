import { verifyToken } from '../../../utils/auth.js';
import { getDashboardOverview } from '../../../services/providerDashboardService.js';
export default async function handler(req, res) {
    const user = verifyToken(req);
    if (!user || user.role !== 'PROVIDER') {
        return res.status(403).json({ success: false, message: 'Access denied: Provider role required' });
    }
    const method = req.method;
    if (method === 'GET') {
        try {
            const data = await getDashboardOverview(user.id);
            return res.status(200).json({ success: true, data });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
