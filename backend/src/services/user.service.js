const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository.js');
require('../models/address.model.js');

const getAllUsers = async (query) => {
    const { page = 1, limit = 20, role, keyword } = query;
    const filter = {};
    
    if (role) filter.role = role;
    if (keyword) filter.$text = { $search: keyword };
    const options = {
        skip: (page - 1) * limit,
        limit: parseInt(limit),
        };
    return userRepository.findAll(filter, options);
}

const getUserById = async (id) => {
    const user = await userRepository.findById(id);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}

const getUserByEmail = async (email) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}

const getUserByPhone = async (phone) => {
    const user = await userRepository.findByPhone(phone);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}

const getUserByUsername = async (username) => {
    const user = await userRepository.findByUsername(username);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}

const createUser = async (userData) => {
    const { password, ...rest} = userData;

    if (password) {
        const saltRound = 10; //số vòng băm
        const hashedPassword = await bcrypt.hash(password, saltRound); //băm mật khẩu
        rest.password = hashedPassword;//gán mật khẩu đã băm vào dữ liệu người dùng
    }

    const user = await userRepository.create(rest); //tạo người dùng mới
    return user;
}

const setUserVerified = async (id, isVerified = true) => {
    const verifiedUser = await userRepository.setVerified(id, isVerified);
    if (!verifiedUser) {
        throw new Error('User not found or verification update failed');
    }
    return verifiedUser;
}

const setUserPassword = async (id, hashedFieldName, hashValue) => {
    const saltRound = 10; //số vòng băm
    const hashedPassword = await bcrypt.hash(hashValue, saltRound); //băm mật khẩu

    return userRepository.setPassword(id, hashedFieldName, hashedPassword); //tạo người dùng mới
}

const updateUser = async (id, userData) => {
    const updatedUser = await userRepository.update(id, userData);
    if (!updatedUser) {
        throw new Error('User not found or update failed');
    }
    return updatedUser;
}

const deleteUser = async (id) => {
    const deletedUser = await userRepository.remove(id);
    if (!deletedUser) {
        throw new Error('User not found or delete failed');
    }
    return deletedUser;
}

module.exports = {
    getAllUsers,
    getUserById,
    getUserByEmail,
    getUserByPhone,
    getUserByUsername,
    createUser,
    setUserVerified,
    setUserPassword,
    updateUser,
    deleteUser
};

