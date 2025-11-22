const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Controller cần '_id', nhưng token thường lưu là 'id'. Ta map lại cho khớp:
        req.user = { 
            _id: decoded.id || decoded._id, // Chấp nhận cả 2 trường hợp
            roles: decoded.role ? [decoded.role] : (decoded.roles || []) // Chuẩn hóa thành mảng roles để controller check admin
        };
        
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

module.exports = auth;