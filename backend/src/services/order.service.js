const orderRepo = require('../repositories/order.repository');
const itemRepo = require('../repositories/order-item.repository');
const historyRepo = require('../repositories/order-status-history.repository');
const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository.js');
const addressRepo = require('../repositories/address.repository');
const paymentRepo = require('../repositories/payment.repository');
const { sendMail } = require('../libs/mailer.js');
const { calculateShippingFee } = require('../services/shipping.service');
const { getWeatherCondition } = require('../services/weather.service');

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

    // Tạo đơn hàng
    async createOrder(data) {
        let { userId, guestInfo, addressId, items, discountCodeId } = data;

        // 1) Guest checkout: create user + snapshot address
        if (!userId) {
            if (!guestInfo || !guestInfo.fullName || !guestInfo.email || !guestInfo.phone) {
                throw new Error("Guest must provide fullName, email, phone.");
            }

            const user = await this.createOrGetUserForGuest({
                fullName: guestInfo.fullName,
                email: guestInfo.email,
                phone: guestInfo.phone
            });

            userId = user._id;
            // Kiểm tra user đã có địa chỉ hay chưa
            const existingAddresses = await addressRepo.findByUserId(userId);

            // Nếu user chưa có địa chỉ nào → địa chỉ mới là defaultAddress
            const isFirstAddress = existingAddresses.length === 0;

            const addr = await addressRepo.create({
                userId,
                fullNameOfReceiver: guestInfo.fullName,
                phone: guestInfo.phone,
                addressLine: guestInfo.addressLine,
                city: guestInfo.city || null,
                postalCode: guestInfo.postalCode || null,
                lat: guestInfo.lat || null,
                lng: guestInfo.lng || null,
                isDefault: isFirstAddress   // ⭐ GIỮA TỰ ĐỘNG SET DEFAULT ⭐
            });

            // Nếu là địa chỉ đầu tiên → update user.defaultAddressId
            if (isFirstAddress) {
                await userRepository.update(userId, {
                    defaultAddressId: addr._id
                });
            }

            addressId = addr._id;

        }

        // 2) Logged-in user flow could be extended here if needed

        // 3) Create order
        const totalAmount = data.totalAmount;
        const order = await orderRepo.create({
            userId,
            addressId,
            discountCodeId: discountCodeId || null,
            totalAmount,
            pointsUsed: 0,
            pointsEarned: 0,
        });

        // 4) Create order items
        const orderItems = items.map((i) => ({
            orderId: order._id,
            productId: i.productId,
            variantId: i.variantId || null,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            subtotal: i.subtotal
        }));
        
        await itemRepo.createMany(orderItems);

        await historyRepo.add(order._id, "pending");

        // 5) Send confirmation email
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
        const order = await orderRepo.findById(orderId);
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
        const shipping = await calculateShippingFee(
            {
                lat: address.lat,
                lng: address.lng,
                addressLine: address.addressLine,
            },
            500,                             // tạm thời: trọng lượng mặc định
            Number(order.totalAmount),       // tổng tiền
            false,                           // freeship hay không
            "standard"                       // loại giao hàng
        );

        // Thêm weather vào shipping
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
        return orderRepo.findByUser(userId);
    },

    // Admin: lấy tất cả
    getAll(filter, options) {
        return orderRepo.findAll(filter, options);
    },

    async updateStatus(orderId, newStatus) {
        const updated = await orderRepo.updateStatus(orderId, newStatus);
        if (!updated) return null;

        await historyRepo.add(orderId, newStatus);
        return updated;
    }
};
