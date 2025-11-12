const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require("passport");
const passportGoogle = require("../config/passportGoogle.js");
const setupFacebookPassport = require("../config/passportFacebook.js");
const { register, login, verifyLoginOtp, resendLoginOtp, verifyEmail, googleCallback } = require('../controllers/auth.controller.js');
const { forgotPassword, resetPassword } = require('../controllers/password.controller.js');

setupFacebookPassport();

const router = express.Router();

//google login flow
router.get(
    "/google",
    passportGoogle.authenticate("google",
        {
            scope: ["profile", "email"],
            session: false,
            state: true,
        })
);

//after login google
router.get(
    "/google/callback",
    passportGoogle.authenticate("google", {
        failureRedirect: "/login?error=google",
        session: false,
    }),
    (req, res) => {
        const token = jwt.sign(
            {
                id: req.user._id,
                email: req.user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res
            .cookie('token', token, { //gửi cookie http-only, redirect về fe
                httpOnly: true,
                secure: true, // chỉ gửi qua HTTPS (khi bạn bật SSL)
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            })
            .send(`
                    <html>
                        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                        <h2>Đăng nhập Google được rồi nha Mẹ, Tự Vô Mongo mà check!</h2>
                        <p>Ai rảnh mà chào</p>
                        </body>
                    </html>
                `);

        // .redirect(`${process.env.FRONTEND_URL}/auth/success`); //fixing
    }
);

router.get(
    '/facebook',
    passport.authenticate('facebook', { scope: ['email'] })
);

router.get(
    '/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: `/login?error=facebook`,
        session: false,
    }),
    (req, res) => {
        const token = jwt.sign(
            {
                id: req.user._id,
                email: req.user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res
            .cookie('token', token, { //gửi cookie http-only, redirect về fe
                httpOnly: true,
                secure: true, // chỉ gửi qua HTTPS (khi bạn bật SSL)
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            })
            .send(`
                    <html>
                        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                        <h2>Đăng nhập Google được rồi nha Mẹ, Tự Vô Mongo mà check!</h2>
                        <p>Ai rảnh mà chào</p>
                        </body>
                    </html>
                `);

        // return res.redirect(`${FRONTEND_URL}/auth/success`);
    }
);

router.get('/verify-email', verifyEmail);

router.post("/register", register); //đăng ký
router.post("/login", login); //đăng nhập

router.post("/forgot-password", forgotPassword); //quên mật khẩu
router.post("/reset-password", resetPassword); //đặt lại mật khẩu

router.post("/login/verify-otp", verifyLoginOtp);
router.post("/login/resend-otp", resendLoginOtp);

module.exports = router;
