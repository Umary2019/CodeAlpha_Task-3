const db = require('../config/database');
const auth = require('../middleware/auth');
const { validateRequired } = require('../middleware/validation');

class CommentController {
    getTaskComments(req, res) {
        const currentUser = auth(req, res);
        if (!currentUser) return;

        const taskId = parseInt(req.url.split('/')[3]);
        const taskComments = db.comments.filter(comment => comment.taskId === taskId)
            .map(comment => {
                const user = db.users.find(u => u.id === comment.userId);
                return {
                    ...comment,
                    user: {
                        id: user.id,
                        name: user.name,
                        avatar: user.avatar
                    }
                };
            })
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            data: taskComments
        }));
    }

    addComment(req, res) {
        const currentUser = auth(req, res);
        if (!currentUser) return;

        const taskId = parseInt(req.url.split('/')[3]);

        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                
                const requiredCheck = validateRequired(['content'], data);
                if (!requiredCheck.isValid) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: requiredCheck.error }));
                    return;
                }

                if (!data.content.trim()) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Comment content cannot be empty' }));
                    return;
                }

                // Verify task exists and user has access
                const task = db.tasks.find(t => t.id === taskId);
                if (!task) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Task not found' }));
                    return;
                }

                const project = db.projects.find(p => p.id === task.projectId);
                if (!project || (project.ownerId !== currentUser.id && !project.members.includes(currentUser.id))) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Access denied' }));
                    return;
                }

                const comment = {
                    id: db.comments.length + 1,
                    taskId,
                    userId: currentUser.id,
                    content: data.content.trim(),
                    createdAt: new Date().toISOString()
                };

                db.comments.push(comment);

                const user = db.users.find(u => u.id === currentUser.id);

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    data: {
                        ...comment,
                        user: {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar
                        }
                    }
                }));

            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
            }
        });
    }
}

module.exports = new CommentController();