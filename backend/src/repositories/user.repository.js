const { token } = require('morgan');
const User = require('../models/user.model.js');

const findAll = async (filter = {}, options = {}) => {
    return User.find(filter)
    .populate({
        path: 'defaultAddressId',
        select: 'fullName phone addressLine city postalCode isDefault',
    })
    .skip(options.skip || 0)
    .limit(options.limit || 20)
    .sort(options.sort || { createdAt: -1 })
    .select('-password'); //không trả về password
};

const findById = async (id) => {
    return User.findById(id)
    .populate({
        path: 'defaultAddressId',
        select: 'fullName phone addressLine city postalCode isDefault',
    })
    .select('-password'); //không trả về password
};

const findByEmail = async (email, includePassword =false) => {
    return User.findOne({ email })
    .populate({
        path: 'defaultAddressId',
        select: 'fullName phone addressLine city postalCode isDefault',
    })
    .select(includePassword ? '+password' : '-password'); //hiển thị hoặc không hiển thị password
};

const findByPhone = async (phone, includePassword = false) => {
    return User.findOne({ phone })
    .populate({
        path: 'defaultAddressId',
        select: 'fullName phone addressLine city postalCode isDefault',
    })
    .select(includePassword ? '+password' : '-password'); //hiển thị hoặc không hiển thị password
};

const findByUsername = async (username, includePassword = false) => {
    return User.findOne({ username })
    .populate({
        path: 'defaultAddressId',
        select: 'fullName phone addressLine city postalCode isDefault',
    })
    .select(includePassword ? '+password' : '-password'); //hiển thị hoặc không hiển thị password
};

// Tìm người dùng theo ID và bao gồm trường mật khẩu
const findByIdWithPassword = async (id) => {
    return User.findById(id).select('+password')
    .populate({ 
        path: 'defaultAddressId', 
        select: 'fullName phone addressLine city postalCode isDefault',
    });
};

const create = (data) => { //tạo người dùng mới
  const { fullName, email, phone, username, password } = data;
  return new User({ fullName, email, phone, username, password }).save();
};

// Các trường không nên trả về công khai
const PUBLIC_PROJECTION =
    '-password -__v -resetTokenHash -resetTokenExpiresAt -resetOtpHash -resetOtpExpiresAt';

// Đánh dấu người dùng đã được xác minh
const setVerified = (id, isVerified = true) => {
    return User.findByIdAndUpdate(id, { isVerified }, { new: true }).select(PUBLIC_PROJECTION);
};

const setPassword = (id, hashValue) => { //cập nhật mật khẩu người dùng
    return User.findByIdAndUpdate(id, { password: hashValue }, { new: true })
    .select(PUBLIC_PROJECTION);
};

const setResetToken = (id, { tokenHash, expiresAt }) => { //đặt lại mật khẩu
    return User.findByIdAndUpdate(
        id,
    {
    $set: {
        resetTokenHash: tokenHash,      // <- String
        resetTokenExpiresAt: expiresAt, // <- Date
      },
    },
    { new: true }
    ).select(PUBLIC_PROJECTION);
};

const clearResetToken = (id) => { //xóa token sau khi đặt lại mật khẩu / hết hạn
    return User.findByIdAndUpdate(id, {
        resetTokenHash: null,
        resetTokenExpiresAt: null,
        resetOtpHash: null,
        resetOtpExpiresAt: null,
    }, { new: true }).select(PUBLIC_PROJECTION);
};

const accountIsVerified = (id) => {
    return User.findByIdAndUpdate(id, {
        $set:{
            isVerified: true,
            verifiedAt: new Date(),
            resetTokenHash: null,
            resetTokenExpiresAt: null,
        },
    },{ new: true });
}

const findByIdWithSecrets = async (id) => { // Tìm người dùng theo ID bao gồm tất cả các trường bí mật
    return User.findById(id)
    .select('+password +resetTokenHash +resetTokenExpiresAt +resetOtpHash +resetOtpExpiresAt')
    .populate({
        path: 'defaultAddressId',
        select: 'fullName phone addressLine city postalCode isDefault',
    });
};

//Trường hợp đăng nhập sai quá 5 lần

const incFailLogin = async (id) => {
    return User.findByIdAndUpdate(
        id,
        { $inc: { failLoginAttempts: 1 } },
        { new: true, runValidators: false}
    ).select('+password'); //so sánh mật khẩu
};

const resetFailLogin = async (id) => { //nếu người dùng đăng nhập thành công, số lần đăng nhập sai sẽ được reset
    return User.findByIdAndUpdate(
        id,
        { $set: {failLoginAttempts: 0 } },
        { new: true }
    );
};

const setLoginOtp = async (id, { otpHash, expiresAt}) => {
    return User.findByIdAndUpdate(
        id,
        {
            $set: {
                resetOtpHash: otpHash,
                resetOtpExpiresAt: expiresAt,
                failLoginAttempts: 0,
            },
        },
        { new: true }
    );
};

const clearLoginOtp = async (id) => { //xoá otp sau khi user xác minh thành công
    return User.findByIdAndUpdate(
        id,
        {
        $set: {
            resetOtpHash: null,
            resetOtpExpiresAt: null,
            },
        },
        { new: true }
    );
};

const update = async (id, data) => {
    return User.findByIdAndUpdate(
        id,
        data,
        { 
            new: true,
            runValidators: true,
            context : 'query' //để các validator hoạt động đúng trong update
        })
    .populate({ 
        path: 'defaultAddressId',
        select: 'fullName phone addressLine city postalCode isDefault',
    })
    .select('-password'); //không trả về password
};

const remove = async (id) => {
    return User.findByIdAndDelete(id);
};

module.exports = {
    findAll,
    findById,
    findByEmail,
    findByPhone,
    findByUsername,
    findByIdWithPassword,
    create,
    setVerified,
    setPassword,
    setResetToken,
    clearResetToken,
    findByIdWithSecrets,
    update,
    remove,
    incFailLogin,
    resetFailLogin,
    setLoginOtp,
    clearLoginOtp,
    accountIsVerified
};
