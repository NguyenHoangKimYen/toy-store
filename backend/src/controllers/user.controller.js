const userService = require('../services/user.service.js');
const userRepository = require('../repositories/user.repository.js');
const { uploadToS3 } = require('../utils/s3.helper.js');

// GET USERS (GỘP PARAM)
const getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers(req.query);
        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

// CREATE USER (ADMIN ONLY)
const createUser = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// VERIFY USER
const verifyUser = async (req, res, next) => {
    try {
        const { id, token } = req.query;

        if (!id || !token) {
            return res.status(400).json({
                success: false,
                message: 'Missing id or token',
            });
        }

        const user = await userRepository.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (user.verificationCode !== token) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code',
            });
        }

        const verifiedUser = await userService.setUserVerified(id, true);

        res.json({
            success: true,
            message: 'User verified successfully',
            data: verifiedUser,
        });
    } catch (error) {
        next(error);
    }
};

// SET USER PASSWORD
const setUserPassword = async (req, res, next) => {
    try {
        const { id } = req.query;
        const { password, confirmPassword } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Missing user id',
            });
        }

        if (!password || password.length < 8 || password.length > 32) {
            return res.status(400).json({
                success: false,
                message: 'Invalid password',
            });
        }

        if (confirmPassword !== undefined && password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password confirmation does not match',
            });
        }

        const updated = await userService.setUserPassword(id, password);

        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

// UPDATE USER
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Missing user id',
            });
        }

        const updated = await userService.updateUser(id, req.body);

        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

// DELETE USER
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Missing user id',
            });
        }

        const deleted = await userService.deleteUser(id);

        res.json({ success: true, data: deleted });
    } catch (error) {
        next(error);
    }
};

// UPLOAD AVATAR (POST)
const uploadAvatar = async (req, res, next) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Missing user id',
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        const [url] = await uploadToS3([req.file], 'avatarImages');
        const updated = await userRepository.update(id, { avatar: url });

        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

// UPDATE AVATAR (PATCH)
const updateAvatar = async (req, res, next) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Missing user id',
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        const [url] = await uploadToS3([req.file], 'avatars');
        const updatedUser = await userRepository.update(id, { avatar: url });

        res.json({
            success: true,
            message: 'Avatar updated successfully',
            data: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    createUser,
    verifyUser,
    setUserPassword,
    updateUser,
    deleteUser,
    uploadAvatar,
    updateAvatar,
};
