import { verifyToken } from '../../../utils/auth.js';
import { db } from '../../../utils/db.js';
import { createProjectMilestone } from '../../../services/projectService.js';
export default async function handler(req, res) {
    const method = req.method;
    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    const { id } = req.query;
    const projectId = Array.isArray(id) ? id[0] : id;
    if (!projectId) {
        return res.status(400).json({ success: false, message: 'Missing project ID parameter' });
    }
    try {
        if (method === 'GET') {
            const milestones = await db.projectMilestone.findMany({
                where: { projectId },
                include: { workOrders: true },
                orderBy: { createdAt: 'asc' },
            });
            return res.status(200).json({ success: true, data: milestones });
        }
        if (method === 'POST') {
            const { name, description, budgetAllocation, plannedStart, plannedEnd } = req.body;
            if (!name) {
                return res.status(400).json({ success: false, message: 'Missing milestone name' });
            }
            const ms = await createProjectMilestone(projectId, user.id, name, description, budgetAllocation ? Number(budgetAllocation) : undefined, plannedStart ? new Date(plannedStart) : undefined, plannedEnd ? new Date(plannedEnd) : undefined);
            return res.status(201).json({
                success: true,
                data: ms,
                message: 'Milestone created successfully',
            });
        }
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}
