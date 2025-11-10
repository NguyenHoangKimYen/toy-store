const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // bán kính Trái Đất (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // km
};

const calculateShippingFee = (distanceKm) => {
    if (distanceKm <= 5) return 15000;
    if (distanceKm <= 10) return 25000;
    if (distanceKm <= 20) return 35000;
    return 50000;
};

module.exports = { calculateDistance, calculateShippingFee };
