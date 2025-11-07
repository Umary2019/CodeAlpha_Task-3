const db = require('../config/database');
const auth = require('../middleware/auth');
const { validateRequired } = require('../middleware/validation');

class ProjectController {
    getAllProjects(req, res) {
        const currentUser = auth(req, res);
        if (!currentUser) return;

        const userProjects = db.projects.filter(project => 
            project.ownerId === currentUser.id || project.members.includes(currentUser.id)
        ).map(project => {
            const owner = db.users.find(u => u.id === project.ownerId);
            const members = db.users.filter(u => project.members.includes(u.id))
                .map(member => ({
                    id: member.id,
                    name: member.name,
                    email: member.email,
                    avatar: member.avatar,
                    role: member.role
                }));
            
            const tasks = db.tasks.filter(task => task.projectId === project.id);
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            
            return {
                ...project,
                owner: {
                    id: owner.id,
                    name: owner.name,
                    email: owner.email,
                    avatar: owner.avatar
                },
                members,
                taskCount: tasks.length,
                completedTasks,
                progress: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
            };
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            data: userProjects
        }));
    }

    createProject(req, res) {
        const currentUser = auth(req, res);
        if (!currentUser) return;

        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                
                const requiredCheck = validateRequired(['name', 'description'], data);
                if (!requiredCheck.isValid) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: requiredCheck.error }));
                    return;
                }

                const project = {
                    id: db.projects.length + 1,
                    name: data.name,
                    description: data.description,
                    ownerId: currentUser.id,
                    members: data.members || [currentUser.id],
                    status: data.status || 'planning',
                    startDate: data.startDate || new Date().toISOString(),
                    endDate: data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                db.projects.push(project);

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    data: project
                }));

            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
            }
        });
    }

    getProject(req, res) {
        const currentUser = auth(req, res);
        if (!currentUser) return;

        const projectId = parseInt(req.url.split('/').pop());
        const project = db.projects.find(p => p.id === projectId);
        
        if (!project) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Project not found' }));
            return;
        }

        // Check if user has access to project
        if (project.ownerId !== currentUser.id && !project.members.includes(currentUser.id)) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Access denied' }));
            return;
        }

        const owner = db.users.find(u => u.id === project.ownerId);
        const members = db.users.filter(u => project.members.includes(u.id))
            .map(member => ({
                id: member.id,
                name: member.name,
                email: member.email,
                avatar: member.avatar,
                role: member.role
            }));

        const tasks = db.tasks.filter(task => task.projectId === projectId)
            .map(task => {
                const assignee = db.users.find(u => u.id === task.assigneeId);
                const createdBy = db.users.find(u => u.id === task.createdBy);
                const comments = db.comments.filter(c => c.taskId === task.id);
                
                return {
                    ...task,
                    assignee: {
                        id: assignee.id,
                        name: assignee.name,
                        avatar: assignee.avatar
                    },
                    createdBy: {
                        id: createdBy.id,
                        name: createdBy.name,
                        avatar: createdBy.avatar
                    },
                    commentCount: comments.length
                };
            });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            data: {
                project: {
                    ...project,
                    owner: {
                        id: owner.id,
                        name: owner.name,
                        email: owner.email,
                        avatar: owner.avatar
                    },
                    members
                },
                tasks
            }
        }));
    }
}

module.exports = new ProjectController();