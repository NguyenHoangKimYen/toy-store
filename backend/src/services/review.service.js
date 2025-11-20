const reviewRepo = require("../repositories/review.repository.js");
const Review = require("../models/review.model.js");
const Order = require("../models/order.model.js");
const OrderItem = require("../models/order-item.model.js");
const Variant = require("../models/variant.model.js");
const { Types } = require("mongoose");

class ReviewService {

    static _generateVariantName(attributes) {
        if (!attributes || attributes.length === 0) return "Original";
        return attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ');
    }

    // Xóa tham số imageUrls
    static async createReview({ userId, productId, variantId, rating, comment }) {

        // 1. Check Verified Purchase (Giữ nguyên)
        const deliveredOrders = await Order.find({
            userId: new Types.ObjectId(userId),
            status: 'delivered'
        }).select('_id');

        if (!deliveredOrders || deliveredOrders.length === 0) {
            throw new Error("Bạn chưa mua hoặc chưa nhận được sản phẩm nào để đánh giá.");
        }
        const deliveredOrderIds = deliveredOrders.map(order => order._id);

        const hasPurchasedItem = await OrderItem.findOne({
            orderId: { $in: deliveredOrderIds },
            productId: new Types.ObjectId(productId),
            variantId: new Types.ObjectId(variantId)
        });

        if (!hasPurchasedItem) {
            throw new Error("Bạn chưa mua biến thể sản phẩm này.");
        }

        // 2. Generate Name (Giữ nguyên)
        const variant = await Variant.findById(variantId);
        if (!variant) throw new Error("Biến thể sản phẩm không tồn tại.");
        const generatedVariantName = ReviewService._generateVariantName(variant.attributes);

        // 3. Check Spam (Giữ nguyên)
        const existingReview = await reviewRepo.findReviewByUserAndProduct(userId, productId);
        if (existingReview) throw new Error("Bạn đã đánh giá sản phẩm này rồi.");

        // 4. Create Review (Bỏ imageUrls)
        const newReview = await reviewRepo.createReview({
            userId,
            productId,
            variantId,
            variantName: generatedVariantName,
            rating,
            comment, // Chỉ lưu comment text
            isPublished: true
        });

        return newReview;
    }

    // Get Reviews (Giữ nguyên)
    static async getReviewsByProductId({ productId, page, limit, sort, filterRating }) {
        return await reviewRepo.getReviewsByProductId({ productId, page, limit, sort, filterRating });
    }

    // Update Review (Bỏ imageUrls)
    static async updateReview({ userId, reviewId, rating, comment }) {
        const review = await reviewRepo.findReviewById(reviewId);
        if (!review) throw new Error("Review không tồn tại");
        if (review.userId.toString() !== userId) throw new Error("Không có quyền sửa");

        // Chỉ update text và rating
        const updated = await reviewRepo.updateReviewById(reviewId, { rating, comment });

        // Tính lại điểm
        await Review.calcAverageRatings(review.productId);
        return updated;
    }

    // Delete Review (Giữ nguyên)
    static async deleteReview({ userId, reviewId, isAdmin }) {
        const review = await reviewRepo.findReviewById(reviewId);
        if (!review) throw new Error("Review không tồn tại");
        if (!isAdmin && review.userId.toString() !== userId) throw new Error("Không có quyền xóa");

        await reviewRepo.deleteReviewById(reviewId);
        await Review.calcAverageRatings(review.productId);
        return true;
    }
}

module.exports = ReviewService;