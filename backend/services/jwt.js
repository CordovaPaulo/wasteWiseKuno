const jwt = require('jsonwebtoken');

function authenticateToken(requiredRole) {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];

        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided', code: 401});
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid or expired token', code: 403});
            }
            if (requiredRole && user.role !== requiredRole) {
                return res.status(403).json({ message: `Insufficient role. Required: ${requiredRole}, Received: ${user.role}`
                });
            }
            req.user = user;
            next();
        });
    };
}

const getValuesFromToken = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.log('No token provided');
        return null;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       return {
           id: decoded.id,
           username: decoded.username,
           email: decoded.email,
           role: decoded.role
       };
    } catch (err) {
        return null;
    }
}

module.exports = { authenticateToken, getValuesFromToken };