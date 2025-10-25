const authService = require('../services/auth.service.js');

const register = async (req, res, next) => {
    try {
        const { user, token } = await authService.register(req.body); //gọi service đăng ký
        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            data: { user, token } });

    }catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { user, token } = await authService.login(req.body); //gọi service đăng nhập
        res.json({ 
            success: true,
            message: 'Đăng nhập thành công', 
            data: { user, token } });
    } catch (error) {
        next(error);
    }
};

const profile = async (req, res, next) => {
    try {
        const userProfile = await authService.profile(req.user.id); //gọi service lấy thông tin người dùng
        res.json({ 
            success: true, 
            message: 'Lấy thông tin người dùng thành công',
            data: userProfile });
    }catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    profile,
};