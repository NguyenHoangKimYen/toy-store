const userRepository = require('../repositories/user.repository.js');
const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Joi = require('joi');
const { generateToken, genOtp6, sha256 } = require('../utils/token.js');
const User = require('../models/user.model.js');
const { sendMail } = require('../libs/mailer.js');
const { message } = require('statuses');
const AWS = require('../config/aws.config.js');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://d1qc4bz6yrxl8k.cloudfront.net';
const VERIFY_TTL_MINUTES = Number(process.env.VERIFY_TTL_MINUTES || 15);

//Trường hợp đăng nhập sai quá 5 lần thì phải nhập otp
const MAX_FAILS = Number(process.env.LOGIN_MAX_FAILS || 5);
const OTP_TTL_MINUTES = Number(process.env.LOGIN_OTP_TTL_MINUTES || 10);

const userSchema = Joi.object({
    fullName: Joi.string().min(3).max(100).required(), // Họ và tên
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(), // Số điện thoại từ 10-15 chữ số
    username: Joi.string().alphanum().min(3).max(30).required(), // Tên đăng nhập
    password: Joi.string().min(8).max(32).required(),
});

const loginSchema = Joi.object({
    emailOrPhoneOrUsername: Joi.alternatives().try(//một field có thể hợp lệ nhiều kiểu
        Joi.string().email(),
        Joi.string().pattern(/^[0-9]{10,15}$/), // Số điện thoại
        Joi.string().alphanum().min(3).max(30) // Tên đăng nhập
    ).required(),
    password: Joi.string().min(8).max(32).required(),
})

    .rename('username', 'emailOrPhoneOrUsername', { ignoreUndefined: true, override: true })
    .rename('email', 'emailOrPhoneOrUsername', { ignoreUndefined: true, override: true })
    .rename('phone', 'emailOrPhoneOrUsername', { ignoreUndefined: true, override: true });

// const generateRandomToken = (length = 6) => {
//     return Math.random().toString().slice(2,8);
// };

const toPublicUser = (userDoc) => { //chuyển đổi đối tượng người dùng sang định dạng công khai
    if (!userDoc) return null;

    const obj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
    const { password, __v, ...publicUser } = obj;
    return publicUser;
};

const detectIdentifierType = (s) => {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return 'email';
    if (/^[0-9]{10,15}$/.test(s)) return 'phone';
    return 'username';
};

const findUserByIdentifier = async (identifier, withPassword = false) => {
    const type = detectIdentifierType(identifier);
    switch (type) {
        case 'email':
            return userRepository.findByEmail(identifier.trim().toLowerCase(), withPassword);
        case 'phone':
            return userRepository.findByPhone(identifier.trim(), withPassword);
        default:
            return userRepository.findByUsername(identifier.trim(), withPassword);
    }
};

//Đăng ký tài khoản mới/ mỗi lần đăng nhập, hệ thống sẽ gửi token để xác thực trước khi truy cập các tài nguyên
const register = async (data) => {
    const { value, error } = userSchema.validate(data, { abortEarly: false }); //validate dữ liệu
    if (error) {
        const message = error.details.map(detail => detail.message).join(', '); //gộp tất cả các lỗi
        throw new Error(message);
    }

    const fullName = value.fullName.trim();
    const email = value.email.trim().toLowerCase();
    const phone = value.phone.trim();
    const username = value.username.trim();
    const plainPassword = value.password;

    const [byEmail, byPhone, byUsername] = await Promise.all([ //truy vấn cùng lúc
        userRepository.findByEmail(email),
        userRepository.findByPhone(phone),
        userRepository.findByUsername(username),
    ]);

    const passwordHash = await bcrypt.hash(plainPassword, 10); //băm mật khẩu

    if (byEmail) {
        throw new Error('Email already in use');
    }
    if (byPhone) {
        throw new Error('Phone number already in use');
    }
    if (byUsername) {
        throw new Error('Username already in use');
    }

    const user = await userRepository.create({ //tạo người dùng mới
        fullName,
        email,
        phone,
        username,
        password: passwordHash,
        isVerified: false,
    });

    const token = generateToken();
    const tokenHash = sha256('verify:' + token);
    const expiresAt = new Date(Date.now() + VERIFY_TTL_MINUTES * 60 * 1000);

    await userRepository.setResetToken(user._id, { tokenHash, expiresAt });
    //Đường dẫn backend
    const verifyLink = `https://milkybloom.us-east-1.elasticbeanstalk.com/api/auth/verify-email?uid=${user._id}&token=${token}`;
    try {
        await sendMail({
            to: email,
            subject: 'Verify your email address',
            html: `
      <p>Xin chào ${fullName},</p>
      <p>Vui lòng xác thực email bằng cách nhấn vào liên kết sau (hạn ${VERIFY_TTL_MINUTES} phút):</p>
      <p><a href="${verifyLink}">${verifyLink}</a></p>
    `,
        });
    } catch (err) {
        console.error('[MAIL ERROR][VERIFY EMAIL]', err?.message || err);
    }

    return {
        message: 'Registration successful! Please check your email to verify your account.',
        user: toPublicUser(user),
    }
};

