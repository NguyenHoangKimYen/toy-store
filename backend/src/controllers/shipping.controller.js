const Address = require('../models/address.model.js');
const { calculateDistance, calculateShippingFee } = require('../services/shipping.service.js');

// Giả sử kho cố định tại TDTU
const warehouse = { lat: 10.762622, lng: 106.660172 };

const calculateShipping = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    // Lấy địa chỉ khách hàng
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({
        success: false, 
        message: 'Address not found' 
        });
    }

    const distanceKm = calculateDistance(
      warehouse.lat,
      warehouse.lng,
      address.lat,
      address.lng
    );

    const shippingFee = calculateShippingFee(distanceKm);

    res.json({
      success: true,
      data: {
        from: warehouse,
        to: {
            lat: address.lat, 
            lng: address.lng 
        },
        distanceKm: parseFloat(distanceKm.toFixed(2)),
        shippingFee
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { calculateShipping };
