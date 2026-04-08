import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

let transporter;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: process.env.SMTP_PORT || 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
    return transporter;
};

export const sendEmail = async (options) => {
    try {
        const mailTransporter = getTransporter();
        const message = {
            from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        };

        const info = await mailTransporter.sendMail(message);
        logger.info(`Message sent: ${info.messageId}`);
        // If ethereal, logging the URL is helpful
        if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
            logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
    } catch (error) {
        logger.error(`Email sending failed: ${error.message}`);
    }
};
