const express = require('express');
const { register, login } = require('../controllers/auth.controller.js');
const { forgotPassword, resetPassword } = require('../controllers/password.controller.js');

const router = express.Router();

router.post('/register', register); //đăng ký
router.post('/login', login); //đăng nhập

router.post('/forgot-password', forgotPassword); //quên mật khẩu
router.post('/reset-password', resetPassword); //đặt lại mật khẩu

module.exports = router;