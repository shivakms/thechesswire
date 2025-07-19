# 🚀 AWS Deployment Guide - TheChessWire.news

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### ✅ **Project Status**
- ✅ Next.js 15.3+ with standalone output
- ✅ TypeScript configuration
- ✅ Tailwind CSS with dark theme
- ✅ Complete authentication system
- ✅ All Phase 1 & 2 modules implemented
- ✅ PM2 ecosystem configuration
- ✅ Security headers configured

---

## 🏗️ **AWS INFRASTRUCTURE SETUP**

### **1. EC2 Instance Setup**

#### **Recommended Instance Type:**
```bash
# For production (high traffic)
Instance Type: t3.large (2 vCPU, 8 GB RAM)
Storage: 50 GB GP3 SSD
OS: Ubuntu 22.04 LTS

# For development/testing
Instance Type: t3.medium (2 vCPU, 4 GB RAM)
Storage: 30 GB GP3 SSD
OS: Ubuntu 22.04 LTS
```

#### **Security Groups:**
```bash
# Inbound Rules
HTTP (80)     - 0.0.0.0/0
HTTPS (443)   - 0.0.0.0/0
SSH (22)      - Your IP only
Custom (3000) - 0.0.0.0/0 (for PM2)

# Outbound Rules
All Traffic   - 0.0.0.0/0
```

### **2. RDS PostgreSQL Database**

#### **Database Configuration:**
```bash
Engine: PostgreSQL 15
Instance: db.t3.micro (for dev) / db.t3.small (for prod)
Storage: 20 GB GP3
Multi-AZ: Enabled (for production)
Backup: Automated backups enabled
Encryption: At rest and in transit
```

#### **Connection String:**
```bash
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/thechesswire
```

### **3. S3 Bucket Setup**

#### **Buckets Required:**
```bash
# Main media bucket
thechesswire-media
- Public read access
- CORS enabled
- Lifecycle policies for cost optimization

# Private assets bucket
thechesswire-private
- Private access only
- Encrypted at rest
```

### **4. CloudFront Distribution**

#### **Configuration:**
```bash
Origin: S3 bucket (thechesswire-media)
Behaviors: 
- Cache static assets (images, CSS, JS)
- TTL: 1 day for images, 1 week for CSS/JS
- Compress objects automatically
- HTTPS only
```

### **5. Route53 DNS Setup**

#### **Domain Configuration:**
```bash
# A Record
thechesswire.news -> ALB or EC2 IP

# CNAME Records
www.thechesswire.news -> thechesswire.news
api.thechesswire.news -> thechesswire.news
```

---

## 🔧 **SERVER SETUP SCRIPT**

### **Create setup script: `setup-aws.sh`**

```bash
#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2

# Install PostgreSQL client
sudo apt install -y postgresql-client

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Create application directory
sudo mkdir -p /var/www/thechesswire
sudo chown ubuntu:ubuntu /var/www/thechesswire

# Create logs directory
mkdir -p /var/www/thechesswire/logs

# Setup Nginx configuration
sudo tee /etc/nginx/sites-available/thechesswire << EOF
server {
    listen 80;
    server_name thechesswire.news www.thechesswire.news;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/thechesswire /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "Server setup complete!"
```

---

## 🔐 **ENVIRONMENT VARIABLES**

### **Create `.env.production` file:**

```bash
# Database
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/thechesswire

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-here

# ElevenLabs Voice API
ELEVENLABS_API_KEY=your-elevenlabs-api-key
VOICE_ID=PmypFHWgqk9ACZdL8ugT

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=thechesswire-media
AWS_S3_PRIVATE_BUCKET=thechesswire-private

# Email Configuration (SES or SMTP)
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_PORT=587

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# Security
NODE_ENV=production
PORT=3000

# Admin Configuration
ADMIN_EMAIL=thechesswirenews@gmail.com
SUPER_ADMIN_EMAIL=thechesswirenews@gmail.com

# API Keys (optional)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
CLOUDFLARE_API_KEY=your-cloudflare-api-key
```

---

## 🚀 **DEPLOYMENT STEPS**

