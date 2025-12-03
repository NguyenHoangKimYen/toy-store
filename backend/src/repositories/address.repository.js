const { options, date } = require("joi");
const Address = require("../models/address.model.js");
const User = require("../models/user.model.js");

const findAll = async (filter = {}, options = {}) => {
    //tìm tắt cả
    return Address.find(filter)
        .populate({
            path: "userId",
            select: "fullNameOfReceiver email phone defaultAddressId",
            populate: {
                path: "defaultAddressId",
                select: "fullNameOfReceiver phone addressLine city postalCode isDefault",
            },
        })
        .skip(options.skip || 0) //phân trang
        .limit(options.limit || 20)
        .sort(options.sort || { createdAt: -1 });
};

const findById = async (id) => {
    //tìm địa chỉ theo ID
    return Address.findById(id).populate({
        path: "userId",
        select: "fullNameOfReceiver email phone defaultAddressId",
    });
};

const findByUserId = async (userId) => {
    //tim tat ca dia chi cua mot user
    return Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
};

//tạo địa chỉ
const create = async (data) => {
    const {
        userId,
        fullNameOfReceiver,
        phone,
        addressLine,
        city,
        postalCode,
        lat,
        lng,
        isDefault,
    } = data;
    return new Address({
        userId,
        fullNameOfReceiver,
        phone,
        addressLine,
        city,
        postalCode,
        lat,
        lng,
        isDefault: !!isDefault, //boolean
    }).save();
};

//update dia chi
const update = async (id, data) => {
    return Address.findByIdAndUpdate(id, data, {
        new: true, //trả về document sau khi cập nhật
        runValidators: true, //kiểm tra trước khi lưu
        context: "query",
    });
};

//xoá địa chỉ theo ID
const remove = async (id) => {
    return Address.findByIdAndDelete(id);
};

//huỷ đánh dấu mặc định địa chỉ cũ trước khi set default địa chỉ mới
const unsetDefault = async (userId) => {
    return Address.updateMany({ userId }, { $set: { isDefault: false } });
};

//set default cho địa chỉ
const setDefault = async (userId, addressId) => {
    // Hủy bỏ mọi cờ isDefault trước
    await Address.updateMany({ userId }, { $set: { isDefault: false } });

    // Kiểm tra địa chỉ có tồn tại không
    const address = await Address.findById(addressId);
    if (!address) {
        console.warn(`⚠️ setDefault: Không tìm thấy addressId ${addressId}`);
        return null;
    }

    // Gán địa chỉ này làm mặc định
    await Address.findByIdAndUpdate(addressId, { isDefault: true });
    await User.findByIdAndUpdate(userId, { defaultAddressId: addressId });

    return Address.findById(addressId);
};

async function findDefaultByUserId(userId) {
    return Address.findOne({ userId, isDefault: true });
}

module.exports = {
    findAll,
    findById,
    findByUserId,
    create,
    update,
    remove,
    unsetDefault,
    setDefault,
    findDefaultByUserId,
};
