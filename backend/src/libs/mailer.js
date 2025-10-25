const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAILER_HOST,
    port: Number(process.env.MAILER_PORT || 587),
    secure: process.env.MAILER_SECURE === 'true', //SSL/TLS
    auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS,
    },
});

const sendMail = (otp) => transporter.sendMail({
    from: process.env.MAILER_FROM,
    ...otp,
});

module.exports = {sendMail};