### **1. Initial Server Setup**

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-server-ip

# Run setup script
chmod +x setup-aws.sh
./setup-aws.sh
```

### **2. Clone and Deploy Application**

```bash
# Navigate to application directory
cd /var/www/thechesswire

# Clone your repository
git clone https://github.com/your-username/thechesswire.git .

# Install dependencies
pnpm install

# Build the application
pnpm run build

# Copy environment file
cp .env.example .env.production
# Edit .env.production with your actual values
nano .env.production

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

### **3. Database Setup**

```bash
# Connect to RDS and create database
psql -h your-rds-endpoint -U username -d postgres
CREATE DATABASE thechesswire;
\q

# Run database migrations (if you have them)
# This will be handled by your application on first run
```

### **4. SSL Certificate**

```bash
# Get SSL certificate
sudo certbot --nginx -d thechesswire.news -d www.thechesswire.news

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **5. Monitoring Setup**

```bash
# Install monitoring tools
pm2 install pm2-logrotate
pm2 install pm2-server-monit

# Setup log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

---

## 🔍 **VERIFICATION CHECKLIST**

### **✅ Pre-Deployment**
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] SSL certificate obtained
- [ ] Domain DNS configured

### **✅ Post-Deployment**
- [ ] Application accessible at https://thechesswire.news
- [ ] Authentication system working
- [ ] Voice narration functional
- [ ] Database operations working
- [ ] File uploads to S3 working
- [ ] Email notifications working
- [ ] Admin dashboard accessible

### **✅ Security Verification**
- [ ] HTTPS redirect working
- [ ] Security headers present
- [ ] Rate limiting active
- [ ] JWT authentication working
- [ ] Admin access restricted

---

## 📊 **MONITORING & MAINTENANCE**

### **PM2 Commands:**
```bash
# Check status
pm2 status

# View logs
pm2 logs thechesswire

# Restart application
pm2 restart thechesswire

# Monitor resources
pm2 monit
```

### **Nginx Commands:**
```bash
# Check configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **Database Backup:**
```bash
# Create backup
pg_dump -h your-rds-endpoint -U username thechesswire > backup.sql

# Restore backup
psql -h your-rds-endpoint -U username thechesswire < backup.sql
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues:**

#### **1. Application Not Starting**
```bash
# Check PM2 logs
pm2 logs thechesswire

# Check environment variables
pm2 env thechesswire

# Restart with fresh environment
pm2 delete thechesswire
pm2 start ecosystem.config.js --env production
```

#### **2. Database Connection Issues**
```bash
# Test connection
psql -h your-rds-endpoint -U username -d thechesswire

# Check security groups
# Ensure EC2 can connect to RDS on port 5432
```

#### **3. SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal
```

#### **4. Performance Issues**
```bash
# Check system resources
htop
df -h
free -h

# Check application logs
pm2 logs thechesswire --lines 100
```

---

## 💰 **COST ESTIMATION**

### **Monthly AWS Costs (Production):**
- **EC2 t3.large**: ~$30/month
- **RDS db.t3.small**: ~$25/month
- **S3 Storage (50GB)**: ~$1/month
- **CloudFront**: ~$5/month
- **Route53**: ~$1/month
- **Data Transfer**: ~$10/month

**Total: ~$72/month for production setup**

### **Monthly AWS Costs (Development):**
- **EC2 t3.medium**: ~$15/month
- **RDS db.t3.micro**: ~$8/month
- **S3 Storage (20GB)**: ~$0.50/month
- **CloudFront**: ~$2/month
- **Route53**: ~$1/month
- **Data Transfer**: ~$5/month

**Total: ~$31.50/month for development setup**

---

## 🎯 **NEXT STEPS**

1. **Set up AWS account** and create required services
2. **Configure environment variables** with your actual values
3. **Deploy to EC2** using the provided scripts
4. **Test all functionality** on the live server
5. **Set up monitoring** and alerting
6. **Configure backups** and disaster recovery
7. **Launch your platform!** 🚀

---

**Your TheChessWire.news platform is ready for AWS deployment! All Phase 1 and Phase 2 features are implemented and production-ready.** 