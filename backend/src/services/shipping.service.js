const haversine = require("haversine-distance");
const BRANCHES = require("../data/branches.js");
const { getWeatherCondition } = require("./weather.service");
const { applyLoyaltyToShipping } = require("../utils/loyalty-ship.helper.js");
const User = require("../models/user.model");

// Delivery type configurations
const DELIVERY_TYPES = {
    standard: {
        name: "Standard Shipping",
        description: "Delivered in 3-5 business days",
        feeMultiplier: 1.0,
        weatherFeeApplied: false,
        freeShippingThreshold: 500000,
        freeShippingDiscount: 1.0, // 100% off shipping
        estimatedDays: { min: 3, max: 5 },
    },
    economy: {
        name: "Economy Shipping",
        description: "Delivered in 5-7 business days",
        feeMultiplier: 0.7, // 30% cheaper than standard
        weatherFeeApplied: false,
        freeShippingThreshold: 500000,
        freeShippingDiscount: 1.0, // 100% off shipping
        estimatedDays: { min: 5, max: 7 },
    },
    express: {
        name: "Express Shipping",
        description: "Delivered in 1-2 business days",
        feeMultiplier: 1.5, // 50% more expensive than standard
        weatherFeeApplied: false,
        freeShippingThreshold: 500000,
        freeShippingDiscount: 1.0, // 100% off shipping
        estimatedDays: { min: 1, max: 2 },
        requiresUrbanArea: true, // Only available in urban areas
    },
    expedited: {
        name: "Expedited Shipping",
        description: "Priority delivery with weather-adjusted fees, same-day possible",
        feeMultiplier: 2.0, // 2x base price
        weatherFeeApplied: true, // Only this type has weather fees
        freeShippingThreshold: 500000,
        freeShippingDiscount: 0.3, // Only 30% off shipping (not 100%)
        estimatedDays: { min: 0, max: 1 },
        requiresUrbanArea: true,
    },
};

