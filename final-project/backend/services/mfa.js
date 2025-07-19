const crypto = require('crypto');

// Generate TOTP secret
const generateTOTP = () => {
  return crypto.randomBytes(20).toString('base32');
};

// Verify TOTP code
const verifyTOTP = (secret, code, window = 1) => {
  try {
    const now = Math.floor(Date.now() / 30000); // 30-second window
    
    for (let i = -window; i <= window; i++) {
      const expectedCode = generateTOTPCode(secret, now + i);
      if (expectedCode === code) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('TOTP verification failed:', error);
    return false;
  }
};

// Generate TOTP code for a specific time
const generateTOTPCode = (secret, time) => {
  const key = Buffer.from(secret, 'base32');
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigUInt64BE(BigInt(time), 0);
  
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(timeBuffer);
  const hash = hmac.digest();
  
  const offset = hash[hash.length - 1] & 0xf;
  const code = ((hash[offset] & 0x7f) << 24) |
               ((hash[offset + 1] & 0xff) << 16) |
               ((hash[offset + 2] & 0xff) << 8) |
               (hash[offset + 3] & 0xff);
  
  return (code % 1000000).toString().padStart(6, '0');
};

// Generate backup codes
const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

// Verify backup code
const verifyBackupCode = (storedCodes, code) => {
  const index = storedCodes.indexOf(code);
  if (index !== -1) {
    // Remove used code
    storedCodes.splice(index, 1);
    return true;
  }
  return false;
};

// Generate QR code URL for authenticator apps
const generateQRCodeUrl = (secret, email, issuer = 'TheChessWire') => {
  const encodedSecret = encodeURIComponent(secret);
  const encodedEmail = encodeURIComponent(email);
  const encodedIssuer = encodeURIComponent(issuer);
  
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${encodedSecret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
};

module.exports = {
  generateTOTP,
  verifyTOTP,
  generateBackupCodes,
  verifyBackupCode,
  generateQRCodeUrl
}; 