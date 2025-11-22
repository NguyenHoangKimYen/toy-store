const haversine = require('haversine-distance');
const BRANCHES = require('../data/branches.js');
const { getWeatherCondition } = require('./weather.service');
const { applyLoyaltyToShipping } = require("../utils/loyalty-ship.helper.js");
const User = require("../models/user.model");

//Chuan hoa chu
function normalizeVN(str = '') {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function normalizeProvince(str = '') {
    let text = str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

    text = text.replace(/^tp\.?\s*/g, 'thanh pho ');
    text = text.replace(/ho chi minh city/g, 'thanh pho ho chi minh');
    text = text.replace(/hcm/g, 'ho chi minh');

    return text;
}

//Tìm kho hàng trung chuyển gần nhất
function findNearestWarehouse(address) {
    if (!address?.lat || !address?.lng) return null;

    let nearest = null;
    let minDist = Infinity;

    for (const wh of BRANCHES) {
        const dist = haversine(
            { lat: wh.lat, lng: wh.lng },
            { lat: address.lat, lng: address.lng }
        );
        if (dist < minDist) {
            minDist = dist;
            nearest = wh;
        }
    }

    return { ...nearest, distanceKm: +(minDist / 1000).toFixed(2) };
}

//Xác định vùng giao hàng dựa trên khoảng cách
function detectRegion(distanceKm) {
    if (distanceKm <= 20) return 'noi_thanh';
    if (distanceKm <= 40) return 'ngoai_thanh';
    if (distanceKm <= 300) return 'lien_vung_gan';
    return 'lien_vung_xa';
}

/**
 * 🚚 Tính phí giao hàng
 * @param {{lat:number,lng:number,province:string,addressLine?:string}} address
 * @param {number} weightGram
 * @param {number} orderValue
 * @param {boolean} hasFreeship
 * @param {'standard'|'express'} deliveryType
 */
async function calculateShippingFee(
    address,
    weightGram = 500,
    orderValue = 0,
    hasFreeship = false,
    deliveryType = 'standard'
) {
    const nearest = findNearestWarehouse(address);
    if (!nearest)
        return { fee: 0, region: 'unknown', distanceKm: 0, notes: ['Không thấy cửa hàng gần nhất'] };

    let distanceKm = nearest.distanceKm;
    let region = detectRegion(distanceKm);

    let baseFee = 0;
    let extraFee = 0;
    let notes = [];
    let isExpressAllowed = (region === 'noi_thanh');

    //Phí cơ bản theo vùng
    switch (region) {
        case 'noi_thanh':
            baseFee = 18000;
            extraFee = 2000;
            break;
        case 'ngoai_thanh':
            baseFee = 25000;
            extraFee = 2500;
            break;
        case 'lien_vung_gan':
            baseFee = 30000;
            extraFee = 3000;
            break;
        case 'lien_vung_xa':
            baseFee = 45000;
            extraFee = 5000;
            break;
    }

    //Trọng lượng > 1kg thì có thêm extra fee
    if (weightGram > 1000) {
        const extraWeight = weightGram - 1000;
        const steps = Math.ceil(extraWeight / 500);
        baseFee += steps * extraFee;
    }

    //Voucher / Freeship
    if (hasFreeship && orderValue >= 500000) {
        baseFee = 0;
        notes.push('FREESHIP');
    } else if (hasFreeship) {
        baseFee = Math.max(baseFee - 15000, 0);
        notes.push('DISCOUNT_DELIVERY');
    } else if (orderValue >= 500000) {
        baseFee = 0;
        notes.push('FREESHIP');
    }

    //Phí ship phụ thuộc vào thời tiết
    const weather = await getWeatherCondition(address.lat, address.lng);

    const matchedIsland = [
        { name: 'Phú Quốc', province: 'Kiên Giang' },
        { name: 'Côn Đảo', province: 'Bà Rịa - Vũng Tàu' },
        { name: 'Cát Bà', province: 'Hải Phòng' }
    ].find(
        area =>
            normalizeProvince(address.province) === normalizeProvince(area.province) &&
            normalizeVN(address.addressLine || '').includes(normalizeVN(area.name))
    );

    //Tạm thời không hỗ trợ giao hàng ở đảo
    if (matchedIsland) {
        return {
            success: false,
            region: 'dao',
            fee: 0,
            deliveryType,
            isExpressAllowed: false,
            notes: [`Hiện không hỗ trợ giao hàng đến khu vực đảo: ${matchedIsland.name}`],
        };
    }

    // Express chỉ áp dụng nội thành
    if (deliveryType === 'express' && !isExpressAllowed) {
        notes.push('Không thể giao hoả tốc tại khu vực này');
        return {
            nearestWarehouse: nearest,
            region,
            distanceKm,
            deliveryType: 'standard',
            isExpressAllowed: false,
            fee: Math.round(baseFee),
            notes,
            weather
        };
    }

    if (deliveryType === 'express' && isExpressAllowed) {
        if (weather.isBadWeather) {
            baseFee *= 1.3;
            notes.push(`Thời tiết xấu: ${weather.description} → phí hoả tốc tăng`);
        }

        const hour = new Date().getHours() + 7; // VN timezone
        const realHour = hour >= 24 ? hour - 24 : hour;

        if (realHour >= 20 || realHour < 6) {
            baseFee += 15000;
            notes.push('Phụ phí giao ban đêm');
        }

        if ((realHour >= 7 && realHour < 9) || (realHour >= 17 && realHour < 19)) {
            baseFee += 10000;
            notes.push('Phụ phí giờ cao điểm');
        }
    }

    // ⭐⭐⭐ ÁP DỤNG LOYALTY TIER ⭐⭐⭐
    let tier = "none";
    let discountFromTier = 0;

    if (address?.userId) {
        const user = await User.findById(address.userId).select("loyaltyTier");
        if (user) tier = user.loyaltyTier || "none";
    }

    // Nhận số tiền giảm từ helper
    discountFromTier = applyLoyaltyToShipping(tier, baseFee, deliveryType);

    // Trừ phí ship theo loyalty
    baseFee = Math.max(baseFee - discountFromTier, 0);

    // Ghi chú để FE hiển thị
    notes.push(`LOYALTY_APPLIED: ${tier}`);

    return {
        nearestWarehouse: nearest,
        region,
        distanceKm,
        deliveryType,
        isExpressAllowed,
        fee: Math.round(baseFee),
        notes,
        weather,
        loyaltyTier: tier,
        loyaltyDiscount: discountFromTier
    };
}

module.exports = {
    findNearestWarehouse,
    detectRegion,
    calculateShippingFee
};
