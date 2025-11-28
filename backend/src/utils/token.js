const crypto = require('crypto');

const generateToken = () => crypto.randomBytes(16).toString('hex'); //tạo token ngẫu nhiên dài 32 ký tự
const genOtp6 = () => String(Math.floor(100000 + Math.random() * 900000)); //taọ otp 6 số
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex'); //băm chuỗi sử dụng thuật toán sha256

module.exports = {
    generateToken,
    genOtp6,
    sha256,
};
