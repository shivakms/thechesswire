export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const emailTemplates = {
  welcome: (userName: string): EmailTemplate => ({
    subject: 'Welcome to TheChessWire - Your AI Chess Journey Begins!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to TheChessWire</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .feature { margin: 20px 0; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #6366f1; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>♟️ Welcome to TheChessWire</h1>
            <p>Where Chess Meets AI. Daily.</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Welcome to the future of chess journalism and learning. You've just joined a revolutionary platform that combines the power of AI with the beauty of chess.</p>
            
            <div class="feature">
              <h3>🎬 SoulCinema</h3>
              <p>Transform your games into cinematic masterpieces with AI-powered video generation.</p>
            </div>
            
            <div class="feature">
              <h3>🧠 EchoSage</h3>
              <p>Train with our advanced AI system that adapts to your playing style and skill level.</p>
            </div>
            
            <div class="feature">
              <h3>🎙️ Bambai AI Voice</h3>
              <p>Experience chess narration like never before with our emotionally resonant AI voice.</p>
            </div>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/onboarding" class="button">Complete Your Setup</a>
            
            <p>Ready to start your chess journey? Complete your profile setup to unlock personalized features and recommendations.</p>
          </div>
          <div class="footer">
            <p>© 2024 TheChessWire. All rights reserved.</p>
            <p>This email was sent to you because you signed up for TheChessWire.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to TheChessWire - Your AI Chess Journey Begins!

Hello ${userName}!

Welcome to the future of chess journalism and learning. You've just joined a revolutionary platform that combines the power of AI with the beauty of chess.

Key Features:
- SoulCinema: Transform your games into cinematic masterpieces
- EchoSage: Train with our advanced AI system
- Bambai AI Voice: Experience chess narration like never before

Complete your setup: ${process.env.NEXT_PUBLIC_APP_URL}/onboarding

© 2024 TheChessWire. All rights reserved.
    `
  }),

  emailVerification: (userName: string, verificationUrl: string): EmailTemplate => ({
    subject: 'Verify Your Email - TheChessWire',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Verify Your Email</h1>
            <p>TheChessWire Account Verification</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Thank you for signing up for TheChessWire! To complete your registration and access all features, please verify your email address.</p>
            
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            
            <div class="warning">
              <strong>Important:</strong> This verification link will expire in 24 hours. If you don't verify your email, your account will be limited.
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6366f1;">${verificationUrl}</p>
            
            <p>If you didn't create an account with TheChessWire, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 TheChessWire. All rights reserved.</p>
            <p>This verification link expires in 24 hours.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Verify Your Email - TheChessWire

Hello ${userName}!

Thank you for signing up for TheChessWire! To complete your registration and access all features, please verify your email address.

Verify your email: ${verificationUrl}

Important: This verification link will expire in 24 hours. If you don't verify your email, your account will be limited.

If you didn't create an account with TheChessWire, you can safely ignore this email.

© 2024 TheChessWire. All rights reserved.
    `
  }),

  passwordReset: (userName: string, resetUrl: string): EmailTemplate => ({
    subject: 'Reset Your Password - TheChessWire',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fef2f2; border: 1px solid #fca5a5; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reset Your Password</h1>
            <p>TheChessWire Account Security</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>We received a request to reset your password for your TheChessWire account. Click the button below to create a new password:</p>
            
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <div class="warning">
              <strong>Security Notice:</strong> This password reset link will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6366f1;">${resetUrl}</p>
            
            <p>For your security, this link can only be used once and will expire automatically.</p>
          </div>
          <div class="footer">
            <p>© 2024 TheChessWire. All rights reserved.</p>
            <p>This reset link expires in 1 hour.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Reset Your Password - TheChessWire

Hello ${userName}!

We received a request to reset your password for your TheChessWire account. Click the link below to create a new password:

${resetUrl}

Security Notice: This password reset link will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.

For your security, this link can only be used once and will expire automatically.

© 2024 TheChessWire. All rights reserved.
    `
  }),

  securityAlert: (userName: string, alertType: string, details: any): EmailTemplate => ({
    subject: `Security Alert - ${alertType} - TheChessWire`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert { background: #fef2f2; border: 1px solid #fca5a5; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Security Alert</h1>
            <p>TheChessWire Account Security</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>We detected suspicious activity on your TheChessWire account that requires your immediate attention.</p>
            
            <div class="alert">
              <h3>Alert Type: ${alertType}</h3>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>IP Address:</strong> ${details.ipAddress || 'Unknown'}</p>
              <p><strong>Location:</strong> ${details.location || 'Unknown'}</p>
              <p><strong>Device:</strong> ${details.device || 'Unknown'}</p>
            </div>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/security" class="button">Review Security Settings</a>
            
            <p>If this activity was not performed by you, please:</p>
            <ol>
              <li>Change your password immediately</li>
              <li>Enable two-factor authentication</li>
              <li>Review your recent account activity</li>
              <li>Contact our support team if needed</li>
            </ol>
            
            <p>Your account security is our top priority.</p>
          </div>
          <div class="footer">
            <p>© 2024 TheChessWire. All rights reserved.</p>
            <p>This is an automated security alert. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Security Alert - ${alertType} - TheChessWire

Hello ${userName}!

We detected suspicious activity on your TheChessWire account that requires your immediate attention.

Alert Type: ${alertType}
Time: ${new Date().toLocaleString()}
IP Address: ${details.ipAddress || 'Unknown'}
Location: ${details.location || 'Unknown'}
Device: ${details.device || 'Unknown'}

Review security settings: ${process.env.NEXT_PUBLIC_APP_URL}/security

If this activity was not performed by you, please:
1. Change your password immediately
2. Enable two-factor authentication
3. Review your recent account activity
4. Contact our support team if needed

Your account security is our top priority.

© 2024 TheChessWire. All rights reserved.
    `
  }),

  subscriptionUpgrade: (userName: string, planName: string): EmailTemplate => ({
    subject: 'Welcome to Premium - TheChessWire',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Premium</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { margin: 20px 0; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #f59e0b; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⭐ Welcome to Premium!</h1>
            <p>You've unlocked the full power of TheChessWire</p>
          </div>
          <div class="content">
            <h2>Congratulations ${userName}!</h2>
            <p>You've successfully upgraded to our <strong>${planName}</strong> plan. Welcome to the exclusive world of premium chess features!</p>
            
            <div class="feature">
              <h3>🎬 Unlimited SoulCinema</h3>
              <p>Create unlimited cinematic chess videos with all premium effects and themes.</p>
            </div>
            
            <div class="feature">
              <h3>🧠 Advanced EchoSage</h3>
              <p>Access unlimited training sessions and personalized AI coaching.</p>
            </div>
            
            <div class="feature">
              <h3>🎙️ All Voice Modes</h3>
              <p>Experience all Bambai AI voice modes including dramatic, poetic, and whisper.</p>
            </div>
            
            <div class="feature">
              <h3>📊 Advanced Analytics</h3>
              <p>Get detailed performance insights and progress tracking.</p>
            </div>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Start Exploring</a>
            
            <p>Your premium features are now active. Start exploring and take your chess game to the next level!</p>
          </div>
          <div class="footer">
            <p>© 2024 TheChessWire. All rights reserved.</p>
            <p>Thank you for choosing TheChessWire Premium!</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to Premium - TheChessWire

Congratulations ${userName}!

You've successfully upgraded to our ${planName} plan. Welcome to the exclusive world of premium chess features!

Premium Features:
- Unlimited SoulCinema renders
- Advanced EchoSage training
- All Bambai AI voice modes
- Advanced analytics and insights

Start exploring: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Your premium features are now active. Start exploring and take your chess game to the next level!

© 2024 TheChessWire. All rights reserved.
    `
  })
}; 