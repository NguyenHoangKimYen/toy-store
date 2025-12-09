const { token } = require('morgan');
const User = require('../models/user.model.js');

const findAll = async (filter = {}, options = {}) => {
    const [users, total] = await Promise.all([
        User.find(filter)
            .populate({
                path: "defaultAddressId",
                select: "fullName phone addressLine city postalCode isDefault",
            })
            .skip(options.skip || 0)
            .limit(options.limit || 20)
            .sort(options.sort || { createdAt: -1 })
            .select("-password"), //không trả về password
        User.countDocuments(filter)
    ]);
    
    const page = Math.floor((options.skip || 0) / (options.limit || 20)) + 1;
    const limit = options.limit || 20;
    
    return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

const findById = async (id) => {
    return User.findById(id)
        .populate({
            path: "defaultAddressId",
            select: "fullName phone addressLine city postalCode isDefault",
        })
        .select("-password"); //không trả về password
};

const findByEmail = async (email, includePassword = false) => {
    return User.findOne({ email })
        .populate({
            path: "defaultAddressId",
            select: "fullName phone addressLine city postalCode isDefault",
        })
        .select(includePassword ? "+password" : "-password"); //hiển thị hoặc không hiển thị password
};

const findByEmailOrPhone = async (email, phone) => {
    return User.findOne({
        $or: [{ email }, { phone }],
    })
        .populate({
            path: "defaultAddressId",
            select: "fullName phone addressLine city postalCode isDefault",
        })
        .select("-password");
};

const findByPhone = async (phone, includePassword = false) => {
    return User.findOne({ phone })
        .populate({
            path: "defaultAddressId",
            select: "fullName phone addressLine city postalCode isDefault",
        })
        .select(includePassword ? "+password" : "-password"); //hiển thị hoặc không hiển thị password
};

const findByUsername = async (username, includePassword = false) => {
    return User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } })
        .populate({
            path: "defaultAddressId",
            select: "fullName phone addressLine city postalCode isDefault",
        })
        .select(includePassword ? "+password" : "-password");
};

// Tìm người dùng theo ID và bao gồm trường mật khẩu
const findByIdWithPassword = async (id) => {
    return User.findById(id).select("+password").populate({
        path: "defaultAddressId",
        select: "fullName phone addressLine city postalCode isDefault",
    });
};

const create = async (data) => {
    //lấy toàn bộ thông tin người dùng
    const user = new User(data);
    return await user.save();
};

// Các trường không nên trả về công khai
const PUBLIC_PROJECTION =
    '-password -__v -resetTokenHash -resetTokenExpiresAt -resetOtpHash -resetOtpExpiresAt';

// Đánh dấu người dùng đã được xác minh
const setVerified = (id, isVerified = true) => {
    return User.findByIdAndUpdate(id, { isVerified }, { new: true }).select(
        PUBLIC_PROJECTION,
    );
};

const setPassword = (id, hashValue) => {
    //cập nhật mật khẩu người dùng
    return User.findByIdAndUpdate(
        id,
        { password: hashValue },
        { new: true },
    ).select(PUBLIC_PROJECTION);
};

const setResetToken = (id, { tokenHash, expiresAt }) => {
    //đặt lại mật khẩu
    return User.findByIdAndUpdate(
        id,
        {
            $set: {
                resetTokenHash: tokenHash, // <- String
                resetTokenExpiresAt: expiresAt, // <- Date
            },
        },
        { new: true },
    ).select(PUBLIC_PROJECTION);
};

const clearResetToken = (id) => {
    //xóa token sau khi đặt lại mật khẩu / hết hạn
    return User.findByIdAndUpdate(
        id,
        {
            resetTokenHash: null,
            resetTokenExpiresAt: null,
            resetOtpHash: null,
            resetOtpExpiresAt: null,
        },
        { new: true },
    ).select(PUBLIC_PROJECTION);
};

const accountIsVerified = (id) => {
    return User.findByIdAndUpdate(
        id,
        {
            $set: {
                isVerified: true,
                verifiedAt: new Date(),
            },
            $unset: {
                resetTokenHash: '',
                resetTokenExpiresAt: '',
            },
        },
        { new: true },
    );
};

