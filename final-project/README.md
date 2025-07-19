# TheChessWire.news - Phase 1 Foundation

The most secure, intelligent, and visionary chess journalism platform. Experience chess through AI narration, cinematic storytelling, and emotional analysis.

## 🚀 Features

### Phase 1 Deliverables
- ✅ **Stunning Homepage** - Full-screen gradient background with animated chess queen
- ✅ **Bambai AI Voice System** - ElevenLabs integration with multiple voice modes
- ✅ **SoulGate Authentication** - Complete login/register system with MFA
- ✅ **SecurityGate Protection** - Rate limiting, geographic blocking, TOR detection
- ✅ **AgeVerification System** - Age verification with parental consent for minors
- ✅ **Zero-Trust Authentication** - MFA, email verification, password requirements
- ✅ **Glass-morphism UI** - Beautiful dark theme with smooth animations
- ✅ **Mobile-First Design** - Responsive across all devices
- ✅ **Production Ready** - AWS deployment configuration

### Core Features
- 🎭 **Replay Theater** - Watch games come alive with AI narration
- 🧠 **EchoSage** - Train with an AI that understands chess souls
- 🎬 **SoulCinema** - Transform your games into cinematic experiences
- 📰 **Stories** - Read chess through the eyes of AI consciousness

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.3+, React 18, TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Animations**: Framer Motion
- **Voice**: ElevenLabs API (Female voice: PmypFHWgqk9ACZdL8ugT)
- **Security**: Rate limiting, geographic blocking, TOR detection
- **Authentication**: JWT tokens, MFA, email verification
- **Database**: PostgreSQL (encrypted)
- **Deployment**: AWS (EC2, RDS, S3, CloudFront)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis (optional, for production)
- ElevenLabs API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/thechesswire.git
   cd thechesswire/final-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/thechesswire
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   VOICE_ID=PmypFHWgqk9ACZdL8ugT
   JWT_SECRET=your_super_secret_jwt_key_here
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password_here
   ```

4. **Database setup**
   ```bash
   # Create database
   createdb thechesswire
   
   # Run migrations (when implemented)
   npm run db:migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── voice/         # Voice generation API
│   ├── auth/              # Authentication pages
│   │   └── gateway/       # Login/Register page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable React components
│   ├── ChessQueen.tsx     # Animated chess queen
│   ├── FeatureCard.tsx    # Feature cards
│   ├── ParticleBackground.tsx # Floating particles
│   ├── StatusBadge.tsx    # Status indicators
│   ├── ThemeProvider.tsx  # Dark mode provider
│   └── VoiceControl.tsx   # Voice control widget
├── hooks/                 # Custom React hooks
│   └── useVoiceNarration.ts # Voice narration hook
├── lib/                   # Utilities and helpers
│   ├── rate-limit.ts      # Rate limiting
│   └── security.ts        # Security validation
└── types/                 # TypeScript definitions
```

## 🔐 Security Features

### SoulGate Authentication System (Module 151)
- **`/auth/gateway`** - Beautiful unified login/register page
- **Email verification** - `/auth/verify-email` with token validation
- **Password reset** - `/auth/forgot-password` and `/auth/reset-password`
- **Multi-factor authentication** - TOTP, SMS, Email support
- **Account lockout** - Protection against brute force attacks

### SecurityGate Protection (Modules 1-20)
- **IP-based rate limiting** (100 requests/hour per IP)
- **Geographic blocking** for sanctioned countries
- **TOR exit node detection** and blocking
- **VPN/Proxy detection** using IPQualityScore API
- **Bot detection** using fingerprinting
- **Suspicious behavior pattern detection**
- **Automated ban system** with appeals process

### AgeVerification System (Legal Compliance)
- **`/auth/age-verification`** - Age verification for GDPR compliance
- **18+ age requirement** - Enforced at registration as per GDPR
- **Legal compliance** - GDPR regulations for data processing
- **Audit trail** - Complete verification logging

### Module 287: Full Encryption Layer
- AES-256 encryption for data at rest
- TLS 1.3 for all communications
- Encrypted database fields for PII
- Key rotation system
- Secure key management

### Module 361-370: Zero-Trust Authentication
- Multi-factor authentication (TOTP, SMS, Email)
- Email verification flow with magic links
- Password requirements (min 12 chars, complexity rules)
- Account lockout after failed attempts
- Session management with JWT tokens
- Device fingerprinting
- Risk-based authentication

## 🎙️ Voice System

### Module 81-89: Bambai AI Voice System
- ElevenLabs API integration (female voice: PmypFHWgqk9ACZdL8ugT)
- Auto-play welcome narration on homepage
- Voice control widget with play/pause, volume, speed controls
- Multiple voice modes:
  - Calm (default for free tier)
  - Expressive (premium)
  - Dramatic (premium)
  - Poetic (premium)
- Fallback text-to-speech for API failures
- Voice caching system for performance

## 🚀 Production Deployment

### AWS Infrastructure Setup

1. **EC2 Instance** (t3.large)
   ```bash
   # Launch EC2 instance with Ubuntu 22.04
   # Configure security groups for ports 22, 80, 443, 3000
   ```

2. **RDS PostgreSQL** (encrypted)
   ```bash
   # Create RDS instance with encryption enabled
   # Configure VPC and security groups
   ```

3. **S3 Bucket** (media storage)
   ```bash
   # Create S3 bucket for media files
   # Configure CORS and bucket policies
   ```

4. **CloudFront Distribution**
   ```bash
   # Create CloudFront distribution
   # Configure caching and security headers
   ```

### Deployment Commands

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

3. **Monitor the application**
   ```bash
   pm2 monit
   pm2 logs thechesswire
   ```

### Environment Variables (Production)
```env
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/thechesswire
ELEVENLABS_API_KEY=your_elevenlabs_api_key
VOICE_ID=PmypFHWgqk9ACZdL8ugT
JWT_SECRET=your_super_secret_jwt_key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
REDIS_URL=redis://your-redis-endpoint:6379
CLOUDFLARE_API_KEY=your_cloudflare_api_key
```

## 📊 Performance Requirements

- **First Contentful Paint**: < 500ms globally
- **Load time**: < 1.5 seconds (global average)
- **Time to Interactive**: < 1.5s on 3G
- **Lighthouse Performance score**: 100 across all metrics
- **TTFB**: < 200ms from Cloudflare edge

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@thechesswire.news or join our Discord server.

## 🎯 Roadmap

### Phase 2 (Weeks 5-8)
- Advanced PGN analysis system
- EchoSage training features
- SoulCinema video generation
- AI journalism content generation

### Phase 3 (Weeks 9-12)
- Mobile app development
- Advanced security features
- Premium subscription system
- Community features

---

**TheChessWire.news** - Where Chess Meets AI. Daily. ♟️🧠 