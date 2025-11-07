const url = require('url');
const projectController = require('../controllers/projectController');

class ProjectRoutes {
    handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const path = parsedUrl.pathname;
        const method = req.method;

        if (path === '/api/projects' && method === 'GET') {
            projectController.getAllProjects(req, res);
        } else if (path === '/api/projects' && method === 'POST') {
            projectController.createProject(req, res);
        } else if (path.startsWith('/api/projects/') && method === 'GET') {
            projectController.getProject(req, res);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Project route not found' }));
        }
    }
}

module.exports = new ProjectRoutes();