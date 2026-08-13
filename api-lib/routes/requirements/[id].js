import { verifyToken } from '../../utils/auth.js';
import { db } from '../../utils/db.js';
export default async function handler(req, res) {
    const method = req.method;
    if (method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
    }
    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    const { id } = req.query;
    const paramId = Array.isArray(id) ? id[0] : id;
    if (!paramId) {
        return res.status(400).json({ success: false, message: 'Missing requirement ID parameter' });
    }
    try {
        const requirement = await db.requirement.findUnique({
            where: { id: Number(paramId) },
        });
        if (!requirement) {
            return res.status(404).json({ success: false, message: 'Requirement not found' });
        }
        return res.status(200).json({ success: true, data: requirement });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}
