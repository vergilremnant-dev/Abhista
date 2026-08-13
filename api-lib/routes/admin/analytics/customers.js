import { verifyToken } from '../../../utils/auth.js';
import { getCustomersAnalytics } from '../../../services/analyticsService.js';
export default async function handler(req, res) {
    const user = verifyToken(req);
    if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
    }
    const { startDate, endDate, categoryId, city } = req.query;
    try {
        const data = await getCustomersAnalytics({
            startDate: startDate ? String(startDate) : undefined,
            endDate: endDate ? String(endDate) : undefined,
            categoryId: categoryId ? Number(categoryId) : undefined,
            city: city ? String(city) : undefined,
        });
        return res.status(200).json({ success: true, data });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}
