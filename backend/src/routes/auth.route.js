const express = require('express');
const { register, login } = require('../controllers/auth.controller.js');

const router = express.Router();

router.post('/register', register); //đăng ký
router.post('/login', login); //đăng nhập

module.exports = router;