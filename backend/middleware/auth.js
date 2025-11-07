const db = require('../config/database');

const auth = (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'No token provided' }));
        return null;
    }
    
    const token = authHeader.split(' ')[1];
    const userId = token ? parseInt(token.split('-')[1]) : null;
    const user = db.users.find(u => u.id === userId);
    
    if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid token' }));
        return null;
    }
    
    return user;
};

module.exports = auth;