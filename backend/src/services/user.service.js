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
        sortBy,
    } = query;

    const filter = {};

    // === 1. Search trực tiếp theo ID/email/phone/username ===
    if (id) filter._id = id;
    if (email) filter.email = email;
    if (phone) filter.phone = phone;
    if (username) filter.username = username;

    // === 2. Lọc theo role ===
    if (role) filter.role = role;

    // === 3. Keyword search using regex (works without text index) ===
    if (keyword && keyword.trim()) {
        const escapedKeyword = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(escapedKeyword, 'i');
        filter.$or = [
            { fullName: { $regex: searchRegex } },
            { email: { $regex: searchRegex } },
            { username: { $regex: searchRegex } },
            { phone: { $regex: searchRegex } }
        ];
    }

    // Nếu tìm 1 kết quả -> không cần phân trang
    const isSingleSearch = id || email || phone || username;

    // Build sort object based on sortBy parameter
    let sortOptions = { createdAt: -1 }; // Default: newest first
    if (sortBy) {
        switch (sortBy) {
            case 'newest':
                sortOptions = { createdAt: -1 };
                break;
            case 'oldest':
                sortOptions = { createdAt: 1 };
                break;
            case 'points-high':
                sortOptions = { loyaltyPoints: -1 };
                break;
            case 'points-low':
                sortOptions = { loyaltyPoints: 1 };
                break;
            default:
                sortOptions = { createdAt: -1 };
        }
    }

    const options = {
        skip: isSingleSearch ? 0 : (page - 1) * limit,
        limit: isSingleSearch ? 1 : parseInt(limit),
        sort: sortOptions,
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
        throw new Error("User not found or verification update failed");
    return verifiedUser;
};

// Đặt mật khẩu mới
const setUserPassword = async (id, plainPassword, currentPassword) => {
    if (
        !plainPassword ||
        typeof plainPassword !== 'string' ||
        !plainPassword.trim() ||
        plainPassword.length < 12 ||
        plainPassword.length > 32
    ) {
        throw new Error('Password must be 12-32 characters long');
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(plainPassword);
    const hasLowerCase = /[a-z]/.test(plainPassword);
    const hasNumber = /[0-9]/.test(plainPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        throw new Error('Password must contain uppercase, lowercase, and number');
    }

    // Verify current password - MUST use findByIdWithPassword to get the password field
    if (currentPassword) {
        const user = await userRepository.findByIdWithPassword(id);
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.password) {
            // User might have signed up with social login and has no password
            throw new Error('No password set for this account. Please use social login or reset password.');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            const error = new Error('Current password is incorrect');
            error.status = 400;
            throw error;
        }

        // Check if new password is the same as current password
        const isSamePassword = await bcrypt.compare(plainPassword, user.password);
        if (isSamePassword) {
            const error = new Error('New password cannot be the same as current password');
            error.status = 400;
            throw error;
        }
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
