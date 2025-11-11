// libs/firebaseAdmin.js
const admin = require("firebase-admin");

if (!admin.apps.length) {
    // Nếu bạn đang dùng GOOGLE_APPLICATION_CREDENTIALS (file JSON) thì có thể không cần PRIVATE_KEY
    const useAppDefault =
        !!process.env.GOOGLE_APPLICATION_CREDENTIALS &&
        !process.env.FIREBASE_PRIVATE_KEY;

    if (useAppDefault) {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    } else {
        // Xử lý PRIVATE_KEY bị escape \n và có thể bị bao bởi dấu " ... "
        const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
        const privateKey = rawKey
            .replace(/\\n/g, "\n") // chuyển \n → xuống dòng thật
            .replace(/^"([\s\S]*)"$/, "$1"); // bỏ dấu " bao quanh nếu có

        // (Tùy chọn) kiểm tra biến môi trường để báo lỗi sớm cho dễ debug
        const required = [
            "FIREBASE_PROJECT_ID",
            "FIREBASE_CLIENT_EMAIL",
            "FIREBASE_PRIVATE_KEY",
        ];
        const missing = required.filter(
            (k) => !process.env[k] || !String(process.env[k]).trim(),
        );
        if (missing.length) {
            throw new Error(
                `[firebaseAdmin] Missing env: ${missing.join(", ")}`,
            );
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey,
            }),
        });
    }
}

module.exports = admin;
