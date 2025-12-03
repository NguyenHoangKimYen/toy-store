const mongoose = require('mongoose');

require('./cart-item.model');

const CartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Cho phép null/undefined (khách vãng lai)
            // DON'T set default: null - omit the field entirely for guests
            // Nên tạo index độc nhất nếu userId tồn tại để 1 user chỉ có 1 cart
            // unique: true,
            // sparse: true,
        },

        // ID phiên làm việc (Session ID) - Dùng cho khách vãng lai (guest checkout)
        sessionId: {
            type: String,
            required: function () {
                // Yêu cầu sessionId nếu userId không tồn tại
                return !this.userId;
            },
            trim: true,
        },

        items: {
            type: [mongoose.Schema.Types.ObjectId], // Mảng chứa các mục hàng
            default: [],
        },

        totalPrice: {
            type: mongoose.Schema.Types.Decimal128,
            required: true,
            default: 0.0,
        },

        totalItems: {
            type: Number,
            required: true,
            default: 0,
        },

        discountCodeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DiscountCode', // Tham chiếu đến Model 'DiscountCode'
            default: null,
        },
    },
    {
        timestamps: true,
        collection: 'carts',
        toJSON: {
            transform: function (doc, ret) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
                // Convert Decimal128 to number for totalPrice
                if (ret.totalPrice) {
                    ret.totalPrice = parseFloat(ret.totalPrice.toString());
                }
                return ret;
            },
        },
    },
);

// Tạo index kết hợp để đảm bảo tính duy nhất:
// 1. userId: sparse unique index - mỗi user chỉ có 1 cart, null values allowed
// 2. sessionId: regular index for lookup (uniqueness enforced in application logic)
CartSchema.index({ userId: 1 }, { unique: true, sparse: true });
CartSchema.index({ sessionId: 1 }); // Not unique to allow nulls for user carts

module.exports = mongoose.model('Cart', CartSchema);
