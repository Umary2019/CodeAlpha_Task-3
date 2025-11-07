const db = require('../config/database');
const { validateEmail, validatePassword, validateRequired } = require('../middleware/validation');

class AuthController {
    register(req, res) {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                
                // Validation
                const requiredCheck = validateRequired(['name', 'email', 'password'], data);
                if (!requiredCheck.isValid) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: requiredCheck.error }));
                    return;
                }
                
                if (!validateEmail(data.email)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Invalid email format' }));
                    return;
                }
                
                if (!validatePassword(data.password)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Password must be at least 6 characters' }));
                    return;
                }
                
                // Check if user exists
                const userExists = db.users.find(u => u.email === data.email);
                if (userExists) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'User already exists' }));
                    return;
                }
                
                // Create user
                const user = {
                    id: db.users.length + 1,
                    name: data.name,
                    email: data.email,
                    password: Buffer.from(data.password).toString('base64'),
                    role: data.role || 'member',
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`,
                    createdAt: new Date().toISOString()
                };
                
                db.users.push(user);
                
                const token = `token-${user.id}-${Date.now()}`;
                
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    user: { 
                        id: user.id, 
                        name: user.name, 
                        email: user.email,
                        role: user.role,
                        avatar: user.avatar
                    },
                    token: token
                }));
                
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
            }
        });
    }

    login(req, res) {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { email, password } = JSON.parse(body);
                
                if (!email || !password) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Email and password are required' }));
                    return;
                }
                
                const user = db.users.find(u => u.email === email && u.password === Buffer.from(password).toString('base64'));
                
                if (!user) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Invalid credentials' }));
                    return;
                }
                
                const token = `token-${user.id}-${Date.now()}`;
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    user: { 
                        id: user.id, 
                        name: user.name, 
                        email: user.email,
                        role: user.role,
                        avatar: user.avatar
                    },
                    token: token
                }));
                
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
            }
        });
    }

    getMe(req, res, user) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        }));
    }
}

module.exports = new AuthController();