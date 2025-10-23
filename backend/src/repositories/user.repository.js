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
    .select(includePassword ? '+password' : '-password');
};

const findByUsername = async (username, includePassword = false) => {
    return User.findOne({ username })
    .populate({
        path: 'defaultAddressId',
        select: 'fullName phone addressLine city postalCode isDefault',
    })
    .select(includePassword ? '+password' : '-password'); 
};

const create = async (data) => {
    const user = new User(data);
    return user.save();
};

// Các trường không nên trả về công khai
const PUBLIC_PROJECTION =
  '-password -passwordHash -hashedPassword -resetToken -resetTokenExpires -__v';

// Đánh dấu người dùng đã được xác minh
const setVerified = (id, isVerified = true) => {
    return User.findByIdAndUpdate(id, { isVerified }, { new: true }).select(PUBLIC_PROJECTION);
};

const setPassword = (id, hashedFieldName, hashValue) => {
    return User.findByIdAndUpdate(id, { [hashedFieldName]: hashValue }, { new: true }).select(PUBLIC_PROJECTION);
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
    create,
    setVerified,
    setPassword,
    update,
    remove,
};
