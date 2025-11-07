const { mongo } = require('mongoose');
const userService = require('../services/user.service.js');
const userRepository = require('../repositories/user.repository.js');
const { message } = require('statuses');
const { uploadToS3 } = require('../utils/s3.helper.js');

const getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers(req.query);
        res.json({ success: true, data: users });
    }
    catch (error) {
        return next(error); //lỗi middleware sẽ xử lý
    }
};

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongo.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }
        const user = await userService.getUserById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.json({ success: true, data: user });
    }
    catch (error) {
        return next(error);
    }
};

const getUserByEmail = async (req, res, next) => {
    try {
        const { email } = req.params;
        const user = await userService.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.json({ success: true, data: user });
    }
    catch (error) {
        return next(error);
    }
};   

const getUserByPhone = async (req, res, next) => {
    try {
        const { phone } = req.params;
        const user = await userService.getUserByPhone(phone);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.json({ success: true, data: user });
    }
    catch (error) {
        return next(error);
    }
};

const getUserByUsername = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await userService.getUserByUsername(username);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.json({ success: true, data: user });
    }
    catch (error) {
        return next(error);
    }
};

const createUser = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json({ success: true, data: user });
    }
    catch (error) {
        return next(error);
    }
};

const verifyUser = async (req, res, next) => {
    try {
        const { token } = req.body;
        const { id } = req.params;

        const user = await userRepository.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        if (user.verificationCode !== token) {
            return res.status(400).json({ success: false, message: "Invalid verification code" });
        }

        const verifiedUser = await userService.setUserVerified(id, true);
        res.json({ 
            success: true, 
            message: "User verified successfully",
            user: verifiedUser 
        });
    }
    catch (error) {
        return next(error);
    }
};

const setUserPassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { password, confirmPassword } = req.body;
        if (!mongo.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }
        if (!password || typeof password !== 'string' || !password.trim() || password.length < 8 || password.length > 32) { //kiểm tra tính hợp lệ của mật khẩu
            return res.status(400).json({ success: false, message: "Invalid password" });
        }

        if (confirmPassword !== undefined && password !== confirmPassword) { //kiểm tra xác nhận mật khẩu
            return res.status(400).json({ success: false, message: 'Password confirmation does not match' });
        }

        const user = await userService.setUserPassword(id, password); //cập nhật mật khẩu
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found or password update failed" });
        }
        return res.json({ success: true, data: user });
    }
    catch (error) {
        return next(error);
    }
};

const uploadAvatar = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const [url] = await uploadToS3([req.file], 'avatarImages');
        const user = await userRepository.update(id, { avatar: url });
        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: user
        });
    } catch (error){
        next(error);
    }
};

const updateAvatar = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongo.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Upload file lên S3
    const [url] = await uploadToS3([req.file], 'avatars');

    // Cập nhật avatar trong MongoDB
    const updatedUser = await userRepository.update(id, { avatar: url });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongo.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }
        const user = await userService.updateUser(id, req.body);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found or update failed" });
        }
        return res.json({ success: true, data: user });
    }
    catch (error) {
        return next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongo.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }
        const user = await userService.deleteUser(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found or delete failed" });
        }
        return res.json({ success: true, data: user });
    }
    catch (error) {
        return next(error);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    getUserByEmail,
    getUserByPhone,
    getUserByUsername,
    createUser,
    verifyUser,
    setUserPassword,
    updateUser,
    deleteUser,
    uploadAvatar,
    updateAvatar,
};