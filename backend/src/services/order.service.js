const orderRepository = require('../repositories/order.repository');
const itemRepo = require('../repositories/order-item.repository');
const historyRepo = require('../repositories/order-status-history.repository');
const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository.js');
const addressRepo = require('../repositories/address.repository');
const paymentRepo = require('../repositories/payment.repository');
const { sendMail } = require('../libs/mailer.js');
const { calculateShippingFee } = require('../services/shipping.service');
const { getWeatherCondition } = require('../services/weather.service');
const cartRepository = require('../repositories/cart.repository');
const cartItemRepository = require('../repositories/cart-item.repository');

module.exports = {
    async createOrGetUserForGuest({ fullName, email, phone }) {
        const normalizedEmail = email.toLowerCase();
        const baseUsername = normalizedEmail.split("@")[0];
        const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 số
        const autoUsername = `${baseUsername}_${randomSuffix}`;
        const existing = await userRepository.findByEmailOrPhone(normalizedEmail, phone);
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
            role: 'customer'
        });

        try {
            await sendMail({
                to: normalizedEmail,
                subject: "Tài khoản của bạn tại MilkyBloom",
                html: `
                <p>Chào ${fullName},</p>
                <p>Bạn vừa đặt hàng tại MilkyBloom.</p>
                <p>Chúng tôi đã tạo tài khoản cho bạn:</p>
                <ul>
                    <li>Email: <b>${normalizedEmail}</b></li>
                    <li>Password: <b>${randomPass}</b></li>
                </ul>
                <p>Bạn có thể đăng nhập để theo dõi đơn hàng.</p>
            `
            });
        } catch (err) {
            console.error("SendMail guest error:", err);
        }

        return newUser;
    },
    async createOrGetUserForGuestCheckout(payload) {
        return this.createOrGetUserForGuest(payload);
    },

    async createOrderFromCart(payload) {
        const { userId, sessionId, addressId, discountCodeId, guestInfo, paymentMethod, deliveryType } = payload;

        // Validate deliveryType
        let finalDeliveryType = deliveryType;
        if (!["standard", "express"].includes(finalDeliveryType)) {
            finalDeliveryType = "standard";
        }


        // 1. Lấy cart theo user hoặc session
        let cart = null;
        if (userId) {
            cart = await cartRepository.findCartByUserId(userId);
        } else if (sessionId) {
            cart = await cartRepository.findCartBySessionId(sessionId);
        }

        if (!cart) {
            throw new Error('Cart not found');
        }

        // 2. Lấy danh sách CartItem của cart
        const cartItems = await cartItemRepository.getAllByCartId(cart._id);
        if (!cartItems || cartItems.length === 0) {
            throw new Error('Cart is empty');
        }

        // 3. Convert CartItem -> items cho createOrder()
        let totalAmount = 0;
        const items = cartItems.map((ci) => {
            const subtotal = parseFloat(ci.price.toString()); // price hiện đang là tổng dòng
            const quantity = ci.quantity;
            const unitPrice = subtotal / quantity;

            totalAmount += Number(ci.variantId.price) * ci.quantity;

            if (!ci.productId) {
                throw new Error("Product in cart no longer exists");
            }
            return {
                productId: ci.productId._id,
                variantId: ci.variantId._id,       // 👈 LẤY GIÁ THEO VARIANT
                quantity: ci.quantity,
                unitPrice: Number(ci.variantId.price), // 👈 GIÁ TỪ VARIANT
                subtotal: Number(ci.variantId.price) * ci.quantity
            };
        });

        // 4. Gọi lại createOrder() hiện có để tái dùng logic guest / email / history
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

        // 5. Clear cart sau khi tạo đơn
        for (const ci of cartItems) {
            await cartItemRepository.remove(ci._id);
        }
        await cartRepository.update(cart._id, {
            items: [],
            totalPrice: 0,
            discountCodeId: null,
        });

        // 6. Trả về detail đầy đủ của order
        const detail = await this.getOrderDetail(order._id);
        return detail;
    },

    // Tạo đơn hàng
    async createOrder(data) {
        // Lấy toàn bộ biến ngay từ đầu
        let { userId, guestInfo, addressId, items, discountCodeId, paymentMethod, deliveryType } = data;
        let shippingAddress = null;

        // Validate deliveryType
        if (!["standard", "express"].includes(deliveryType)) {
            deliveryType = "standard";
        }

        // ⭐ CASE 1 — USER LOGIN (KHÔNG PHẢI GUEST)
        if (userId && !guestInfo) {
            // Nếu không có addressId → tự lấy default address của user
            if (!addressId) {
                const defaultAddr = await addressRepo.findDefaultByUserId(userId);
                if (!defaultAddr) {
                    throw new Error("NO_DEFAULT_ADDRESS");
                }
                addressId = defaultAddr._id;
                shippingAddress = defaultAddr;
            }
        }

        if (addressId && !shippingAddress) {
            shippingAddress = await addressRepo.findById(addressId);
        }

        // ⭐ CASE 2 — GUEST CHECKOUT
        if (!userId) {
            if (!guestInfo || !guestInfo.fullName || !guestInfo.email || !guestInfo.phone) {
                throw new Error("Guest must provide fullName, email, phone.");
            }

            // Tạo user mới nếu chưa có
            const user = await this.createOrGetUserForGuest({
                fullName: guestInfo.fullName,
                email: guestInfo.email,
                phone: guestInfo.phone
            });

            userId = user._id;

            // Kiểm tra đã có defaultAddress chưa
            const existingDefault = await addressRepo.findDefaultByUserId(userId);
            const isFirstAddress = !existingDefault;

            // Tạo address
            const addr = await addressRepo.create({
                userId,
                fullNameOfReceiver: guestInfo.fullName,
                phone: guestInfo.phone,
                addressLine: guestInfo.addressLine,
                city: guestInfo.city || null,
                postalCode: guestInfo.postalCode || null,
                lat: guestInfo.lat || null,
                lng: guestInfo.lng || null,
                isDefault: isFirstAddress
            });

            // set defaultAddressId nếu chưa có
            if (isFirstAddress) {
                await userRepository.update(userId, {
                    defaultAddressId: addr._id
                });
            }

            addressId = addr._id;
            shippingAddress = addr;
        }

        // ⭐ Tạo order
        if (!shippingAddress) {
            shippingAddress = await addressRepo.findById(addressId);
        }
        if (!shippingAddress) {
            throw new Error("SHIPPING_ADDRESS_NOT_FOUND");
        }

        const totalAmount = Number(data.totalAmount);
        if (Number.isNaN(totalAmount)) {
            throw new Error("INVALID_TOTAL_AMOUNT");
        }

        const shipping = await calculateShippingFee(
            {
                lat: shippingAddress.lat,
                lng: shippingAddress.lng,
                addressLine: shippingAddress.addressLine,
            },
            500,
            totalAmount,
            false,
            deliveryType,
        );

        const shippingFee = Number(shipping?.fee || 0);
        const finalAmount = totalAmount + shippingFee;

        const order = await orderRepository.create({
            userId,
            addressId,
            discountCodeId: discountCodeId || null,
            paymentMethod: paymentMethod || null,
            deliveryType: deliveryType || "standard",
            totalAmount: finalAmount,
            shippingFee,
            pointsUsed: 0,
            pointsEarned: 0,
        });

        // ⭐ Tạo order item
        const orderItems = items.map(i => ({
            orderId: order._id,
            productId: i.productId,
            variantId: i.variantId,         // 👈 LƯU VARIANT EPIC
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            subtotal: i.subtotal
        }));

        await itemRepo.createMany(orderItems);

        await historyRepo.add(order._id, "pending");

        // ⭐ Email guest
        try {
            const emailToSend = guestInfo ? guestInfo.email : data.customerEmail;
            if (emailToSend) {
                await sendMail({
                    to: emailToSend,
                    subject: "Xác nhận đơn hàng MilkyBloom",
                    html: `<p>Đơn hàng #${order._id} đã được tạo thành công.</p>`
                });
            }
        } catch (err) {
            console.error("Error sending order email:", err);
        }

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
            },
            500,                             // tạm thời: trọng lượng mặc định
            goodsAmount,                     // tổng tiền hàng (không gồm ship)
            false,                           // freeship hay không
            order.deliveryType               // loại giao hàng
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
            payment
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

        await historyRepo.add(orderId, newStatus);
        return updated;
    }
};
