const {
    forgotPasswordSchema,
    resetPasswordSchema,
} = require('../services/password.service.js');
const passwordService = require('../services/password.service.js');
const userRepository = require('../repositories/user.repository.js');

const forgotPassword = async (req, res, next) => {
    try {
        const { value, error } = forgotPasswordSchema.validate(req.body, {
            abortEarly: false,
        });
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        const result = await passwordService.requestReset(
            value.emailOrPhoneOrUsername,
            {
                byEmail: (email) => userRepository.findByEmail(email, false),
                byPhone: (phone) => userRepository.findByPhone(phone, false),
                byUsername: (username) =>
                    userRepository.findByUsername(username, false),
            },
        );

        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { value, error } = resetPasswordSchema.validate(req.body, {
            abortEarly: false,
        });
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        await passwordService.resetPassword(
            value.userId,
            value.token,
            value.newPassword,
        );
        res.json({
            success: true,
            message: 'Password updated',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { forgotPassword, resetPassword };
