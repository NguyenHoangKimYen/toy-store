const orderRepository = require("../repositories/order.repository");
const itemRepo = require("../repositories/order-item.repository");
const historyRepo = require("../repositories/order-status-history.repository");
const bcrypt = require("bcrypt");
const userRepository = require("../repositories/user.repository.js");
const addressRepo = require("../repositories/address.repository");
const paymentRepo = require("../repositories/payment.repository");
const { sendMail } = require("../libs/mailer.js");
const { generateToken, sha256 } = require("../utils/token.js");
const { calculateShippingFee } = require("../services/shipping.service");
const { getWeatherCondition } = require("../services/weather.service");
const cartRepository = require("../repositories/cart.repository");
const cartItemRepository = require("../repositories/cart-item.repository");
const loyaltyService = require("../services/loyalty.service");
const badgeService = require("../services/badge.service");
const CoinTransactionRepository = require("../repositories/coin-transaction.repository");
const discountCodeService = require("../services/discount-code.service");
const { checkAndAssignBadges } = require("../services/badge.service");
const voucherRepository = require("../repositories/voucher.repository");
const userVoucherRepository = require("../repositories/user-voucher.repository");

const VERIFY_TTL_MINUTES = Number(process.env.VERIFY_TTL_MINUTES || 15);
const BACKEND_URL =
    process.env.BACKEND_URL ||
    process.env.BASE_URL ||
    "https://api.milkybloomtoystore.id.vn";

async function sendVerifyEmail(user) {
    const token = generateToken();
    const tokenHash = sha256("verify:" + token);
    const expiresAt = new Date(Date.now() + VERIFY_TTL_MINUTES * 60 * 1000);

    await userRepository.setResetToken(user._id, { tokenHash, expiresAt });

    const verifyLink = `${BACKEND_URL}/api/auth/verify-email?uid=${user._id}&token=${token}`;
    try {
        await sendMail({
            to: user.email,
            subject: "Xác thực email đặt hàng MilkyBloom",
            html: `
                <p>Xin chào ${user.fullName || "bạn"},</p>
                <p>Vui lòng xác thực email trước khi hoàn tất đặt hàng:</p>
                <p><a href="${verifyLink}">${verifyLink}</a></p>
                <p>Liên kết có hiệu lực ${VERIFY_TTL_MINUTES} phút.</p>
            `,
        });
    } catch (err) {
        console.error("[MAIL ERROR][VERIFY EMAIL GUEST]", err?.message || err);
    }
}

