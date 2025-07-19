import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send email function
export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  try {
    const mailOptions = {
      from: `"TheChessWire.news" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', { to, subject, messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
}

// Send welcome email
export async function sendWelcomeEmail(email: string, username: string) {
  const subject = 'Welcome to TheChessWire.news!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366f1;">Welcome to TheChessWire.news!</h1>
      <p>Hello ${username},</p>
      <p>Welcome to the most secure, intelligent, and visionary chess journalism platform!</p>
      <p>Experience chess through AI narration, cinematic storytelling, and emotional analysis.</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Your Account Features:</h3>
        <ul>
          <li>🎭 Replay Theater - Watch games come alive with AI narration</li>
          <li>🧠 EchoSage - Train with an AI that understands chess souls</li>
          <li>🎬 SoulCinema - Transform your games into cinematic experiences</li>
          <li>📰 Stories - Read chess through the eyes of AI consciousness</li>
        </ul>
      </div>
      <p>Ready to explore? <a href="https://thechesswire.news" style="color: #6366f1;">Visit TheChessWire.news</a></p>
      <p>Best regards,<br>TheChessWire.news Team</p>
    </div>
  `;

  return await sendEmail(email, subject, html);
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const subject = 'Reset Your Password - TheChessWire.news';
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366f1;">Reset Your Password</h1>
      <p>You requested a password reset for your TheChessWire.news account.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
      </div>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <p>Best regards,<br>TheChessWire.news Team</p>
    </div>
  `;

  return await sendEmail(email, subject, html);
}

// Send email verification
export async function sendEmailVerification(email: string, verificationToken: string) {
  const subject = 'Verify Your Email - TheChessWire.news';
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366f1;">Verify Your Email</h1>
      <p>Welcome to TheChessWire.news! Please verify your email address to complete your registration.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
      </div>
      <p>If you didn't create an account, you can safely ignore this email.</p>
      <p>Best regards,<br>TheChessWire.news Team</p>
    </div>
  `;

  return await sendEmail(email, subject, html);
}

export default transporter; 