const reviewRepo = require('../repositories/review.repository.js');
const OrderItem = require('../models/order-item.model.js');
const Variant = require('../models/variant.model.js');
const Review = require('../models/review.model.js');
const Order = require('../models/order.model.js');
const AIService = require('./ai-moderation.service.js');
const { Types } = require('mongoose');

// Import helper upload S3 (Đảm bảo đường dẫn file này đúng trong project của bạn)
const { uploadToS3, deleteFromS3 } = require('../utils/s3.helper.js');

// --- Internal Utility Function ---
const _generateVariantName = (attributes) => {
    if (!attributes || attributes.length === 0) return 'Original';
    return attributes.map((attr) => `${attr.name}: ${attr.value}`).join(', ');
};

// --- Main Service Functions ---

const createReview = async ({
    userId,
    productId,
    variantId,
    rating,
    comment,
    imgFiles,
}) => {
    // validate input basic
    if (!userId || !productId || !variantId)
        throw new Error('Missing required fields');
    if (
        !Types.ObjectId.isValid(userId) ||
        !Types.ObjectId.isValid(productId) ||
        !Types.ObjectId.isValid(variantId)
    ) {
        throw new Error('Invalid ID format');
    }

    // 1. Check Verified Purchase
    const deliveredOrders = await Order.find({
        userId: new Types.ObjectId(userId),
        status: 'delivered',
    }).select('_id');

    if (!deliveredOrders || deliveredOrders.length === 0) {
        throw new Error(
            'You have not purchased or received any products to review.',
        );
    }
    const deliveredOrderIds = deliveredOrders.map((order) => order._id);

    const hasPurchasedItem = await OrderItem.findOne({
        orderId: { $in: deliveredOrderIds },
        productId: new Types.ObjectId(productId),
        variantId: new Types.ObjectId(variantId),
    });

    if (!hasPurchasedItem) {
        throw new Error('You have not purchased this product variant.');
    }

    // 2. Generate Variant Name
    const variant = await Variant.findById(variantId);
    if (!variant) throw new Error('Product variant does not exist.');
    const generatedVariantName = _generateVariantName(variant.attributes);

    // 3. Check Spam (Already Reviewed?)
    const existingReview = await reviewRepo.findReviewByUserAndProduct(
        userId,
        productId,
    );
    if (existingReview)
        throw new Error('You have already reviewed this product.');

    // 4. Upload Images to S3 (If any)
    let imageUrls = [];
    if (imgFiles && imgFiles.length > 0) {
        // Folder trên S3 sẽ là "reviewImages"
        imageUrls = await uploadToS3(imgFiles, 'reviewImages');
    }

    const aiResult = await AIService.analyzeReviewContent(comment);

    let initialStatus = 'pending';
    if (aiResult.autoApprove) {
        initialStatus = 'approved';
    } else {
        initialStatus = 'flagged';
    }

    // 5. Create Review
    const newReview = await reviewRepo.createReview({
        userId,
        productId,
        variantId,
        variantName: generatedVariantName, // biến này lấy từ logic cũ
        rating,
        comment,
        imageUrls,

        // Field mới
        status: initialStatus,
        aiAnalysis: {
            isSafe: aiResult.isSafe,
            toxicScore: aiResult.toxicScore,
            flaggedCategories: aiResult.flaggedCategories,
            processedAt: new Date(),
        },
    });

    // 6. Recalculate Average Rating
    if (initialStatus === 'approved') {
        await Review.calcAverageRatings(productId);
    }

    return newReview;
};

const getReviewsByProductId = async ({
    productId,
    page,
    limit,
    sort,
    filterRating,
}) => {
    return await reviewRepo.getReviewsByProductId({
        productId,
        page,
        limit,
        sort,
        filterRating,
    });
};

