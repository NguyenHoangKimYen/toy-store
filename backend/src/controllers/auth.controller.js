const { Result } = require('pg');
const authService = require('../services/auth.service.js');
const { expression } = require('joi');

const register = async (req, res, next) => {
    try {
        const { user, token } = await authService.register(req.body); //gọi service đăng ký
        res.status(201).json({
            success: true,
            message: 'Register Successfully',
            data: { user, token } });

    }catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {    
    //Yêu cầu OTP nếu đăng nhập sai 5 lần
    try {
        const { user, token, needOtp, message} = await authService.login(req.body);

        if (needOtp){
            return res.status(403).json({
                success: false,
                needOtp: true,
                message: message || 'Account need OTP Verification before Login',
            });
        }

        return res.json ({ //Valid Login
            success: true,
            message: 'Login Successfully',
            data: { user, token },    
        });
    } catch(error){
        return next(error);
    }
};

const verifyLoginOtp = async (req, res, next) => { //Xác thực OTP
    try {
        const { emailOrPhoneOrUsername, otp } = req.body;
        const { message } = await authService.verifyLoginOtp({ emailOrPhoneOrUsername, otp});
        return res.json({
            success: true, 
            message 
        });
    } catch (error) {
        return next(error);
    }
};

const resendLoginOtp = async (req, res, next) => { //gửi otp
    try {
        const { emailOrPhoneOrUsername } = req.body;
        const { message, expireAt } = await authService.resendLoginOtp({ emailOrPhoneOrUsername });
        return res.json({
            success: true,
            message,
            data: { expireAt }
        });
    } catch (error){
        return next(error);
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
    verifyLoginOtp,
    resendLoginOtp,
    profile,
};