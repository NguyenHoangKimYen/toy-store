const express = require('express');
const passport = require("../config/passport");
const { register, login, verifyLoginOtp, resendLoginOtp, verifyEmail, googleCallback } = require('../controllers/auth.controller.js');
const { forgotPassword, resetPassword } = require('../controllers/password.controller.js');

const router = express.Router();

//google login flow
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    googleCallback
);

router.get('/verify-email', verifyEmail);

router.post('/register', register); //đăng ký
router.post('/login', login); //đăng nhập

router.post('/forgot-password', forgotPassword); //quên mật khẩu
router.post('/reset-password', resetPassword); //đặt lại mật khẩu

router.post('/login/verify-otp', verifyLoginOtp);
router.post('/login/resend-otp', resendLoginOtp);

module.exports = router;