const updateReview = async ({
    userId,
    reviewId,
    rating,
    comment,
    imgFiles,
    deletedImages,
}) => {
    const review = await reviewRepo.findReviewById(reviewId);
    if (!review) throw new Error('Review not found');

    // Check ownership
    if (review.userId.toString() !== userId)
        throw new Error('Permission denied to modify this review');

    // --- [MỚI] BỔ SUNG AI CHECK KHI UPDATE ---
    // Dù chỉ sửa rating hay sửa comment, ta cũng nên quét lại comment (vì comment được gửi lên lại)
    const aiResult = await AIService.analyzeReviewContent(comment);

    let newStatus = 'pending';
    if (aiResult.autoApprove) {
        newStatus = 'approved'; // Nếu AI thấy ổn thì cho hiện
    } else {
        newStatus = 'flagged'; // Nếu sửa thành nội dung xấu -> Chặn lại chờ Admin
    }
    // -----------------------------------------

    // --- LOGIC XỬ LÝ ẢNH UPDATE ---

    // 1. Chuẩn hóa danh sách ảnh muốn xóa
    let imagesToDelete = [];
    if (deletedImages) {
        imagesToDelete = Array.isArray(deletedImages)
            ? deletedImages
            : [deletedImages];
    }

    // 2. Tính toán số lượng ảnh sẽ còn lại
    const currentImagesKept = review.imageUrls.filter(
        (url) => !imagesToDelete.includes(url),
    );
    const newImageCount = imgFiles ? imgFiles.length : 0;
    const totalImages = currentImagesKept.length + newImageCount;

    // 3. Validate giới hạn 5 ảnh
    if (totalImages > 5) {
        throw new Error(
            `You can only have a maximum of 5 images. Current kept: ${currentImagesKept.length}, New: ${newImageCount}`,
        );
    }

    // 4. Xóa ảnh cũ trên S3
    if (imagesToDelete.length > 0) {
        await deleteFromS3(imagesToDelete);
    }

    // 5. Upload ảnh mới lên S3
    let newUploadedUrls = [];
    if (imgFiles && imgFiles.length > 0) {
        newUploadedUrls = await uploadToS3(imgFiles, 'reviewImages');
    }

    // 6. Gộp ảnh
    const finalImageUrls = [...currentImagesKept, ...newUploadedUrls];

    // --- CẬP NHẬT DB ---
    const updated = await reviewRepo.updateReviewById(reviewId, {
        rating,
        comment,
        imageUrls: finalImageUrls,

        // [MỚI] Cập nhật trạng thái và kết quả AI
        status: newStatus,
        aiAnalysis: {
            isSafe: aiResult.isSafe,
            toxicScore: aiResult.toxicScore,
            flaggedCategories: aiResult.flaggedCategories,
            processedAt: new Date(),
        },
    });

    await Review.calcAverageRatings(review.productId);

    return updated;
};

const deleteReview = async ({ userId, reviewId, isAdmin }) => {
    const review = await reviewRepo.findReviewById(reviewId);
    if (!review) throw new Error('Review not found');

    // Check perms
    if (!isAdmin && review.userId.toString() !== userId)
        throw new Error('Permission denied to delete this review');

    // 1. Xóa ảnh trên S3 trước (nếu có)
    if (review.imageUrls && review.imageUrls.length > 0) {
        await deleteFromS3(review.imageUrls);
    }

    // 2. Xóa trong DB
    await reviewRepo.deleteReviewById(reviewId);

    // 3. Tính lại rating
    await Review.calcAverageRatings(review.productId);
    return true;
};

const moderateReview = async ({ reviewId, adminId, status, reason }) => {
    const validStatus = ['approved', 'rejected'];
    if (!validStatus.includes(status))
        throw new Error("Invalid status. Use 'approved' or 'rejected'");

    const review = await reviewRepo.findReviewById(reviewId);
    if (!review) throw new Error('Review not found');

    // Update review
    const updatedReview = await reviewRepo.updateReviewById(reviewId, {
        status: status,
        moderatedBy: adminId,
        moderatedAt: new Date(),
        rejectionReason: reason || '',
    });

    // Luôn tính toán lại rating sau khi admin can thiệp
    // (Nếu reject thì trừ điểm ra, approve thì cộng điểm vào)
    await Review.calcAverageRatings(review.productId);

    return updatedReview;
};

module.exports = {
    createReview,
    getReviewsByProductId,
    updateReview,
    deleteReview,
    moderateReview,
};
