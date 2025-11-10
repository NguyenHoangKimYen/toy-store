const jwt = require('jsonwebtoken');
const auth = (req , res, next) => {
    const authHeader = req.headers.authorization // Lấy header Authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1]; // Lấy token từ header, tách bỏ phần Bearer

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Giải mã token

        req.user = { id: decoded.id, role: decoded.role }; // Gắn thông tin user vào req để các middleware hoặc route handler sau có thể sử dụng
        next();

    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = auth;
