const addressRepository = require("../repositories/address.repository.js");
const userRepository = require("../repositories/user.repository.js");

const getAllAddresses = async (query) => {
    //lay het dia chi
    const { page = 1, limit = 20, userId } = query;
    const filter = {};

    if (userId) filter.userId = userId;

    const options = {
        skip: (page - 1) * limit,
        limit: parseInt(limit),
    };

    return addressRepository.findAll(filter, options);
};

//lay dia chi theo id
const getAddressById = async (id) => {
    const address = await addressRepository.findById(id);
    if (!address) {
        throw new Error("Address not found");
    }
    return address;
};

//lay danh sach dia chi cua nguoi dung cu the
const getAddressByUserId = async (userId) => {
    const addresses = await addressRepository.findByUserId(userId);
    if (!addresses || addresses.length === 0) {
        throw new Error("No address found for this user");
    }
    return addresses;
};

const getAddressesByUserId = async (userId) => getAddressByUserId(userId);

const createAddress = async (addressData) => {
    const { userId, isDefault } = addressData;

    if (!userId) {
        throw new Error("userId is required to create address");
    }

    if (isDefault) {
        await addressRepository.unsetDefault(userId);
    }

    const address = await addressRepository.create(addressData); //lưu db

    if (isDefault) {
        //cập nhật mặc định
        await userRepository.update(userId, { defaultAddressId: address._id });
    }

    return address;
};

//cập nhật địa chỉ
const updateAddress = async (id, addressData) => {
    const updated = await addressRepository.update(id, addressData);
    if (!updated) {
        throw new Error("Address not found or update failed");
    }
    return updated;
};

const setDefaultAddress = async (userId, addressId) => {
    const updated = await addressRepository.setDefault(userId, addressId);
    if (!updated) {
        throw new Error("Failed to set default address");
    }
    return updated;
};

//xoá địa chỉ
const deleteAddress = async (id) => {
    const deleted = await addressRepository.remove(id);
    if (!deleted) {
        throw new Error("Address not found or delete failed");
    }

    const user = await userRepository.findById(deleted.userId);
    if (!user) {
        throw new Error("User not found for this address");
    }

    const remaining = await addressRepository.findByUserId(deleted.userId);

    if (remaining.length === 0) {
        await userRepository.update(user._id, { defaultAddressId: null });
        return deleted;
    }

    if (
        user.defaultAddressId?.toString() === id ||
        deleted.isDefault === true ||
        !user.defaultAddressId
    ) {
        const newDefault = remaining[0];
        await addressRepository.setDefault(user._id, newDefault._id);
    }

    return deleted;
};

module.exports = {
    getAllAddresses,
    getAddressById,
    getAddressByUserId,
    getAddressesByUserId,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
};
