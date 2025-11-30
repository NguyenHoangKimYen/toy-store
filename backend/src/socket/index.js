const socketIo = require('socket.io');

let io;

module.exports = {
    // Hàm khởi tạo (Gọi bên app.js)
    init: (httpServer) => {
        io = socketIo(httpServer, {
            cors: {
                origin: '*', // Cho phép mọi nguồn (Frontend) kết nối. Khi deploy nhớ đổi lại domain cụ thể.
                methods: ['GET', 'POST'],
            },
        });

        io.on('connection', (socket) => {

            // --- QUAN TRỌNG: SỰ KIỆN JOIN ROOM ---
            // Khi Frontend login xong, nó sẽ gửi event này kèm userId
            socket.on('join_user_room', (userId) => {
                if (userId) {
                    const roomName = `user_${userId}`;
                    socket.join(roomName);
                }
            });

            // Join product room for real-time reviews/comments
            socket.on('join_product_room', (productId) => {
                if (productId) {
                    const roomName = `product_${productId}`;
                    socket.join(roomName);
                }
            });

            // Leave product room
            socket.on('leave_product_room', (productId) => {
                if (productId) {
                    const roomName = `product_${productId}`;
                    socket.leave(roomName);
                }
            });

            socket.on('disconnect', () => {
            });
        });

        return io;
    },

    // Hàm lấy instance IO (Gọi bên Controller)
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    },
};
