/**
 * 🎖 Áp dụng loyalty tier cho phí vận chuyển
 * @param {"none"|"silver"|"gold"|"diamond"} tier
 * @param {number} baseFee  phí ship gốc (sau khi tính vùng, cân nặng, voucher, thời tiết, ...)
 * @param {"standard"|"express"} deliveryType
 * @returns {number} discountAmount  số tiền được giảm
 */
function applyLoyaltyToShipping(tier, baseFee, deliveryType) {
    switch (tier) {
        case "silver":
            // Silver: giảm 10k cho standard
            return deliveryType === "standard" ? 10_000 : 0;

        case "gold":
            // Gold: freeship standard
            return deliveryType === "standard" ? baseFee : 0;

        case "diamond":
            // Diamond: freeship tất cả
            return baseFee;

        case "none":
        default:
            return 0;
    }
}

module.exports = { applyLoyaltyToShipping };
