// const { Result } = require('pg');
const authService = require("../services/auth.service.js");
// const { expression } = require('joi');
const { generateToken, sha256 } = require('../utils/token.js');
const userRepository = require('../repositories/user.repository.js');
const { mongo } = require('mongoose');
const { message } = require('statuses');

const resolveUserId = (req) => req.user?.id || req.params?.id || req.body?.userId;

const register = async (req, res, next) => {
    try {
        const { user, token } = await authService.register(req.body); //gọi service đăng ký
        res.status(201).json({
            success: true,
            message: "Register Successfully",
            data: { user, token },
        });
    } catch (error) {
        next(error);
    }
};

const verifyEmail = async (req, res, next) => {
    try {
        const { uid, token } = req.query;
        if (!uid || !token) {
            return res.status(400).json({
                success: false,
                message: "Missing token or user id",
            });
        }

        if (!mongo.ObjectId.isValid(uid)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }

        const user = await userRepository.findByIdWithSecrets(uid);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.resetTokenHash || !user.resetTokenExpiresAt) {
            return res.status(400).json({
                success: false,
                message: "Invalid or already verified",
            });
        }

        if (user.resetTokenExpiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Token expired",
            });
        }

        const expected = sha256("verify:" + token);
        if (expected !== user.resetTokenHash) {
            return res.status(400).json({
                success: false,
                message: "Token invalid",
            });
        }

        await userRepository.accountIsVerified(uid);
        return res.json({
            success: true,
            message: "Email verified successfully! You can now login.",
        });
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    //Yêu cầu OTP nếu đăng nhập sai 5 lần
    try {
        const { user, token, needOtp, message } = await authService.login(
            req.body,
        );

        if (needOtp) {
            return res.status(403).json({
                success: false,
                needOtp: true,
                message:
                    message || "Account need OTP Verification before Login",
            });
        }

        // Merge guest cart into user cart if sessionId provided
        const sessionId = req.headers['x-session-id'] || req.body.sessionId;
        console.log('🔑 Login - sessionId from header:', sessionId, 'userId:', user._id);
        if (sessionId && user._id) {
            try {
                const cartService = require('../services/cart.service');
                console.log('📞 Calling mergeGuestCartIntoUserCart...');
                await cartService.mergeGuestCartIntoUserCart(user._id, sessionId);
                console.log('✅ Cart merge completed successfully');
                // Clear the guest sessionId from client after merge
            } catch (cartError) {
                console.error('❌ Error merging carts on login:', cartError);
                // Don't fail login if cart merge fails
            }
        } else {
            console.log('⚠️ Skipping merge - sessionId:', !!sessionId, 'userId:', !!user._id);
        }

        return res.json({
            //Valid Login
            success: true,
            message: "Login Successfully",
            data: { user, token },
        });
    } catch (error) {
        return next(error);
    }
};

const verifyLoginOtp = async (req, res, next) => {
    //Xác thực OTP
    try {
        const { emailOrPhoneOrUsername, otp } = req.body;
        const { message } = await authService.verifyLoginOtp({
            emailOrPhoneOrUsername,
            otp,
        });
        return res.json({
            success: true,
            message,
        });
    } catch (error) {
        return next(error);
    }
};

const resendLoginOtp = async (req, res, next) => {
    //gửi otp
    try {
        const { emailOrPhoneOrUsername } = req.body;
        const { message, expireAt } = await authService.resendLoginOtp({
            emailOrPhoneOrUsername,
        });
        return res.json({
            success: true,
            message,
            data: { expireAt },
        });
    } catch (error) {
        return next(error);
    }
};

const googleCallback = (req, res) => {
    try {
        const token = generateToken(req.user);
        res.status(200).json({ success: true, token });
    } catch (error) {
        console.error("Google callback error:", error);
        res.status(500).json({ success: false, message: "Google login failed" });
    }
};

const profile = async (req, res, next) => {
    try {
        const userProfile = await authService.profile(req.user.id); //gọi service lấy thông tin người dùng
        res.json({
            success: true,
            message: "Lấy thông tin người dùng thành công",
            data: userProfile,
        });
    } catch (error) {
        next(error);
    }
};

const requestChangePhoneController = async (req, res, next) => {
    try {
        const { newPhone } = req.body;
        const result = await authService.requestChangePhone(req.params.id, newPhone);
        res.json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};

const verifyChangePhoneController = async (req, res, next) => {
    try {
        const { otp } = req.body;
        const result = await authService.verifyChangePhone(req.params.id, otp);
        res.json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};

const requestOldEmailOtpController = async (req, res, next) => {
    try {
        const userId = resolveUserId(req);
        if (!userId) {
            return res.status(400).json({ success: false, message: "User id is required" });
        }
        const result = await authService.requestChangeEmailOldOtp(userId);
        res.json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};

const verifyOldEmailOtpController = async (req, res, next) => {
    try {
        const userId = resolveUserId(req);
        const { otp } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User id is required" });
        }
        if (!otp) {
            return res.status(400).json({ success: false, message: "OTP is required" });
        }
        const result = await authService.verifyChangeEmailOldOtp(userId, otp);
        res.json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};

const requestNewEmailVerifyLinkController = async (req, res, next) => {
    try {
        const userId = resolveUserId(req);
        const { newEmail } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User id is required" });
        }
        if (!newEmail) {
            return res.status(400).json({ success: false, message: "New email is required" });
        }
        const result = await authService.requestNewEmailVerifyLink(userId, newEmail);
        res.json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};

const confirmNewEmailController = async (req, res, next) => {
    try {
        const { uid, token } = req.query;
        if (!uid || !token) {
            return res.status(400).json({ success: false, message: "Missing uid or token" });
        }
        const result = await authService.confirmNewEmail(uid, token);
        res.json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    register,
    login,
    verifyLoginOtp,
    resendLoginOtp,
    profile,
    verifyEmail,
    googleCallback,
    requestChangePhoneController,
    verifyChangePhoneController,
    requestOldEmailOtpController,
    verifyOldEmailOtpController,
    requestNewEmailVerifyLinkController,
    confirmNewEmailController,
};
