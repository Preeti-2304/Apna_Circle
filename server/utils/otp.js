const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  // Always log in development for immediate local testing
  console.log(`\n======================================================`);
  console.log(`[AUTH OTP] Purpose: ${purpose.toUpperCase()} for: ${email}`);
  console.log(`[AUTH OTP] CODE: >>> ${otp} <<< (Valid for 10 minutes)`);
  console.log(`======================================================\n`);

  // If SMTP is configured in environment, attempt actual email delivery
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.FROM_EMAIL || '"ApnaCircle" <noreply@apnacircle.local>',
        to: email,
        subject: `Your ApnaCircle ${purpose === 'reset' ? 'Password Reset' : 'Account Verification'} Code: ${otp}`,
        text: `Your ApnaCircle verification code is: ${otp}. This code is valid for 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #3b82f6; margin-bottom: 8px;">ApnaCircle</h2>
            <p style="font-size: 16px; color: #334155;">Hello,</p>
            <p style="font-size: 14px; color: #475569;">Your one-time security code is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e3a8a; padding: 16px 0; text-align: center; background: #eff6ff; border-radius: 6px; margin: 16px 0;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #64748b;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `,
      });
      console.log(`[AUTH OTP] Email successfully dispatched to ${email}`);
    } catch (err) {
      console.warn(`[AUTH OTP] Email sending failed: ${err.message}. Relying on console OTP for development.`);
    }
  }
  return true;
};

module.exports = {
  generateOTP,
  sendOTPEmail,
};
