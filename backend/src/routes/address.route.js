const express = require("express");
const auth = require("../middlewares/auth.middleware.js");

const {
    getAllAddresses,
    getAddressesByUserId,
    getAddressById,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
} = require("../controllers/address.controller.js");

const {
    getAddressSuggestions,
} = require("../controllers/vietmap.controller.js");
const router = express.Router();
//VietMap api gợi ý địa chỉ, autocomplete
router.get("/suggest", getAddressSuggestions);

// (Tùy chọn) Route lấy địa chỉ mặc định của người dùng hiện tại
router.get("/default/:userId", auth, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const addressService = require("../services/address.service.js");
        const addresses = await addressService.getAddressesByUserId(userId);
        const defaultAddress = addresses.find((a) => a.isDefault);
        if (!defaultAddress) {
            return res
                .status(404)
                .json({ success: false, message: "No default address found" });
        }
        res.json({ success: true, data: defaultAddress });
    } catch (error) {
        next(error);
    }
});

// Lấy tất cả địa chỉ (có thể lọc theo userId, phân trang)
router.get('/', getAllAddresses);

// Lấy toàn bộ địa chỉ của một người dùng
router.get('/user/:userId', getAddressesByUserId);

// Lấy chi tiết một địa chỉ theo ID
router.get('/:id', getAddressById);

// Tạo địa chỉ mới cho người dùng
router.post('/', createAddress);

// Cập nhật thông tin địa chỉ
router.put('/:id', updateAddress);

// Đặt địa chỉ mặc định cho người dùng
///api/addresses/:userId/default/:addressId
router.patch('/:userId/default/:addressId', setDefaultAddress);

// Xóa địa chỉ
router.delete('/:id', deleteAddress);

module.exports = router;
