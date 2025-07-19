# 🔐 Security Setup Guide

## 🚨 CRITICAL: Environment Variables Required

After fixing the GitHub secret scanning alert, you **MUST** set these environment variables:

### Required Environment Variables:

```bash
# Admin Credentials (REQUIRED - Set these in production!)
SUPER_ADMIN_EMAIL=thechesswirenews@gmail.com
SUPER_ADMIN_PASSWORD=your-super-secure-super-admin-password-here
ADMIN_EMAIL=admin@chesswire.com
ADMIN_PASSWORD=your-secure-admin-password-here

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/thechesswire

# Email Configuration
RESEND_API_KEY=your-resend-api-key-here
FROM_EMAIL=noreply@thechesswire.news
```

## 🔧 Security Fixes Applied:

### ✅ Fixed GitHub Secret Scanning Alert:
- **Removed hardcoded passwords** from `src/lib/auth/auth.ts`
- **Replaced with environment variables** for security
- **No more hardcoded credentials** in source code

### ✅ Before (INSECURE):
```typescript
const SUPER_ADMIN_CREDENTIALS = {
  email: 'thechesswirenews@gmail.com',
  password: 'super-admin-secure-password-2024', // ❌ HARDCODED
  role: UserRole.SUPER_ADMIN,
  id: 'super-admin-001'
};
```

### ✅ After (SECURE):
```typescript
const SUPER_ADMIN_CREDENTIALS = {
  email: process.env.SUPER_ADMIN_EMAIL || 'thechesswirenews@gmail.com',
  password: process.env.SUPER_ADMIN_PASSWORD || '', // ✅ ENVIRONMENT VARIABLE
  role: UserRole.SUPER_ADMIN,
  id: 'super-admin-001'
};
```

## 🚀 Deployment Steps:

1. **Set Environment Variables** in your production environment
2. **Never commit passwords** to source code
3. **Use secure password managers** for credential management
4. **Enable GitHub Secret Scanning** for future protection

## 🔍 Security Best Practices:

- ✅ Use environment variables for all secrets
- ✅ Enable GitHub Secret Scanning
- ✅ Use strong, unique passwords
- ✅ Rotate credentials regularly
- ✅ Monitor for security alerts

## 📝 Next Steps:

1. Set the environment variables in your production environment
2. Test the admin login functionality
3. Close the GitHub secret scanning alert
4. Monitor for any new security alerts

---

**⚠️ IMPORTANT:** If you don't set these environment variables, the admin login will not work! 