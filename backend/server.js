const http = require('http');
const url = require('url');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const commentRoutes = require('./routes/comments');

// Import database
const db = require('./config/database');

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    console.log(`${method} ${path}`);

    // Route handling
    if (path.startsWith('/api/auth')) {
        authRoutes.handleRequest(req, res);
    } else if (path.startsWith('/api/projects')) {
        projectRoutes.handleRequest(req, res);
    } else if (path.startsWith('/api/tasks')) {
        taskRoutes.handleRequest(req, res);
    } else if (path.startsWith('/api/comments')) {
        commentRoutes.handleRequest(req, res);
    } else if (path === '/' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Project Management API is running!',
            endpoints: {
                auth: '/api/auth',
                projects: '/api/projects',
                tasks: '/api/tasks',
                comments: '/api/comments'
            }
        }));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Route not found' }));
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Project Management Server running on http://localhost:${PORT}`);
    console.log(`👤 ${db.users.length} users loaded`);
    console.log(`📁 ${db.projects.length} projects loaded`);
    console.log(`✅ ${db.tasks.length} tasks loaded`);
    console.log(`💬 ${db.comments.length} comments loaded`);
});