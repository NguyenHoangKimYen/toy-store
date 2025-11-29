const jwt = require('jsonwebtoken');

/**
 * Optional Auth Middleware
 * Tries to populate req.user from JWT token if present, but doesn't block the request if not.
 * Use this for routes that work for both guests and logged-in users.
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // No token? That's fine, continue as guest
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            _id: decoded.id || decoded._id,
            id: decoded.id || decoded._id,
            role: decoded.role,
        };
    } catch (error) {
        // Invalid token? Continue as guest, don't block
        console.warn('Optional auth: Invalid token, continuing as guest');
    }

    next();
};

module.exports = optionalAuth;
