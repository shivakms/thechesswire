// File: /components/onboarding/SecurityGate.tsx
const SecurityGate = {
  async check() {
    // In production, this would check:
    // - TOR/VPN/Proxy detection
    // - Geo-location restrictions
    // - Rate limiting
    // - Browser fingerprinting
    // - Previous ban history
    
    const fingerprint = generateFingerprint();
    
    // Check for suspicious patterns
    const suspiciousPatterns = checkSuspiciousPatterns();
    
    return {
      allowed: !suspiciousPatterns,
      reason: suspiciousPatterns ? 'Suspicious activity detected' : null,
      fingerprint
    };
  }
};

function generateFingerprint() {
  // Enhanced fingerprinting
  const data = {
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    canvas: getCanvasFingerprint(),
    webgl: getWebGLFingerprint()
  };
  return btoa(JSON.stringify(data));
}

function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('ChessWire Security Check', 2, 2);
    return canvas.toDataURL().slice(-50);
  } catch (_e) {
    return '';
  }
}

function getWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) return '';
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return '';
    
    return gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
  } catch (_e) {
    return '';
  }
}

function checkSuspiciousPatterns() {
  // Check for automation tools
  if (navigator.webdriver) return true;
  
  // Check for headless browsers
  if (!(window as unknown as { chrome?: unknown }).chrome && navigator.userAgent.includes('Chrome')) return true;
  
  // Check for common automation properties
  if (window.document.documentElement.getAttribute('webdriver')) return true;
  
  return false;
}

export default SecurityGate;
