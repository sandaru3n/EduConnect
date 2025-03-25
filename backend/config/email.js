//backend/config/email.js
const nodemailer = require('nodemailer');

// Configure the email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use any email service (e.g., SendGrid, Mailgun, etc.)
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: `"EduConnect" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

module.exports = sendEmail;