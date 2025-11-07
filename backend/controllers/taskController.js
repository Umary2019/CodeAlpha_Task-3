const db = require('../config/database');
const auth = require('../middleware/auth');
const { validateRequired } = require('../middleware/validation');

class TaskController {
    createTask(req, res) {
        const currentUser = auth(req, res);
        if (!currentUser) return;

        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const projectId = parseInt(req.url.split('/')[3]);

                const requiredCheck = validateRequired(['title'], data);
                if (!requiredCheck.isValid) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: requiredCheck.error }));
                    return;
                }

                // Verify project exists and user has access
                const project = db.projects.find(p => p.id === projectId);
                if (!project) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Project not found' }));
                    return;
                }

                if (project.ownerId !== currentUser.id && !project.members.includes(currentUser.id)) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Access denied' }));
                    return;
                }

                const task = {
                    id: db.tasks.length + 1,
                    title: data.title,
                    description: data.description || '',
                    projectId: projectId,
                    assigneeId: data.assigneeId || currentUser.id,
                    status: data.status || 'todo',
                    priority: data.priority || 'medium',
                    dueDate: data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    createdBy: currentUser.id,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                db.tasks.push(task);

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    data: task
                }));

            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
            }
        });
    }

    updateTask(req, res) {
        const currentUser = auth(req, res);
        if (!currentUser) return;

        const taskId = parseInt(req.url.split('/').pop());

        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const task = db.tasks.find(t => t.id === taskId);

                if (!task) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Task not found' }));
                    return;
                }

                // Verify user has access to the project
                const project = db.projects.find(p => p.id === task.projectId);
                if (!project || (project.ownerId !== currentUser.id && !project.members.includes(currentUser.id))) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Access denied' }));
                    return;
                }

                // Update task fields
                if (data.title !== undefined) task.title = data.title;
                if (data.description !== undefined) task.description = data.description;
                if (data.assigneeId !== undefined) task.assigneeId = data.assigneeId;
                if (data.status !== undefined) task.status = data.status;
                if (data.priority !== undefined) task.priority = data.priority;
                if (data.dueDate !== undefined) task.dueDate = data.dueDate;
                task.updatedAt = new Date().toISOString();

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    data: task
                }));

            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
            }
        });
    }

    deleteTask(req, res) {
        const currentUser = auth(req, res);
        if (!currentUser) return;

        const taskId = parseInt(req.url.split('/').pop());
        const taskIndex = db.tasks.findIndex(t => t.id === taskId);

        if (taskIndex === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Task not found' }));
            return;
        }

        const task = db.tasks[taskIndex];
        const project = db.projects.find(p => p.id === task.projectId);

        // Only project owner can delete tasks
        if (project.ownerId !== currentUser.id) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Only project owner can delete tasks' }));
            return;
        }

        // Remove task and associated comments
        db.tasks.splice(taskIndex, 1);
        db.comments = db.comments.filter(c => c.taskId !== taskId);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            message: 'Task deleted successfully'
        }));
    }
}

module.exports = new TaskController();