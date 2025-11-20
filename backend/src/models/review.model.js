const mongoose = require("mongoose");

// Import các model liên quan nếu cần thiết (để mongoose nhận diện ref)
// require("./product.model.js"); 
// require("./user.model.js");

const ReviewSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Lưu ID biến thể để validate đơn hàng
        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Variant", // Tham chiếu giống trong Product model của bạn
            required: true,
        },

        // Lưu snapshot tên biến thể để hiển thị frontend (VD: "Màu: Đỏ, Size: L")
        variantName: {
            type: String,
            required: true,
            trim: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            default: 5,
        },

        comment: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        isPublished: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
        collection: "reviews",
    }
);

// --- INDEX ---
// Đảm bảo 1 User chỉ review 1 Product một lần (tránh spam)
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// --- STATICS: TÍNH TOÁN RATING TRUNG BÌNH ---
ReviewSchema.statics.calcAverageRatings = async function (productId) {
    const stats = await this.aggregate([
        {
            $match: { productId: productId },
        },
        {
            $group: {
                _id: "$productId",
                nRating: { $sum: 1 },
                avgRating: { $avg: "$rating" },
            },
        },
    ]);

    // Cập nhật vào Model Product
    if (stats.length > 0) {
        await mongoose.model("Product").findByIdAndUpdate(productId, {
            averageRating: Math.round(stats[0].avgRating * 10) / 10, // Làm tròn 1 số thập phân (VD: 4.5)
            // Nếu Product model của bạn sau này có thêm field totalReviews thì update ở đây luôn:
            // totalReviews: stats[0].nRating 
        });
    } else {
        // Trường hợp xóa hết review
        await mongoose.model("Product").findByIdAndUpdate(productId, {
            averageRating: 0,
        });
    }
};

// --- MIDDLEWARE ---
// Gọi hàm tính toán sau khi TẠO review mới
ReviewSchema.post("save", function () {
    this.constructor.calcAverageRatings(this.productId);
});

// Gọi hàm tính toán sau khi UPDATE hoặc DELETE (với query middleware)
// Lưu ý: Cần cẩn thận khi dùng findByIdAndUpdate/Delete ở Controller để trigger cái này
// Nếu controller dùng logic đơn giản, bạn có thể gọi thẳng Review.calcAverageRatings() trong Service cho dễ kiểm soát.

module.exports = mongoose.model("Review", ReviewSchema);