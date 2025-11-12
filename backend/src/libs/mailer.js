const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true", //SSL/TLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendMail = (otp) =>
    transporter.sendMail({
        from: process.env.SMTP_FROM,
        ...otp,
    });

module.exports = { sendMail };
