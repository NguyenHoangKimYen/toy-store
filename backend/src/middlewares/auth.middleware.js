const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("❌ No auth header or invalid format:", authHeader);
        return res
            .status(401)
            .json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    console.log("🔑 Received token:", token?.substring(0, 20) + "...");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token decoded successfully:", { id: decoded.id || decoded._id, role: decoded.role });

        req.user = {
            id: decoded.id || decoded._id,
            role: decoded.role, //AdminOnly dùng req.user.role
        };

        next();
    } catch (error) {
        console.error("❌ Token verification failed:", error.message);
        return res
            .status(401)
            .json({ success: false, message: "Invalid token" });
    }
};

module.exports = auth;
