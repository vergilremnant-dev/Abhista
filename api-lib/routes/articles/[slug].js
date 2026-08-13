import { getArticleBySlug } from '../../services/articleService.js';
export default async function handler(req, res) {
    const { slug } = req.query;
    const articleSlug = Array.isArray(slug) ? slug[0] : slug;
    if (!articleSlug) {
        return res.status(400).json({ success: false, message: 'Article slug is required' });
    }
    const method = req.method;
    if (method === 'GET') {
        try {
            const article = await getArticleBySlug(articleSlug);
            if (!article) {
                return res.status(404).json({ success: false, message: 'Article not found' });
            }
            return res.status(200).json({ success: true, data: article });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
