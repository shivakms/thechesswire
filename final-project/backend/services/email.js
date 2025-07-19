const nodemailer = require('nodemailer');

let transporter;

const initializeEmailService = async () => {
  try {
    transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ Email service initialized');
  } catch (error) {
    console.error('❌ Email service initialization failed:', error);
    throw error;
  }
};

const sendVerificationEmail = async (email, token, username) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify/${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to TheChessWire.news - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to TheChessWire.news</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Where Chess Meets AI. Daily.</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${username}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Thank you for joining TheChessWire.news! We're excited to have you as part of our chess community.
            To complete your registration and start exploring AI-powered chess analysis, please verify your email address.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 25px;">
            If the button doesn't work, you can copy and paste this link into your browser:
            <br>
            <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 25px;">
            This link will expire in 24 hours for security reasons.
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px;">
            © 2024 TheChessWire.news. All rights reserved.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, token, username) => {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset Your TheChessWire.news Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">TheChessWire.news</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${username}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            We received a request to reset your password for your TheChessWire.news account.
            If you didn't make this request, you can safely ignore this email.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 25px;">
            If the button doesn't work, you can copy and paste this link into your browser:
            <br>
            <a href="${resetUrl}" style="color: #667eea;">${resetUrl}</a>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 25px;">
            This link will expire in 1 hour for security reasons.
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-top: 25px;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Security Tip:</strong> Never share this email with anyone. Our team will never ask for your password.
            </p>
          </div>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px;">
            © 2024 TheChessWire.news. All rights reserved.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (email, username) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to TheChessWire.news - Your Chess Journey Begins!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to TheChessWire.news!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your AI-powered chess journey starts now</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${username}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Congratulations! Your account has been successfully verified and you're now ready to explore the world of AI-powered chess analysis.
          </p>
          
          <div style="background: #e8f5e8; border: 1px solid #c3e6c3; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #2d5a2d; margin-top: 0;">What's Next?</h3>
            <ul style="color: #2d5a2d; padding-left: 20px;">
              <li>Complete your onboarding to personalize your experience</li>
              <li>Upload your first PGN game for AI analysis</li>
              <li>Explore our voice narration features</li>
              <li>Discover daily AI-generated chess content</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/onboarding" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;">
              Start Your Journey
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 25px;">
            If you have any questions or need assistance, don't hesitate to reach out to our support team.
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px;">
            © 2024 TheChessWire.news. All rights reserved.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
};

const sendSecurityAlert = async (email, username, alertType, details) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Security Alert - ${alertType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc3545; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Security Alert</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">TheChessWire.news</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${username}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            We detected ${alertType.toLowerCase()} activity on your account. If this was you, you can safely ignore this email.
            If you didn't perform this action, please secure your account immediately.
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 25px 0;">
            <h3 style="color: #856404; margin-top: 0;">Alert Details:</h3>
            <p style="color: #856404; margin: 0;">${details}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/auth/gateway" 
               style="background: #dc3545; 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;">
              Secure My Account
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 25px;">
            For additional security, consider enabling two-factor authentication on your account.
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px;">
            © 2024 TheChessWire.news. All rights reserved.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Security alert sent to ${email}`);
  } catch (error) {
    console.error('Failed to send security alert:', error);
    throw error;
  }
};

module.exports = {
  initializeEmailService,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendSecurityAlert
}; 