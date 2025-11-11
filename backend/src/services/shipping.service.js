const haversine = require('haversine-distance');
const BRANCHES = require('../data/branches.js');
const { getWeatherCondition } = require('./weather.service');

//Chuan hoa chu
function normalizeVN(str = '') {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
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

//Xác định vùng giao hàng
function detectRegion(distanceKm, provinceFrom, provinceTo) {
    const from = normalizeVN(provinceFrom);
    const to = normalizeVN(provinceTo);

    if (from === to) {
        if (distanceKm <= 20) return 'noi_thanh'; //trong tp
        return 'ngoai_thanh'; //thu duc
    }
    if (distanceKm <= 300) return 'lien_vung_gan'; //cùng miền
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
    let region = detectRegion(distanceKm, nearest.province, address.province);

    let baseFee = 0;
    let extraFee = 0;
    let notes = [];

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
    if (deliveryType === 'express' && weather.isBadWeather) {
        baseFee *= 1.2;
        notes.push(`Trạng thái Thời tiết: ${weather.description}`);
    }

    //Hoả tốc: phụ phí theo giờ
    if (deliveryType === 'express') {
        const hour = new Date().getHours();

        // Ban đêm (20h–6h)
        if (hour >= 20 || hour < 6) {
            baseFee += 15000;
            notes.push('Ngoài giờ');
        }

        // Giờ cao điểm (7–9h, 17–19h)
        if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 19)) {
            baseFee += 10000;
            notes.push('Giờ cao điểm');
        }
    }

    //Hoả tốc chỉ hỗ trợ nội thành
    const isExpressAllowed = ['noi_thanh'].includes(region);
    if (!isExpressAllowed && deliveryType === 'express') {
        notes.push('Không thể giao hoả tốc');
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

    return {
        nearestWarehouse: nearest,
        region,
        distanceKm,
        deliveryType,
        isExpressAllowed,
        fee: Math.round(baseFee),
        notes,
        weather
    };
}

module.exports = {
    findNearestWarehouse,
    detectRegion,
    calculateShippingFee
};
