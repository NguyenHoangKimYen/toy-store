const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const passportGoogle = require("../config/passportGoogle.js");
const setupFacebookPassport = require("../config/passportFacebook.js");
const {
    register,
    login,
    verifyLoginOtp,
    resendLoginOtp,
    verifyEmail,
    googleCallback,
    profile,
    requestChangeEmailController,
    verifyChangeEmailController,
    requestChangePhoneController,
    verifyChangePhoneController,
    requestOldEmailOtpController,
    verifyOldEmailOtpController,
    requestNewEmailVerifyLinkController,
    confirmNewEmailController,
} = require("../controllers/auth.controller.js");
const {
    forgotPassword,
    resetPassword,
} = require("../controllers/password.controller.js");

setupFacebookPassport();

const router = express.Router();

//google login flow
router.get(
    "/google",
    passportGoogle.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
        state: true,
    }),
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
                role: req.user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" },
        );

        const target = new URL("https://www.milkybloomtoystore.id.vn");
        target.searchParams.set("token", token); // fallback nếu cookie không chia sẻ domain

        res.cookie("token", token, {
            //gửi cookie http-only, redirect về fe
            httpOnly: true,
            secure: true, // chỉ gửi qua HTTPS
            sameSite: "none", // cho phép chia sẻ giữa api. và www.
            domain: ".milkybloomtoystore.id.vn",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        }).redirect(target.toString());
    },
);

router.get(
    "/facebook",
    passport.authenticate("facebook", { scope: ["email"] }),
);

router.get(
    "/facebook/callback",
    passport.authenticate("facebook", {
        failureRedirect: `/login?error=facebook`,
        session: false,
    }),
    (req, res) => {
        const token = jwt.sign(
            {
                id: req.user._id,
                email: req.user.email,
                role: req.user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" },
        );

        const target = new URL("https://www.milkybloomtoystore.id.vn");
        target.searchParams.set("token", token);

        res.cookie("token", token, {
            //gửi cookie http-only, redirect về fe
            httpOnly: true,
            secure: true, // chỉ gửi qua HTTPS
            sameSite: "none", // cho phép chia sẻ giữa api. và www.
            domain: ".milkybloomtoystore.id.vn",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        }).redirect(target.toString());
    },
);

router.get("/verify-email", verifyEmail);

router.post("/register", register); //đăng ký
router.post("/login", login); //đăng nhập

router.post("/forgot-password", forgotPassword); //quên mật khẩu
router.post("/reset-password", resetPassword); //đặt lại mật khẩu

router.post("/login/verify-otp", verifyLoginOtp);
router.post("/login/resend-otp", resendLoginOtp);
router.get("/profile/:id", profile); //lấy thông tin người dùng hiện tại
router.post("/change-email/request-old-otp", requestOldEmailOtpController);
router.post("/change-email/verify-old-otp", verifyOldEmailOtpController);
router.post(
    "/change-email/request-new-email",
    requestNewEmailVerifyLinkController,
);
router.get("/change-email/confirm", confirmNewEmailController);
router.post("/change-phone/:id/request", requestChangePhoneController);
router.post("/change-phone/:id/verify", verifyChangePhoneController);

module.exports = router;