module.exports = {
    async createOrGetUserForGuest({ fullName, email, phone }) {
        const normalizedEmail = email.toLowerCase();
        const baseUsername = normalizedEmail.split("@")[0];
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const autoUsername = `${baseUsername}_${randomSuffix}`;
        const existing = await userRepository.findByEmailOrPhone(
            normalizedEmail,
            phone,
        );
        if (existing) return existing;

        const randomPass = Math.random().toString(36).slice(-8);
        const hash = await bcrypt.hash(randomPass, 10);

        const newUser = await userRepository.create({
            fullName,
            email: normalizedEmail,
            phone,
            username: autoUsername,
            password: hash,
            isVerified: false,
            role: "customer",
        });

        try {
            await sendMail({
                to: normalizedEmail,
                subject: "Tài khoản của bạn tại MilkyBloom",
                html: `
                <p>Chào ${fullName},</p>
                <p>Chúng tôi đã tạo tài khoản cho bạn.</p>
                <p>Email: <b>${normalizedEmail}</b></p>
                <p>Password: <b>${randomPass}</b></p>
            `,
            });
        } catch (err) {
            console.error("SendMail guest error:", err);
        }

        return newUser;
    },

    async createOrderFromCart(payload) {
        const {
            userId,
            sessionId,
            addressId,
            discountCodeId,
            guestInfo,
            paymentMethod,
            deliveryType,
        } = payload;

        let finalDeliveryType = deliveryType;
        if (!["standard", "express"].includes(finalDeliveryType)) {
            finalDeliveryType = "standard";
        }

        // Lấy cart theo user hoặc session
        let cart = null;
        if (userId) cart = await cartRepository.findCartByUserId(userId);
        else if (sessionId)
            cart = await cartRepository.findCartBySessionId(sessionId);

        if (!cart) throw new Error("Cart not found");

        const cartItems = await cartItemRepository.getAllByCartId(cart._id);
        if (!cartItems || cartItems.length === 0)
            throw new Error("Cart is empty");

        // Convert CartItem -> OrderItems
        let totalAmount = 0;
        const items = cartItems.map((ci) => {
            totalAmount += Number(ci.variantId.price) * ci.quantity;
            return {
                productId: ci.productId._id,
                variantId: ci.variantId._id,
                quantity: ci.quantity,
                unitPrice: Number(ci.variantId.price),
                subtotal: Number(ci.variantId.price) * ci.quantity,
            };
        });

        // Tạo đơn
        const order = await this.createOrder({
            userId: userId || null,
            guestInfo: guestInfo || null,
            addressId: addressId || null,
            paymentMethod: paymentMethod || null,
            deliveryType: deliveryType || "standard",
            items,
            discountCodeId: discountCodeId || cart.discountCodeId || null,
            totalAmount,
        });

        // Clear cart
        for (const ci of cartItems) await cartItemRepository.remove(ci._id);
        await cartRepository.update(cart._id, {
            items: [],
            totalPrice: 0,
            discountCodeId: null,
        });

        return await this.getOrderDetail(order._id);
    },

    // Tạo đơn hàng
    async createOrder(data) {
        let {
            userId,
            guestInfo,
            addressId,
            items,
            discountCodeId,
            voucherId,
            paymentMethod,
            deliveryType,
        } = data;

        // Chuẩn hóa COD naming để khớp với luồng thanh toán
        if (
            paymentMethod === "cod" ||
            paymentMethod === "cash" ||
            paymentMethod === "cashondelivery"
        ) {
            paymentMethod = "cashondelivery";
        }
        let shippingAddress = null;

        if (!["standard", "express"].includes(deliveryType))
            deliveryType = "standard";

        // CASE USER LOGIN
        if (userId && !guestInfo) {
            if (!addressId) {
                const defaultAddr =
                    await addressRepo.findDefaultByUserId(userId);
                if (!defaultAddr) throw new Error("NO_DEFAULT_ADDRESS");
                addressId = defaultAddr._id;
                shippingAddress = defaultAddr;
            }
        }

        if (addressId && !shippingAddress) {
            shippingAddress = await addressRepo.findById(addressId);
        }

        // CASE GUEST
        if (!userId) {
            if (!guestInfo.fullName || !guestInfo.email || !guestInfo.phone)
                throw new Error("Guest must provide fullName, email, phone.");

            const user = await this.createOrGetUserForGuest(guestInfo);
            userId = user._id;

            if (!user.loyaltyPoints) user.loyaltyPoints = 0;

            const existingDefault =
                await addressRepo.findDefaultByUserId(userId);
            const isFirstAddress = !existingDefault;

            const addr = await addressRepo.create({
                userId,
                fullNameOfReceiver: guestInfo.fullName,
                phone: guestInfo.phone,
                addressLine: guestInfo.addressLine,
                lat: guestInfo.lat,
                lng: guestInfo.lng,
                isDefault: isFirstAddress,
            });

            if (isFirstAddress) {
                await userRepository.update(userId, {
                    defaultAddressId: addr._id,
                });
            }

            addressId = addr._id;
            shippingAddress = addr;

            // Yêu cầu xác thực email trước khi tiếp tục
            if (!user.isVerified) {
                await sendVerifyEmail(user);
                throw Object.assign(
                    new Error("Vui lòng xác thực email trước khi đặt hàng."),
                    { status: 400, code: "EMAIL_NOT_VERIFIED" },
                );
            }
        }

        if (!shippingAddress) throw new Error("SHIPPING_ADDRESS_NOT_FOUND");

        // TIỀN HÀNG GỐC
        const goodsTotal = Number(data.totalAmount);

        //  XỬ LÝ DÙNG COIN
        // -------------------------------------------
        let pointsUsed = Number(data.pointsToUse || 0);
        let coinDiscount = 0;

        if (pointsUsed > 0) {
            // Lấy thông tin user
            const user = await userRepository.findById(userId);
            if (!user) throw new Error("User not found");

            // Kiểm tra đủ coin hay không
            if (pointsUsed > user.loyaltyPoints) {
                pointsUsed = user.loyaltyPoints; // ép về tối đa coin đang có
            }

            // Coin không được vượt quá tổng tiền hàng
            if (pointsUsed > goodsTotal) {
                pointsUsed = goodsTotal;
            }

            coinDiscount = pointsUsed;

            // Trừ coin ngay lập tức (vì người dùng đã dùng coin)
            user.loyaltyPoints -= pointsUsed;
            await user.save();

            // Ghi log coin transaction
            await CoinTransactionRepository.create({
                userId,
                type: "use",
                amount: pointsUsed,
                balanceAfter: user.loyaltyPoints,
                description: "Used coins for discount",
            });
        }

        // TÍNH GIẢM GIÁ TỪ DISCOUNT CODE
        let discountAmount = 0;

        if (discountCodeId) {
            const discount = await discountCodeService.validateAndApply({
                userId,
                discountCodeId,
                orderAmount: goodsTotal,
            });
            discountAmount = discount.discountValue || 0;
        }

        // ⭐ XỬ LÝ COLLECTED VOUCHER
        let voucherDiscount = 0;

        if (voucherId) {
            if (!userId) {
                throw new Error("Voucher chỉ áp dụng cho user đã đăng nhập.");
            }

            const uv = await userVoucherRepository.findByUserAndVoucher(
                userId,
                voucherId,
            );

            if (!uv) {
                throw new Error("Bạn chưa thu thập voucher này.");
            }

            if (uv.used) {
                throw new Error("Voucher đã được sử dụng.");
            }

            const voucher = await voucherRepository.findById(voucherId);
            if (!voucher) throw new Error("Voucher không tồn tại.");

            const now = new Date();
            const startAt = voucher.startDate || voucher.createdAt || now;
            const endAt = voucher.endDate || voucher.expiredAt;
            if (startAt && startAt > now) throw new Error("Voucher chưa bắt đầu.");
            if (endAt && endAt < now) throw new Error("Voucher đã hết hạn.");

            // Tính giảm giá
            if (voucher.type === "fixed") {
                voucherDiscount = voucher.value;
            }

            if (voucher.type === "percent") {
                voucherDiscount = Math.floor(
                    goodsTotal * (voucher.value / 100),
                );
                if (voucher.maxDiscount) {
                    voucherDiscount = Math.min(
                        voucherDiscount,
                        voucher.maxDiscount,
                    );
                }
            }

            // Đảm bảo không vượt quá tiền hàng
            if (voucherDiscount > goodsTotal) voucherDiscount = goodsTotal;

            // Mark voucher as used
            await userVoucherRepository.markUsed(userId, voucherId);
        }

        const goodsAfterDiscount = Math.max(
            goodsTotal - discountAmount - coinDiscount - voucherDiscount,
            0
        );

        // TÍNH PHÍ SHIP
        const ship = await calculateShippingFee(
            {
                lat: shippingAddress.lat,
                lng: shippingAddress.lng,
                addressLine: shippingAddress.addressLine,
                userId: userId,
            },
            500,
            goodsAfterDiscount,
            false,
            deliveryType,
        );

        const shippingFee = Number(ship.fee);

        const finalAmount = goodsAfterDiscount + shippingFee;

        // CREATE ORDER
        const order = await orderRepository.create({
            userId,
            addressId,
            discountCodeId: discountCodeId || null,
            voucherId: voucherId || null,
            paymentMethod: paymentMethod || null,
            deliveryType,
            totalAmount: finalAmount,
            shippingFee,
            discountAmount,
            voucherDiscount,
            pointsUsed,
            pointsEarned: 0,
        });

        // CREATE ORDER ITEMS
        await itemRepo.createMany(
            items.map((i) => ({
                orderId: order._id,
                productId: i.productId,
                variantId: i.variantId,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                subtotal: i.subtotal,
            })),
        );

        await historyRepo.add(order._id, "pending");

        return order;
    },

    // ⭐⭐⭐ Lấy chi tiết đơn hàng — FULL SHIP + PAYMENT + WEATHER
    async getOrderDetail(orderId) {
        const order = await orderRepository.findById(orderId);
        if (!order) return null;

        // Items
        const items = await itemRepo.findByOrder(orderId);

        // Status history
        const history = await historyRepo.getHistory(orderId);

        // Address để tính ship + weather
        const address = await addressRepo.findById(order.addressId);

        // Weather
        const weather = await getWeatherCondition(address.lat, address.lng);

        // Shipping fee
        const goodsAmount = Math.max(
            Number(order.totalAmount) - Number(order.shippingFee || 0),
            0,
        );

        const shipping = await calculateShippingFee(
            {
                lat: address.lat,
                lng: address.lng,
                addressLine: address.addressLine,
                userId: order.userId,
            },
            500, // tạm thời: trọng lượng mặc định
            goodsAmount, // tổng tiền hàng (không gồm ship)
            false, // freeship hay không
            order.deliveryType, // loại giao hàng
        );

        // Ghi đè phí ship thực tế + thêm weather thông tin
        shipping.fee = Number(order.shippingFee || shipping.fee || 0);
        shipping.weather = weather;

        // Payment
        const payment = await paymentRepo.findByOrderId(orderId);

        // Trả về order detail đầy đủ
        return {
            ...order,
            items,
            history,
            shipping,
            payment,
        };
    },

    // Lấy toàn bộ đơn của user
    getOrdersByUser(userId) {
        return orderRepository.findByUser(userId);
    },

    // Admin: lấy tất cả
    getAll(filter, options) {
        return orderRepository.findAll(filter, options);
    },

    async updateStatus(orderId, newStatus) {
        const updated = await orderRepository.updateStatus(orderId, newStatus);
        if (!updated) return null;

        // COD/cashondelivery: chỉ ghi nhận đã thanh toán khi giao/hoàn tất
        if (
            (updated.paymentMethod === "cashondelivery" ||
                updated.paymentMethod === "cod" ||
                updated.paymentMethod === "cash") &&
            updated.paymentStatus !== "paid" &&
            (newStatus === "delivered" || newStatus === "completed")
        ) {
            const now = new Date();

            await orderRepository.updatePaymentStatus(orderId, {
                status: newStatus,
                paymentStatus: "paid",
                paymentMethod: "cashondelivery",
            });

            const existingPayment = await paymentRepo.findByOrderId(orderId);
            const txId = existingPayment?.transactionId || `CASH-${orderId}`;

            const paymentPayload = {
                method: "cashondelivery",
                status: "success",
                transactionId: txId,
                paidAt: now,
            };

            if (existingPayment) {
                await paymentRepo.updateByOrderId(orderId, paymentPayload);
            } else {
                await paymentRepo.create({
                    orderId,
                    ...paymentPayload,
                });
            }

            updated.paymentStatus = "paid";
            updated.paymentMethod = "cashondelivery";
        }

        await historyRepo.add(orderId, newStatus);

        // Nếu đơn hoàn tất
        if (newStatus === "completed" || newStatus === "delivered") {
            if (updated.userId && updated.totalAmount) {
                const goodsAmount =
                    updated.totalAmount -
                    updated.shippingFee +
                    (updated.discountAmount || 0) +
                    (updated.pointsUsed || 0);

                try {
                    // ⭐ Loyalty: cộng coin
                    const result = await loyaltyService.handleOrderCompleted(
                        updated.userId,
                        goodsAmount,
                        updated._id,
                    );

                    // lưu coin
                    await orderRepository.update(updated._id, {
                        pointsEarned: result.earnedCoins,
                    });

                    // ⭐ Badge: lấy user
                    const user = await userRepository.findById(updated.userId);

                    if (user) {
                        // ⭐ Trả về list huy hiệu mới unlock
                        const newBadges =
                            await badgeService.checkAndAssignBadges(user);

                        if (newBadges && newBadges.length > 0) {
                            updated.newBadges = newBadges;
                        }
                    }
                } catch (err) {
                    console.error("Loyalty/Badge update error:", err);
                }
            }
        }

        return updated;
    }

};
