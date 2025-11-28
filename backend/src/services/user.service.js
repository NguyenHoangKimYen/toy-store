const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository.js');

/**
 * GỘP GET USER:
 * - /users?id=...
 * - /users?email=...
 * - /users?phone=...
 * - /users?username=...
 * - /users?keyword=...
 * - phân trang, filter role
 */
const getAllUsers = async (query) => {
    const {
        page = 1,
        limit = 20,
        id,
        email,
        phone,
        username,
        role,
        keyword,
    } = query;

    const filter = {};

    // === 1. Search trực tiếp theo ID/email/phone/username ===
    if (id) filter._id = id;
    if (email) filter.email = email;
    if (phone) filter.phone = phone;
    if (username) filter.username = username;

    // === 2. Lọc theo role ===
    if (role) filter.role = role;

    // === 3. Keyword search (full-text) ===
    if (keyword) {
        filter.$text = { $search: keyword };
    }

    // Nếu tìm 1 kết quả -> không cần phân trang
    const isSingleSearch = id || email || phone || username;

    const options = {
        skip: isSingleSearch ? 0 : (page - 1) * limit,
        limit: isSingleSearch ? 1 : parseInt(limit),
    };

    return userRepository.findAll(filter, options);
};

// Tạo user (admin hoặc hệ thống dùng)
const createUser = async (userData) => {
    const { password, role, ...rest } = userData;
    const allowedRoles = ['customer', 'admin'];
    const safeRole = allowedRoles.includes(role) ? role : 'customer';

    if (password) {
        rest.password = await bcrypt.hash(password, 10);
    }

    return userRepository.create({
        ...rest,
        role: safeRole,
    });
};

// Xác minh user
const setUserVerified = async (id, isVerified = true) => {
    const verifiedUser = await userRepository.setVerified(id, isVerified);
    if (!verifiedUser)
        throw new Error('User not found or verification update failed');
    return verifiedUser;
};

// Đặt mật khẩu mới
const setUserPassword = async (id, plainPassword) => {
    if (
        !plainPassword ||
        typeof plainPassword !== 'string' ||
        !plainPassword.trim() ||
        plainPassword.length < 8 ||
        plainPassword.length > 32
    ) {
        throw new Error('Invalid password');
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const updated = await userRepository.setPassword(id, hashedPassword);

    if (!updated) throw new Error('User not found or password update failed');

    return updated;
};

// Update user
const updateUser = async (id, userData) => {
    const updated = await userRepository.update(id, userData);
    if (!updated) throw new Error('User not found or update failed');
    return updated;
};

// Delete user
const deleteUser = async (id) => {
    const deleted = await userRepository.remove(id);
    if (!deleted) throw new Error('User not found or delete failed');
    return deleted;
};

module.exports = {
    getAllUsers,
    createUser,
    setUserVerified,
    setUserPassword,
    updateUser,
    deleteUser,
};
