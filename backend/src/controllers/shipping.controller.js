const Address = require('../models/address.model.js');
const { calculateDistance, calculateShippingFee } = require('../services/shipping.service.js');

// Giả sử kho cố định tại TDTU
const warehouse = {
  lat: 10.762622,
  lng: 106.660172,
  province: "Thành Phố Hồ Chí Minh",
  district: "Quận 7",
};

const calculateShipping = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { weight = 1, service = "standard" } = req.body;

    const address = await Address.findById(addressId);
    if (!address) return res.status(404).json({ success: false, message: "Address not found" });

    const distanceKm = calculateDistance(warehouse.lat, warehouse.lng, address.lat, address.lng);
    const { region, fee } = calculateShippingFee(distanceKm, weight, warehouse, address, service);

    res.json({
      success: true,
      data: {
        region,
        distanceKm: parseFloat(distanceKm.toFixed(2)),
        weight,
        service,
        shippingFee: fee
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { calculateShipping };
