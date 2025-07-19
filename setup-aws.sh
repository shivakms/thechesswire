#!/bin/bash

echo "🚀 Setting up TheChessWire.news on AWS..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
echo "📦 Installing pnpm..."
npm install -g pnpm

# Install PM2
echo "📦 Installing PM2..."
npm install -g pm2

# Install PostgreSQL client
echo "📦 Installing PostgreSQL client..."
sudo apt install -y postgresql-client

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
echo "📦 Installing Certbot for SSL..."
sudo apt install -y certbot python3-certbot-nginx

# Install additional tools
echo "📦 Installing additional tools..."
sudo apt install -y htop git curl wget unzip

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/thechesswire
sudo chown ubuntu:ubuntu /var/www/thechesswire

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p /var/www/thechesswire/logs

# Setup Nginx configuration
echo "🌐 Setting up Nginx configuration..."
sudo tee /etc/nginx/sites-available/thechesswire << EOF
server {
    listen 80;
    server_name thechesswire.news www.thechesswire.news;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /api/ {
        limit_req zone=api burst=20 nodelay;
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

    location /api/auth/ {
        limit_req zone=login burst=5 nodelay;
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

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}

# Redirect HTTP to HTTPS (will be enabled after SSL)
server {
    listen 80;
    server_name thechesswire.news www.thechesswire.news;
    return 301 https://\$server_name\$request_uri;
}
EOF

# Enable site
echo "🔗 Enabling Nginx site..."
sudo ln -s /etc/nginx/sites-available/thechesswire /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "✅ Testing Nginx configuration..."
sudo nginx -t

# Start Nginx
echo "🚀 Starting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Setup PM2 startup script
echo "⚙️ Setting up PM2 startup..."
pm2 startup ubuntu

# Create environment file template
echo "📝 Creating environment file template..."
cat > /var/www/thechesswire/.env.production.template << EOF
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
EOF

# Create deployment script
echo "📝 Creating deployment script..."
cat > /var/www/thechesswire/deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying TheChessWire.news..."

# Navigate to application directory
cd /var/www/thechesswire

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build the application
echo "🔨 Building application..."
pnpm run build

# Restart PM2
echo "🔄 Restarting application..."
pm2 restart thechesswire

# Save PM2 configuration
pm2 save

echo "✅ Deployment complete!"
echo "📊 Check status with: pm2 status"
echo "📋 View logs with: pm2 logs thechesswire"
EOF

chmod +x /var/www/thechesswire/deploy.sh

# Create monitoring script
echo "📝 Creating monitoring script..."
cat > /var/www/thechesswire/monitor.sh << 'EOF'
#!/bin/bash

echo "📊 TheChessWire.news System Monitor"
echo "=================================="

echo ""
echo "🖥️  System Resources:"
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "Memory Usage: $(free | grep Mem | awk '{printf("%.2f%%", $3/$2 * 100.0)}')"
echo "Disk Usage: $(df -h / | awk 'NR==2 {print $5}')"

echo ""
echo "🚀 Application Status:"
pm2 status

echo ""
echo "🌐 Nginx Status:"
sudo systemctl status nginx --no-pager -l

echo ""
echo "📋 Recent Application Logs:"
pm2 logs thechesswire --lines 10 --nostream

echo ""
echo "🔍 Recent Nginx Access Logs:"
sudo tail -n 10 /var/log/nginx/access.log

echo ""
echo "❌ Recent Nginx Error Logs:"
sudo tail -n 10 /var/log/nginx/error.log
EOF

chmod +x /var/www/thechesswire/monitor.sh

# Setup log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/thechesswire << EOF
/var/www/thechesswire/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Create SSL setup script
echo "📝 Creating SSL setup script..."
cat > /var/www/thechesswire/setup-ssl.sh << 'EOF'
#!/bin/bash

echo "🔒 Setting up SSL certificate..."

# Get SSL certificate
sudo certbot --nginx -d thechesswire.news -d www.thechesswire.news

# Setup auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

echo "✅ SSL setup complete!"
echo "🔍 Check certificate status with: sudo certbot certificates"
EOF

chmod +x /var/www/thechesswire/setup-ssl.sh

# Setup firewall
echo "🔥 Setting up firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo ""
echo "🎉 Server setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Clone your repository: cd /var/www/thechesswire && git clone <your-repo> ."
echo "2. Configure environment: cp .env.production.template .env.production && nano .env.production"
echo "3. Install dependencies: pnpm install"
echo "4. Build application: pnpm run build"
echo "5. Start application: pm2 start ecosystem.config.js --env production"
echo "6. Setup SSL: ./setup-ssl.sh"
echo ""
echo "📊 Useful commands:"
echo "- Monitor system: ./monitor.sh"
echo "- Deploy updates: ./deploy.sh"
echo "- View logs: pm2 logs thechesswire"
echo "- Check status: pm2 status"
echo ""
echo "🔒 Security features enabled:"
echo "- Rate limiting on API endpoints"
echo "- Security headers"
echo "- Firewall configured"
echo "- SSL ready (run setup-ssl.sh after domain setup)"
echo ""
echo "🚀 Your TheChessWire.news server is ready for deployment!" 