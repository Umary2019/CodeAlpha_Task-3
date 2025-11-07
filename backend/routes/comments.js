const url = require('url');
const commentController = require('../controllers/commentController');

class CommentRoutes {
    handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const path = parsedUrl.pathname;
        const method = req.method;

        if (path.startsWith('/api/tasks/') && path.endsWith('/comments') && method === 'GET') {
            commentController.getTaskComments(req, res);
        } else if (path.startsWith('/api/tasks/') && path.endsWith('/comments') && method === 'POST') {
            commentController.addComment(req, res);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Comment route not found' }));
        }
    }
}

module.exports = new CommentRoutes();