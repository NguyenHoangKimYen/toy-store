const { mongo } = require("mongoose");
const addressService = require("../services/address.service.js");
const addressRepository = require("../repositories/address.repository.js");
const { verifyAddress } = require("../utils/vietmap.helper.js");
const { date } = require("joi");

// Lấy tất cả địa chỉ (có thể lọc theo userId)
const getAllAddresses = async (req, res, next) => {
    try {
        const addresses = await addressService.getAllAddresses(req.query);
        res.json({ success: true, data: addresses });
    } catch (error) {
        return next(error);
    }
};

// Lấy danh sách địa chỉ của một người dùng
const getAddressesByUserId = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!mongo.ObjectId.isValid(userId)) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid user ID' });
        }

        const addresses = await addressService.getAddressesByUserId(userId);
        if (!addresses || addresses.length === 0) {
            return res
                .status(404)
                .json({
                    success: false,
                    message: 'No addresses found for this user',
                });
        }

        return res.json({ success: true, data: addresses });
    } catch (error) {
        return next(error);
    }
};

// Lấy chi tiết 1 địa chỉ theo ID
const getAddressById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongo.ObjectId.isValid(id)) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid address ID' });
        }

        const address = await addressService.getAddressById(id);
        if (!address) {
            return res
                .status(404)
                .json({ success: false, message: 'Address not found' });
        }

        return res.json({ success: true, data: address });
    } catch (error) {
        return next(error);
    }
};

// Tạo địa chỉ mới
const createAddress = async (req, res, next) => {
    try {
        const { addressLine } = req.body;

        //Kiem tra dia chi hop le
        const { valid, formatted, lat, lng } = await verifyAddress(addressLine);
        if (!valid) {
            console.warn("VietMap xác minh thất bại cho:", addressLine);
            return res.status(400).json({
                success: false,
                message: "Địa chỉ không hợp lệ!",
            });
        }

        req.body.addressLine = formatted;
        req.body.lat = typeof lat === "number" ? lat : null;
        req.body.lng = typeof lng === "number" ? lng : null;

        const address = await addressService.createAddress(req.body);
        res.status(201).json({
            success: true,
            data: address,
        });
    } catch (error) {
        console.error('createAddress error:', error);
        return next(error);
    }
};

// Cập nhật thông tin địa chỉ
const updateAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongo.ObjectId.isValid(id)) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid address ID' });
        }

        //kiểm tra địa chỉ mới có hợp lệ không
        if (req.body.addressLine) {
            const { valid, formatted, lat, lng } = await verifyAddress(
                req.body.addressLine,
            );
            if (!valid) {
                console.warn(
                    'VietMap xác minh thất bại cho:',
                    req.body.addressLine,
                );
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Address!',
                });
            }

            req.body.addressLine = formatted;
            req.body.lat = typeof lat === "number" ? lat : null;
            req.body.lng = typeof lng === "number" ? lng : null;
        }

        const address = await addressService.updateAddress(id, req.body);
        if (!address) {
            return (
                res.status(404),
                json({
                    success: false,
                    message: 'Address not found or update failed',
                })
            );
        }

        return res.json({
            success: true,
            data: address,
        });
    } catch (error) {
        console.error("updateAddress error:", error);
        return next(error);
    }
};

// Đặt địa chỉ mặc định cho user
const setDefaultAddress = async (req, res, next) => {
    try {
        const { userId, addressId } = req.params;

        if (
            !mongo.ObjectId.isValid(userId) ||
            !mongo.ObjectId.isValid(addressId)
        ) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: 'Invalid user ID or address ID',
                });
        }

        const updated = await addressService.setDefaultAddress(
            userId,
            addressId,
        );
        if (!updated) {
            return res
                .status(404)
                .json({
                    success: false,
                    message: 'Failed to set default address',
                });
        }

        return res.json({
            success: true,
            message: 'Default address updated successfully',
            data: updated,
        });
    } catch (error) {
        return next(error);
    }
};

// Xóa địa chỉ
const deleteAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongo.ObjectId.isValid(id)) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid address ID' });
        }

        const address = await addressService.deleteAddress(id);
        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found or delete failed',
            });
        }

        return res.json({ success: true, data: address });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getAllAddresses,
    getAddressesByUserId,
    getAddressById,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
};
