// middleware.ts - TheChessWire.news Security Layer
// Implements Modules 73-75: OWASP, Threat Intelligence, Behavior Fingerprinting
// File: middleware.ts (save in root directory)
//
// ✅ FEATURES INCLUDED:
// - Dynamic TOR exit node detection (updates hourly from torproject.org)
// - Geographic blocking with configurable country list
// - Rate limiting (in-memory, Redis-ready)
// - VPN detection (basic user-agent analysis)
// - OWASP security headers (CSP, HSTS, etc.)
// - Behavioral risk scoring
// - Real-time security event logging
// - No external dependencies required

import { NextRequest, NextResponse } from "next/server";

// Security Configuration
const PROTECTED_PATHS = [
  "/admin",
  "/onboarding", 
  "/dashboard",
  "/upload",
  "/api/voice",
  "/api/video",
  "/api/user"
];

const BLOCKED_COUNTRIES = ["CN", "RU", "KP"]; // Configurable geo-blocking
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;
const ENABLE_TOR_BLOCKING = true; // Toggle TOR detection on/off

// In-memory rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Dynamic TOR Exit Node Detection
class TORDetector {
  private static torExitNodes = new Set<string>();
  private static lastUpdate = 0;
  private static readonly UPDATE_INTERVAL = 3600000; // 1 hour
  private static isUpdating = false;

  static async isTorExitNode(ip: string): Promise<boolean> {
    await this.updateTorListIfNeeded();
    return this.torExitNodes.has(ip);
  }

  private static async updateTorListIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - this.lastUpdate < this.UPDATE_INTERVAL || this.isUpdating) {
      return; // Still fresh or already updating
    }

    this.isUpdating = true;
    try {
      const response = await fetch('https://check.torproject.org/torbulkexitlist', {
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const text = await response.text();
      
      // Parse the IP list
      const ips = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#') && this.isValidIP(line));
      
      this.torExitNodes = new Set(ips);
      this.lastUpdate = now;
      
      console.log(`✅ Updated TOR exit node list: ${ips.length} nodes`);
    } catch (error) {
      console.error('❌ Failed to update TOR list:', error);
      // Keep using existing list on failure (fail-safe)
      if (this.torExitNodes.size === 0) {
        // Fallback list if we've never successfully loaded
        this.torExitNodes = new Set([
          "185.220.100.240", "185.220.100.241", "185.220.101.240"
        ]);
      }
    } finally {
      this.isUpdating = false;
    }
  }

  private static isValidIP(ip: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }
}

// VPN Detection patterns (basic implementation)
const VPN_PROVIDERS = [
  "nordvpn", "expressvpn", "surfshark", "protonvpn",
  "mullvad", "pia", "cyberghost"
];

interface SecurityCheck {
  allowed: boolean;
  reason?: string;
  riskScore: number;
}

async function performSecurityChecks(req: NextRequest): Promise<SecurityCheck> {
  const ip = getClientIP(req);
  const userAgent = req.headers.get("user-agent") || "";
  const country = (req as any).geo?.country || "unknown";
  
  let riskScore = 0;
  let blockReason = "";

  // 1. GEO-BLOCKING CHECK (Module 74)
  if (BLOCKED_COUNTRIES.includes(country)) {
    return {
      allowed: false,
      reason: "Geographic restriction",
      riskScore: 100
    };
  }

  // 2. TOR DETECTION (Module 74) - Dynamic List
  if (ENABLE_TOR_BLOCKING) {
    const isTorNode = await TORDetector.isTorExitNode(ip);
    if (isTorNode) {
      return {
        allowed: false,
        reason: "TOR traffic not permitted",
        riskScore: 90
      };
    }
  }

  // 3. VPN DETECTION (Basic implementation)
  const isVPN = VPN_PROVIDERS.some(provider => 
    userAgent.toLowerCase().includes(provider)
  );
  if (isVPN) {
    riskScore += 30;
  }

  // 4. RATE LIMITING CHECK
  const rateLimitResult = checkRateLimit(ip);
  if (!rateLimitResult.allowed) {
    return {
      allowed: false,
      reason: "Rate limit exceeded",
      riskScore: 70
    };
  }

  // 5. SUSPICIOUS USER AGENT CHECK
  if (isSuspiciousUserAgent(userAgent)) {
    riskScore += 25;
  }

  // 6. BEHAVIORAL FINGERPRINTING (Module 75)
  const behaviorRisk = analyzeBehavior(req);
  riskScore += behaviorRisk;

  // Block if risk score too high
  if (riskScore >= 70) {
    return {
      allowed: false,
      reason: "High risk behavior detected",
      riskScore
    };
  }

  return { allowed: true, riskScore };
}

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    (req as any).ip ||
    "unknown"
  );
}

function checkRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    // New window or expired
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true };
}

function isSuspiciousUserAgent(userAgent: string): boolean {
  const suspicious = [
    "bot", "crawler", "spider", "scraper",
    "curl", "wget", "python-requests",
    "postman", "insomnia"
  ];
  
  const ua = userAgent.toLowerCase();
  return suspicious.some(pattern => ua.includes(pattern));
}

function analyzeBehavior(req: NextRequest): number {
  let risk = 0;
  
  // Check for rapid requests (basic implementation)
  const referer = req.headers.get("referer");
  if (!referer && req.nextUrl.pathname !== "/") {
    risk += 15; // Direct access to internal pages
  }

  // Check for missing standard headers
  const acceptLanguage = req.headers.get("accept-language");
  if (!acceptLanguage) {
    risk += 10;
  }

  return risk;
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  // OWASP Security Headers (Module 73)
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https:; connect-src 'self' https:; font-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self';"
  );
  
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), location=()");

  return response;
}

async function logSecurityEvent(
  req: NextRequest, 
  event: string, 
  details: any
): Promise<void> {
  // Log to security system (implement with your logging solution)
  console.log(`🛡️ SECURITY EVENT: ${event}`, {
    ip: getClientIP(req),
    path: req.nextUrl.pathname,
    userAgent: req.headers.get("user-agent"),
    timestamp: new Date().toISOString(),
    ...details
  });
  
  // Future: Send to CloudWatch, DataDog, or security SIEM
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const path = nextUrl.pathname;

  // Apply security headers to all responses
  const response = NextResponse.next();
  applySecurityHeaders(response);

  // Skip security checks for public assets and API health checks
  if (
    path.startsWith("/_next/") ||
    path.startsWith("/favicon") ||
    path === "/health" ||
    path === "/robots.txt"
  ) {
    return response;
  }

  // Perform enhanced security checks for protected paths
  const isProtectedPath = PROTECTED_PATHS.some(protectedPath => 
    path.startsWith(protectedPath)
  );

  if (isProtectedPath || path.startsWith("/api/")) {
    try {
      const securityCheck = await performSecurityChecks(req);

      if (!securityCheck.allowed) {
        await logSecurityEvent(req, "ACCESS_BLOCKED", {
          reason: securityCheck.reason,
          riskScore: securityCheck.riskScore
        });

        // Return appropriate error response
        if (securityCheck.reason?.includes("rate limit")) {
          return new NextResponse("Rate limit exceeded", { 
            status: 429,
            headers: {
              "Retry-After": "60",
              "X-RateLimit-Limit": MAX_REQUESTS_PER_WINDOW.toString(),
              "X-RateLimit-Remaining": "0"
            }
          });
        }

        // Generic security block
        return new NextResponse("Access denied", { status: 403 });
      }

      // Log successful access for high-risk IPs
      if (securityCheck.riskScore > 30) {
        await logSecurityEvent(req, "HIGH_RISK_ACCESS", {
          riskScore: securityCheck.riskScore
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await logSecurityEvent(req, "SECURITY_CHECK_ERROR", { error: errorMessage });
      // Allow access if security check fails (fail-open for availability)
      console.error("Security check failed:", error);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
