import { verifyToken } from '../../../utils/auth.js';
import { saveAvailabilitySettings } from '../../../services/providerDashboardService.js';
export default async function handler(req, res) {
    const user = verifyToken(req);
    if (!user || user.role !== 'PROVIDER') {
        return res.status(403).json({ success: false, message: 'Access denied: Provider role required' });
    }
    const method = req.method;
    if (method === 'POST') {
        try {
            const data = await saveAvailabilitySettings(user.id, req.body);
            return res.status(200).json({ success: true, data });
        }
        catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
