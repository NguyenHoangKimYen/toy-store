const userRepository = require('../repositories/user.repository.js');
const bcrypt = require('bcrypt');
const Joi = require('joi');

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

//Đăng ký tài khoản mới/ mỗi lần đăng nhập, hệ thống sẽ gửi token để xác thực trước khi truy cập các tài nguyên
const register = async (data) => {
    const { value, error } = userSchema.validate(data, { abortEarly: false }); //validate dữ liệu
    if (error){
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

    const password = await bcrypt.hash(plainPassword, 10); //băm mật khẩu

    if (byEmail) {
        throw new Error('Email already in use');
    }
    if (byPhone) {
        throw new Error('Phone number already in use');
    }
    if (byUsername) {
        throw new Error('Username already in use');
    }

    // const saltRounds = 10;
    // const passwordHash = await bcrypt.hash(password, saltRounds); //mã hóa mật khẩu

    const verificationCode = generateRandomToken(6);//tạo mã xác minh ngẫu nhiên
    const verificationCodeExpires = new Date (Date.now * 5 * 60 * 1000) //5 phút

    const user = await userRepository.create({ //tạo người dùng mới
        fullName,
        email,
        phone,
        username,
        password: passwordHash,
        isVerified: false,
    });
    return { user: toPublicUser(user) }; //trả về user công khai
    //     verificationCode,
    //     verificationCodeExpires
    // });
    // return { user: toPublicUser(user), verificationCode }; //trả về user công khai và token
};

const login = async (payload) => {
    const { value, error } = loginSchema.validate(payload, { abortEarly: false }); //validate dữ liệu
    if (error){
        const message = error.details.map(detail => detail.message).join(', '); //gộp tất cả các lỗi
        throw new Error(message);
    }

    const { emailOrPhoneOrUsername, password } = value; //lấy định danh và mật khẩu
    console.log('Login attempt with identifier:', emailOrPhoneOrUsername);
    const detectIdentifierType = (s) => {
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return 'email';
        if (/^[0-9]{10,15}$/.test(s)) return 'phone';
        return 'username';
    };

    const type = detectIdentifierType(emailOrPhoneOrUsername); // Tìm user kèm password ngay từ đầu để tránh truy vấn lặp
    let user;

    switch (type){
        case 'email':
            user = await userRepository.findByEmail(emailOrPhoneOrUsername.trim().toLowerCase(), true);
            break;
        case 'phone':
            user = await userRepository.findByPhone(emailOrPhoneOrUsername.trim(), true);
            break;
        case 'username':
            user = await userRepository.findByUsername(emailOrPhoneOrUsername.trim(), true);
            break;
    }

    if (!user || !user.password){ //kiểm tra người dùng tồn tại
        throw new Error('Invalid credentials'); //Trả về thông báo chung để tránh dò tìm thông tin
    }

    const userWithPassword = await userRepository.findByIdWithPassword(user._id); //lấy thông tin người dùng bao gồm mật khẩu

    if (!userWithPassword){ //kiểm tra xem người dùng có mật khẩu không (TH đăng nhập mxh)
        throw new Error('Account has no password. Please set a password to login.');
    }

    const hash = user.password || user.passwordHash || user.hashedPassword;
    if (!hash || typeof hash !== 'string'){

        console.error('No password hash on user',{
            id: String(user._id),
            hasPassword: !!user.password,
            hasPasswordHash: !!user.passwordHash,
            hasHashedPassword: !!user.hashedPassword,
        });
        throw new Error('Account has no password. Please set a password to login.');
    }

    const valid = await bcrypt.compare(password, hash); //so sánh mật khẩu
    if (!valid){
        throw new Error('Invalid credentials');
    }

    if (!userWithPassword.isVerified){ //kiểm tra tài khoản đã được xác minh chưa
        throw new Error('Account is not verified. Please verify your account before logging in.');
    }

    return { user: toPublicUser(user) };
};

const profile = async (userId) => { //lấy thông tin hồ sơ người dùng
    const user = await userRepository.findById(userId);
    if (!user){
        throw new Error('User not found');
    }
    return toPublicUser(user); //trả về user công khai
};

module.exports = {
    register,
    login,
    profile,
};