const findByIdWithSecrets = async (id) => {
    // Tìm người dùng theo ID bao gồm tất cả các trường bí mật
    return User.findById(id)
        .select(
            "+password +resetTokenHash +resetTokenExpiresAt +resetOtpHash +resetOtpExpiresAt +changeEmailOldOtpHash +changeEmailOldOtpExpiresAt +verifyNewEmailTokenHash +verifyNewEmailExpiresAt +changePhoneOtpHash +changePhoneOtpExpiresAt",
        )
        .populate({
            path: "defaultAddressId",
            select: "fullName phone addressLine city postalCode isDefault",
        });
};

//Trường hợp đăng nhập sai quá 5 lần

const incFailLogin = async (id) => {
    return User.findByIdAndUpdate(
        id,
        { $inc: { failLoginAttempts: 1 } },
        { new: true, runValidators: false },
    ).select("+password"); //so sánh mật khẩu
};

const resetFailLogin = async (id) => {
    //nếu người dùng đăng nhập thành công, số lần đăng nhập sai sẽ được reset
    return User.findByIdAndUpdate(
        id,
        { $set: { failLoginAttempts: 0 } },
        { new: true },
    );
};

const setLoginOtp = async (id, { otpHash, expiresAt }) => {
    return User.findByIdAndUpdate(
        id,
        {
            $set: {
                resetOtpHash: otpHash,
                resetOtpExpiresAt: expiresAt,
                failLoginAttempts: 0,
            },
        },
        { new: true },
    );
};

const clearLoginOtp = async (id) => {
    //xoá otp sau khi user xác minh thành công
    return User.findByIdAndUpdate(
        id,
        {
            $set: {
                resetOtpHash: null,
                resetOtpExpiresAt: null,
            },
        },
        { new: true },
    );
};

const setOldEmailOtp = (userId, otpHash, expiresAt) => {
    return User.findByIdAndUpdate(
        userId,
        {
            changeEmailOldOtpHash: otpHash,
            changeEmailOldOtpExpiresAt: expiresAt,
        },
        { new: true },
    );
};

const setPendingNewEmail = (userId, newEmail, tokenHash, expiresAt) => {
    return User.findByIdAndUpdate(
        userId,
        {
            pendingNewEmail: newEmail,
            verifyNewEmailTokenHash: tokenHash,
            verifyNewEmailExpiresAt: expiresAt,
        },
        { new: true },
    );
};

const setChangeEmailOtp = (id, { otpHash, expiresAt, pendingNewEmail }) => {
    return User.findByIdAndUpdate(
        id,
        {
            changeEmailOldOtpHash: otpHash,
            changeEmailOldOtpExpiresAt: expiresAt,
            pendingNewEmail,
        },
        { new: true },
    );
};

const applyNewEmail = (id, newEmail) => {
    return User.findByIdAndUpdate(
        id,
        {
            email: newEmail,
            pendingNewEmail: null,
            verifyNewEmailTokenHash: null,
            verifyNewEmailExpiresAt: null,
            changeEmailOldOtpHash: null,
            changeEmailOldOtpExpiresAt: null,
        },
        { new: true },
    );
};

const setChangePhoneOtp = (id, { otpHash, expiresAt, pendingPhone }) => {
    return User.findByIdAndUpdate(
        id,
        {
            changePhoneOtpHash: otpHash,
            changePhoneOtpExpiresAt: expiresAt,
            pendingPhone,
        },
        { new: true },
    );
};

const applyNewPhone = (id, newPhone) => {
    return User.findByIdAndUpdate(
        id,
        {
            phone: newPhone,
            pendingPhone: null,
            changePhoneOtpHash: null,
            changePhoneOtpExpiresAt: null,
        },
        { new: true },
    );
};

const update = async (id, data) => {
    return User.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
        context: "query", //để các validator hoạt động đúng trong update
    })
        .populate({
            path: "defaultAddressId",
            select: "fullName phone addressLine city postalCode isDefault",
        })
        .select("-password"); //không trả về password
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
    findByEmailOrPhone,
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
    accountIsVerified,
    setOldEmailOtp,
    setPendingNewEmail,
    setChangeEmailOtp,
    applyNewEmail,
    setChangePhoneOtp,
    applyNewPhone,
};