const createLoginOtp = async (userId) => {
    const otp = genOtp6();
    const otpHash = sha256(otp);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
    await userRepository.setLoginOtp(userId, { otpHash, expiresAt });
    return { otp, expiresAt };
};

const login = async (payload) => {
    const { value, error } = loginSchema.validate(payload, { abortEarly: false });
    if (error) {
        const message = error.details.map(d => d.message).join(', ');
        throw Object.assign(new Error(message), { status: 400 });
    }

    const { emailOrPhoneOrUsername, password } = value;

    // 1) Tìm user theo identifier (id)
    const found = await findUserByIdentifier(emailOrPhoneOrUsername);
    if (!found) throw Object.assign(new Error('Incorrect Login'), { status: 401 });

    // 2) Refetch với secrets để có password + resetOtp*
    const user = await userRepository.findByIdWithSecrets(found._id);
    if (!user) throw Object.assign(new Error('Incorrect Login'), { status: 401 });

    // 3) Nếu đang bị yêu cầu OTP thì buộc nhập OTP trước
    if (user.resetOtpHash && user.resetOtpExpiresAt && user.resetOtpExpiresAt > new Date()) {
        return { needOtp: true, message: 'The account requires OTP authentication.' };
    }

    // 4) Phải có hash password
    if (!user.password || typeof user.password !== 'string') {
        throw Object.assign(new Error('Account has no password. Please set a password to login.'), { status: 400 });
    }

    // 5) So sánh mật khẩu
    const valid = await bcrypt.compare(password, user.password);

    // 6) Nếu chưa verify
    if (!user.isVerified) {
        throw Object.assign(new Error('Account is not verified. Please verify your account before logging in.'), { status: 403 });
    }

    // 7) Sai mật khẩu → tăng đếm + có thể bật OTP
    if (!valid) {
        const updated = await userRepository.incFailLogin(user._id); // new:true để có giá trị mới nhất
        if ((updated.failLoginAttempts || 0) >= MAX_FAILS) {
            const otp = genOtp6();
            const otpHash = sha256(otp);
            const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

            await userRepository.setLoginOtp(updated._id, { otpHash, expiresAt });

            // Gửi mail nhưng không để lỗi mailer phá flow
            try {
                await sendMail({
                    to: updated.email,
                    subject: 'OTP Verification Code',
                    html: `
            <p>Xin chào ${updated.fullName || updated.username},</p>
            <p>Bạn đã nhập sai mật khẩu quá ${MAX_FAILS} lần. Mã OTP của bạn:</p>
            <h2 style="letter-spacing:3px;">${otp}</h2>
            <p>Mã có hiệu lực trong ${OTP_TTL_MINUTES} phút.</p>
          `,
                });
            } catch (e) {
                console.error('[MAIL ERROR][LOGIN OTP]', e?.message || e);
            }

            return { needOtp: true, message: `Incorrect ${MAX_FAILS} times. Please enter the OTP.` };
        }

        throw Object.assign(new Error('Login is incorrect'), { status: 401 });
    }

    // 8) Đúng mật khẩu → reset đếm sai
    await userRepository.resetFailLogin(user._id);

    return { user: toPublicUser(user) };
};

const verifyLoginOtp = async ({ emailOrPhoneOrUsername, otp }) => {
    if (!otp || String(otp).length !== 6) {
        throw Object.assign(new Error('Invalid OTP'), { status: 400 });
    }

    const found = await findUserByIdentifier(emailOrPhoneOrUsername);
    if (!found) throw Object.assign(new Error('Invalid User'), { status: 404 });

    const user = await userRepository.findByIdWithSecrets(found._id);
    if (!user?.resetOtpExpiresAt || user.resetOtpExpiresAt < new Date()) {
        throw Object.assign(new Error('OTP expired'), { status: 400 });
    }

    if (!user.resetOtpHash) {
        throw Object.assign(new Error('OTP does not exist'), { status: 400 });
    }

    if (sha256(otp) !== user.resetOtpHash) {
        throw Object.assign(new Error('OTP incorrect'), { status: 400 });
    }

    await userRepository.clearLoginOtp(user._id);
    return { ok: true, message: 'OTP Verification Success. Please login again.' };
};

const profile = async (userId) => { //lấy thông tin hồ sơ người dùng
    const user = await userRepository.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return toPublicUser(user); //trả về user công khai
};

// export const getAWSCredentials = async (googleIdToken, facebookIdToken) => { //authentication processing
//     const credentials = new AWS.CognitoIdentityCredentials({
//         IdentityPoolId: 'us-east-1:7b6f9245-55c1-4578-84cc-2c8f6f95982c',
//         Logins: {
//             'accounts.google.com': googleIdToken,
//             'graph.facebook.com': facebookIdToken
//         },
//     });

//     await credentials.getPromise(); // chờ Cognito cấp accessKey/secretKey tạm thời

//     return {
//         accessKeyId: credentials.accessKeyId,
//         secretAccessKey: credentials.secretAccessKey,
//         sessionToken: credentials.sessionToken,
//     };
// };


module.exports = {
    register,
    login,
    createLoginOtp,
    verifyLoginOtp,
    profile,
};
