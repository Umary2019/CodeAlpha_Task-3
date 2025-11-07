const url = require('url');
const taskController = require('../controllers/taskController');

class TaskRoutes {
    handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const path = parsedUrl.pathname;
        const method = req.method;

        if (path.startsWith('/api/projects/') && path.endsWith('/tasks') && method === 'POST') {
            taskController.createTask(req, res);
        } else if (path.startsWith('/api/tasks/') && method === 'PUT') {
            taskController.updateTask(req, res);
        } else if (path.startsWith('/api/tasks/') && method === 'DELETE') {
            taskController.deleteTask(req, res);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Task route not found' }));
        }
    }
}

module.exports = new TaskRoutes();