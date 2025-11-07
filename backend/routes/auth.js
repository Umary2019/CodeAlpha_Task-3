const url = require('url');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

class AuthRoutes {
    handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const path = parsedUrl.pathname;
        const method = req.method;

        if (path === '/api/auth/register' && method === 'POST') {
            authController.register(req, res);
        } else if (path === '/api/auth/login' && method === 'POST') {
            authController.login(req, res);
        } else if (path === '/api/auth/me' && method === 'GET') {
            const user = auth(req, res);
            if (user) {
                authController.getMe(req, res, user);
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Auth route not found' }));
        }
    }
}

module.exports = new AuthRoutes();