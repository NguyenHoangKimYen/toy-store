const socketIo = require("socket.io");

let io;

module.exports = {
    // Hàm khởi tạo (Gọi bên app.js)
    init: (httpServer) => {
        io = socketIo(httpServer, {
            cors: {
                origin: "*", // Cho phép mọi nguồn (Frontend) kết nối. Khi deploy nhớ đổi lại domain cụ thể.
                methods: ["GET", "POST"],
            },
        });

        io.on("connection", (socket) => {
            console.log("🟢 Client connected to Socket:", socket.id);

            // --- QUAN TRỌNG: SỰ KIỆN JOIN ROOM ---
            // Khi Frontend login xong, nó sẽ gửi event này kèm userId
            socket.on("join_user_room", (userId) => {
                if (userId) {
                    const roomName = `user_${userId}`;
                    socket.join(roomName);
                    console.log(`👤 User ${userId} joined room: ${roomName}`);
                }
            });

            socket.on("disconnect", () => {
                console.log("🔴 Client disconnected:", socket.id);
            });
        });

        return io;
    },

    // Hàm lấy instance IO (Gọi bên Controller)
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    },
};