//Chuan hoa chu
function normalizeVN(str = "") {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function normalizeProvince(str = "") {
    let text = str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    text = text.replace(/^tp\.?\s*/g, "thanh pho ");
    text = text.replace(/ho chi minh city/g, "thanh pho ho chi minh");
    text = text.replace(/hcm/g, "ho chi minh");

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
            { lat: address.lat, lng: address.lng },
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
    if (distanceKm <= 20) return "noi_thanh";
    if (distanceKm <= 40) return "ngoai_thanh";
    if (distanceKm <= 300) return "lien_vung_gan";
    return "lien_vung_xa";
}

/**
 * Get list of available delivery types for a given region
 */
function getAvailableDeliveryTypes(region) {
    const isUrban = region === "noi_thanh";
    
    return Object.entries(DELIVERY_TYPES).map(([key, config]) => {
        const available = !config.requiresUrbanArea || isUrban;
        return {
            id: key,
            name: config.name,
            description: config.description,
            estimatedDays: config.estimatedDays,
            available,
            unavailableReason: !available ? "Only available in urban areas" : null,
        };
    });
}

/**
 * 🚚 Tính phí giao hàng
 * @param {{lat:number,lng:number,province:string,addressLine?:string}} address
 * @param {number} weightGram
 * @param {number} orderValue
 * @param {boolean} hasFreeship
 * @param {'standard'|'economy'|'express'|'expedited'} deliveryType
 */
async function calculateShippingFee(
    address,
    weightGram = 500,
    orderValue = 0,
    hasFreeship = false,
    deliveryType = "standard",
) {
    const nearest = findNearestWarehouse(address);
    if (!nearest)
        return {
            fee: 0,
            region: "unknown",
            distanceKm: 0,
            notes: ["Không thấy cửa hàng gần nhất"],
            availableDeliveryTypes: [],
        };

    let distanceKm = nearest.distanceKm;
    let region = detectRegion(distanceKm);
    const isUrban = region === "noi_thanh";

    // Get delivery type config
    const deliveryConfig = DELIVERY_TYPES[deliveryType] || DELIVERY_TYPES.standard;
    
    // Check if delivery type requires urban area
    if (deliveryConfig.requiresUrbanArea && !isUrban) {
        // Fallback to standard for non-urban areas
        deliveryType = "standard";
    }

    let baseFee = 0;
    let extraFee = 0;
    let notes = [];
    let weatherFee = 0;

    //Phí cơ bản theo vùng
    switch (region) {
        case "noi_thanh":
            baseFee = 18000;
            extraFee = 2000;
            break;
        case "ngoai_thanh":
            baseFee = 25000;
            extraFee = 2500;
            break;
        case "lien_vung_gan":
            baseFee = 30000;
            extraFee = 3000;
            break;
        case "lien_vung_xa":
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

    // Apply delivery type multiplier
    const activeConfig = DELIVERY_TYPES[deliveryType] || DELIVERY_TYPES.standard;
    baseFee *= activeConfig.feeMultiplier;
    notes.push(`Delivery: ${activeConfig.name}`);

    // Get weather data (needed for expedited shipping)
    const weather = await getWeatherCondition(address.lat, address.lng);

    // Check for island areas (not supported)
    const matchedIsland = [
        { name: "Phú Quốc", province: "Kiên Giang" },
        { name: "Côn Đảo", province: "Bà Rịa - Vũng Tàu" },
        { name: "Cát Bà", province: "Hải Phòng" },
    ].find(
        (area) =>
            normalizeProvince(address.province) ===
                normalizeProvince(area.province) &&
            normalizeVN(address.addressLine || "").includes(
                normalizeVN(area.name),
            ),
    );

    if (matchedIsland) {
        return {
            success: false,
            region: "dao",
            fee: 0,
            deliveryType,
            availableDeliveryTypes: [],
            notes: [
                `Hiện không hỗ trợ giao hàng đến khu vực đảo: ${matchedIsland.name}`,
            ],
        };
    }

    // Apply weather fee ONLY for expedited shipping
    if (deliveryType === "expedited" && activeConfig.weatherFeeApplied) {
        if (weather.isBadWeather) {
            weatherFee = Math.round(baseFee * 0.3); // 30% extra for bad weather
            baseFee += weatherFee;
            notes.push(`Weather surcharge (${weather.description}): +${weatherFee.toLocaleString()}₫`);
        }

        // Time-based surcharges for expedited
        const hour = new Date().getHours() + 7;
        const realHour = hour >= 24 ? hour - 24 : hour;

        if (realHour >= 20 || realHour < 6) {
            const nightFee = 15000;
            baseFee += nightFee;
            notes.push(`Night delivery surcharge: +${nightFee.toLocaleString()}₫`);
        }

        if ((realHour >= 7 && realHour < 9) || (realHour >= 17 && realHour < 19)) {
            const rushFee = 10000;
            baseFee += rushFee;
            notes.push(`Rush hour surcharge: +${rushFee.toLocaleString()}₫`);
        }
    }

    // Express delivery restrictions (urban only, no weather fees)
    if (deliveryType === "express" && !isUrban) {
        notes.push("Express not available, falling back to Standard");
        deliveryType = "standard";
    }

    // Apply free shipping / discounts
    const freeshipThreshold = activeConfig.freeShippingThreshold;
    const freeshipDiscount = activeConfig.freeShippingDiscount;

    if (hasFreeship && orderValue >= freeshipThreshold) {
        // Full freeship from voucher + order threshold
        baseFee = 0;
        notes.push("FREESHIP (voucher + order threshold)");
    } else if (orderValue >= freeshipThreshold) {
        // Order threshold discount
        const discountAmount = Math.round(baseFee * freeshipDiscount);
        baseFee = Math.max(baseFee - discountAmount, 0);
        
        if (freeshipDiscount === 1.0) {
            notes.push("FREESHIP (order ≥ 500,000₫)");
        } else {
            notes.push(`${Math.round(freeshipDiscount * 100)}% shipping discount (order ≥ 500,000₫)`);
        }
    } else if (hasFreeship) {
        // Freeship voucher but order under threshold
        baseFee = Math.max(baseFee - 15000, 0);
        notes.push("DISCOUNT_DELIVERY (voucher)");
    }

    // ⭐ Apply loyalty tier discount
    let tier = 'none';
    let discountFromTier = 0;

    if (address?.userId) {
        const user = await User.findById(address.userId).select('loyaltyRank');
        if (user) tier = user.loyaltyRank || 'none';
    }

    discountFromTier = applyLoyaltyToShipping(tier, baseFee, deliveryType);
    baseFee = Math.max(baseFee - discountFromTier, 0);

    if (discountFromTier > 0) {
        notes.push(`Loyalty discount (${tier}): -${discountFromTier.toLocaleString()}₫`);
    }

    return {
        nearestWarehouse: nearest,
        region,
        distanceKm,
        deliveryType,
        deliveryTypeName: activeConfig.name,
        estimatedDays: activeConfig.estimatedDays,
        availableDeliveryTypes: getAvailableDeliveryTypes(region),
        fee: Math.round(baseFee),
        baseFee: Math.round(baseFee),
        weatherFee,
        notes,
        weather: deliveryType === "expedited" ? weather : null, // Only show weather for expedited
        loyaltyTier: tier,
        loyaltyDiscount: discountFromTier,
    };
}

module.exports = {
    findNearestWarehouse,
    detectRegion,
    calculateShippingFee,
    getAvailableDeliveryTypes,
    DELIVERY_TYPES,
};
