const Address = require("../models/address.model");
const User = require("../models/user.model");
const { calculateShippingFee } = require("../services/shipping.service.js");
const { verifyAddress } = require("../utils/vietmap.helper.js");

// Ghi log khi bị từ chối giao hoả tốc
function logExpressRejected(context) {
    const { userId = "guest", province, region } = context;
    console.warn(`${userId} - ${province} (${region}) không thể giao hoả tốc`);
}

//Cho user đã đăng nhập
exports.calculateShippingFeeByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).lean();
        if (!user)
            return res
                .status(404)
                .json({ success: false, message: "Không tìm thấy user" });

        // Lấy địa chỉ mặc định
        let address = null;
        if (user.defaultAddressId) {
            address = await Address.findById(user.defaultAddressId).lean();
        } else {
            address = await Address.findOne({ userId, isDefault: true }).lean();
        }

        if (!address)
            return res.status(400).json({
                success: false,
                message: "User chưa có địa chỉ mặc định",
            });

        const weightGram = Number(req.query.weightGram) || 1000;
        const orderValue = Number(req.query.orderValue) || 0;
        const hasFreeship = req.query.hasFreeship === "true";
        const deliveryType = req.query.deliveryType || "standard";

        //Tự động định vị nếu thiếu toạ độ
        let { lat, lng } = address;
        if ((!lat || !lng) && address.addressLine) {
            console.log(
                `Đang xác định tọa độ từ VietMap cho địa chỉ: ${address.addressLine}`,
            );
            const verified = await verifyAddress(address.addressLine);
            if (verified?.valid && verified.lat && verified.lng) {
                lat = verified.lat;
                lng = verified.lng;
                console.log(`Tìm được tọa độ: ${lat}, ${lng}`);
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Không thể xác định tọa độ từ địa chỉ",
                });
            }
        }

        const result = await calculateShippingFee(
            {
                province: address.city,
                lat,
                lng,
            },
            weightGram,
            orderValue,
            hasFreeship,
            deliveryType,
        );

        if (deliveryType === "express" && !result.isExpressAllowed) {
            logExpressRejected({
                userId,
                province: address.city,
                region: result.region,
            });
        }

        return res.json({
            success: true,
            addressUsed: {
                addressLine: address.addressLine,
                city: address.city,
                phone: address.phone,
                lat,
                lng,
            },
            ...result,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

//Cho khách chưa có tài khoản/ không đăng nhập
exports.getShippingFee = async (req, res) => {
    try {
        let {
            addressLine,
            lat,
            lng,
            province,
            district,
            weightGram,
            orderValue,
            hasFreeship,
            deliveryType,
        } = req.body;

        //API Vietmap tìm toạ độ
        if ((!lat || !lng) && addressLine) {
            console.log(`Đang tìm toạ độ cho địa chỉ: ${addressLine}...`);
            const verified = await verifyAddress(addressLine);
            if (verified?.valid && verified.lat && verified.lng) {
                lat = verified.lat;
                lng = verified.lng;
                console.log(`Lấy được toạ độ: ${lat}, ${lng}`);
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Không thể xác định toạ độ từ địa chỉ",
                });
            }
        }

        //Gọi service tính phí
        const result = await calculateShippingFee(
            { lat, lng, province, district },
            Number(weightGram) || 1000,
            Number(orderValue) || 0,
            hasFreeship === true || hasFreeship === "true",
            deliveryType || "standard",
        );

        if (deliveryType === "express" && !result.isExpressAllowed) {
            logExpressRejected({ province, region: result.region });
        }

        res.json({
            success: true,
            addressLine,
            lat,
            lng,
            ...result,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};
