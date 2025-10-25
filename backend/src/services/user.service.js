const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository.js');
require('../models/address.model.js');

const getAllUsers = async (query) => {
    const { page = 1, limit = 20, role, keyword } = query;
    const filter = {};
    
    if (role) filter.role = role; //lọc theo vai trò người dùng
    if (keyword) filter.$text = { $search: keyword }; //tìm kiếm toàn văn bản trên các trường được đánh chỉ mục văn bản
    const options = {
        skip: (page - 1) * limit,
        limit: parseInt(limit),
        };
    return userRepository.findAll(filter, options); //truy xuất người dùng với bộ lọc và tùy chọn phân trang
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
    //Cập nhật trạng thái xác minh của người dùng
    const verifiedUser = await userRepository.setVerified(id, isVerified);
    if (!verifiedUser) { //nếu không tìm thấy người dùng hoặc cập nhật thất bại
        throw new Error('User not found or verification update failed');
    }
    return verifiedUser;
}

const setUserPassword = async (id, plainPassword) => {
    if (//kiểm tra tính hợp lệ của mật khẩu
        !plainPassword ||
        typeof plainPassword !== 'string' || 
        !plainPassword.trim() ||
        plainPassword.length < 8 ||
        plainPassword.length > 32
    )
    {
        throw new Error('Invalid password');
    }
    
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRound); //băm mật khẩu
    
    const updated = await userRepository.setPassword(id, hashedPassword);//cập nhật mật khẩu đã băm vào cơ sở dữ liệu
    if (!updated) {
        throw new Error('User not found or password update failed');
    }
    return updated;
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

