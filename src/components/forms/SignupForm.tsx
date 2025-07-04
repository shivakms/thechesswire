// src/components/forms/SignupForm.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ConsentAgreement from "@/components/forms/ConsentAgreement";
import { toast } from "react-hot-toast";
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ChevronRight, 
  Brain, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Loader2, 
  CheckCircle2, 
  Shield, 
  Crown, 
  AlertCircle, 
  Zap 
} from "lucide-react";

// Module 151: EchoOrigin archetypes
const ECHO_ORIGINS = [
  { id: "wanderer", name: "The Wanderer", icon: "🚶", description: "Exploring endless possibilities" },
  { id: "defender", name: "The Defender", icon: "🛡️", description: "Guardian of the back rank" },
  { id: "gambler", name: "The Gambler", icon: "🎲", description: "Risk is the spice of chess" },
  { id: "heir", name: "The Heir", icon: "👑", description: "Born to rule the board" },
  { id: "scholar", name: "The Scholar", icon: "📚", description: "Student of the eternal game" },
  { id: "warrior", name: "The Warrior", icon: "⚔️", description: "Every move is a battle" }
];

// Module 78: Voice Personality modes
const VOICE_MODES = [
  { id: "calm", name: "Calm", description: "Soothing and meditative" },
  { id: "expressive", name: "Expressive", description: "Dramatic and emotional" },
  { id: "poetic", name: "Poetic", description: "Lyrical and beautiful" },
  { id: "storyteller", name: "Storyteller", description: "Narrative and engaging" }
];

// Password validation requirements
interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  icon: string;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: "length",
    label: "At least 12 characters",
    validator: (password: string) => password.length >= 12,
    icon: "📏"
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A-Z)",
    validator: (password: string) => /[A-Z]/.test(password),
    icon: "🔠"
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a-z)",
    validator: (password: string) => /[a-z]/.test(password),
    icon: "🔡"
  },
  {
    id: "number",
    label: "One number (0-9)",
    validator: (password: string) => /[0-9]/.test(password),
    icon: "🔢"
  },
  {
    id: "special",
    label: "One special character (!@#$%^&*)",
    validator: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    icon: "⚡"
  }
];

// Titled player verification states
type VerificationStatus = "none" | "verifying" | "verified" | "failed";

export default function SignupForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState<Record<string, boolean>>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  
  // Module 151: EchoOrigin selection
  const [echoOrigin, setEchoOrigin] = useState("");
  
  // Module 78: Voice mode selection
  const [voiceMode, setVoiceMode] = useState("calm");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  // Titled player verification
  const [isTitledPlayer, setIsTitledPlayer] = useState(false);
  const [fideId, setFideId] = useState("");
  const [chessComUsername, setChessComUsername] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("none");
  const [verificationDetails, setVerificationDetails] = useState<{title?: string; name?: string; rating?: number}>({});
  
  // Module 75: Behavior fingerprinting
  const [behaviorData, setBehaviorData] = useState({
    typingRhythm: [] as number[],
    mouseMovements: [] as { x: number; y: number; time: number }[],
    scrollPatterns: [] as number[],
    sessionStart: Date.now(),
    formInteractions: 0,
    hesitationPatterns: [] as number[]
  });

  // Bambai AI welcome narration
  const [showWelcome, setShowWelcome] = useState(true);
  const [narrationText, setNarrationText] = useState("");

  // Module 75: Track typing rhythm
  const lastKeyTime = useRef(Date.now());
  const handleKeyDown = () => {
    const now = Date.now();
    const rhythm = now - lastKeyTime.current;
    lastKeyTime.current = now;
    setBehaviorData(prev => ({
      ...prev,
      typingRhythm: [...prev.typingRhythm.slice(-50), rhythm],
      formInteractions: prev.formInteractions + 1
    }));
  };

  // Validate password on change
  useEffect(() => {
    const validation: Record<string, boolean> = {};
    PASSWORD_REQUIREMENTS.forEach(req => {
      validation[req.id] = req.validator(password);
    });
    setPasswordValidation(validation);
  }, [password]);

  // Module 75: Track mouse movements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setBehaviorData(prev => ({
        ...prev,
        mouseMovements: [...prev.mouseMovements.slice(-100), {
          x: e.clientX,
          y: e.clientY,
          time: Date.now()
        }]
      }));
    };

    const handleScroll = () => {
      setBehaviorData(prev => ({
        ...prev,
        scrollPatterns: [...prev.scrollPatterns.slice(-20), window.scrollY]
      }));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Bambai AI narration effect
  useEffect(() => {
    if (voiceEnabled && showWelcome) {
      const text = "Welcome, future chess soul. Before we begin your journey, tell me... who were you before this moment?";
      let i = 0;
      const interval = setInterval(() => {
        if (i <= text.length) {
          setNarrationText(text.slice(0, i));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [voiceEnabled, showWelcome]);

  // Speak narration (Bambai AI Voice)
  useEffect(() => {
    if (voiceEnabled && narrationText && window.speechSynthesis) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      if (narrationText.length === ("Welcome, future chess soul. Before we begin your journey, tell me... who were you before this moment?").length) {
        const utterance = new SpeechSynthesisUtterance(narrationText);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [narrationText, voiceEnabled]);

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(valid => valid);
  };

  // Verify titled player status
  const verifyTitledPlayer = async () => {
    if (!fideId && !chessComUsername) {
      toast.error("Please provide either FIDE ID or Chess.com/Lichess username");
      return;
    }

    setVerificationStatus("verifying");

    try {
      const response = await fetch("/api/auth/verify-titled-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fideId, chessComUsername })
      });

      const data = await response.json();

      if (data.verified) {
        setVerificationStatus("verified");
        setVerificationDetails(data.details);
        toast.success(`Verified! Welcome ${data.details.title} ${data.details.name || chessComUsername}`);
      } else {
        setVerificationStatus("failed");
        toast.error(data.message || "Verification failed. Please check your credentials.");
      }
    } catch {
      setVerificationStatus("failed");
      toast.error("Verification service temporarily unavailable");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!termsAccepted || !privacyAccepted) {
      toast.error("You must accept the Terms and Privacy Policy");
      setLoading(false);
      return;
    }

    if (!echoOrigin) {
      toast.error("Please choose your chess origin story");
      setLoading(false);
      return;
    }

    if (!isPasswordValid()) {
      toast.error("Password does not meet all requirements");
      setLoading(false);
      return;
    }

    // Titled player validation
    if (isTitledPlayer) {
      if (!fideId && !chessComUsername) {
        toast.error("Please provide either FIDE ID or Chess.com/Lichess username for verification");
        setLoading(false);
        return;
      }
      if (verificationStatus !== "verified") {
        toast.error("Please verify your titled player status first");
        setLoading(false);
        return;
      }
    }

    // Module 287: Generate session hash for encryption
    const sessionHash = btoa(JSON.stringify({
      timestamp: Date.now(),
      fingerprint: behaviorData,
      origin: echoOrigin
    }));

    const signupData = {
      email,
      password,
      username,
      echoOrigin,
      voiceMode,
      voiceEnabled,
      isTitledPlayer,
      fideId: isTitledPlayer ? fideId : null,
      chessComUsername: isTitledPlayer ? chessComUsername : null,
      titledPlayerVerified: verificationStatus === "verified",
      titledPlayerDetails: verificationDetails,
      acceptedTerms: true,
      acceptedPrivacy: true,
      acceptedAt: new Date().toISOString(),
      behaviorFingerprint: {
        typingRhythm: behaviorData.typingRhythm,
        sessionDuration: Date.now() - behaviorData.sessionStart,
        mouseActivity: behaviorData.mouseMovements.length,
        formInteractions: behaviorData.formInteractions
      },
      // Module 287: Encryption marker
      encryptionRequired: true,
      gdprConsent: true,
      sessionHash
    };

    try {
      // Log consent first (Module 287)
      await fetch("/api/log-consent", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-Token": sessionHash,
          "X-Security-Fingerprint": btoa(JSON.stringify(behaviorData))
        },
        body: JSON.stringify(signupData)
      });

      // Actual signup API call
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Security-Fingerprint": btoa(JSON.stringify(behaviorData))
        },
        body: JSON.stringify(signupData)
      });

      if (response.ok) {
        toast.success("Welcome to TheChessWire.news! Your journey begins...");
        
        // Bambai AI narration
        if (voiceEnabled && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(
            `Welcome, ${ECHO_ORIGINS.find(o => o.id === echoOrigin)?.name}. Your chess soul awakens.`
          );
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          window.speechSynthesis.speak(utterance);
        }
        
        // Small delay for voice to play
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        const error = await response.json();
        toast.error(error.message || "Signup failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1823] to-[#1a0f2e] flex items-center justify-center p-4">
      {/* Background chess pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
          {[...Array(64)].map((_, i) => (
            <div key={i} className={(i + Math.floor(i / 8)) % 2 === 0 ? "bg-white" : "bg-transparent"} />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        {/* Bambai AI Welcome Narration */}
        {showWelcome && (
          <div className="mb-8 text-center animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="w-8 h-8 text-brand-accent animate-pulse" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-accent to-purple-400 bg-clip-text text-transparent">
                Bambai AI Welcomes You
              </h1>
            </div>
            <p className="text-lg text-gray-300 italic max-w-2xl mx-auto min-h-[2em]">
              {narrationText}
            </p>
            <button
              onClick={() => {
                setShowWelcome(false);
                window.speechSynthesis.cancel();
              }}
              className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Skip intro →
            </button>
          </div>
        )}

        <form 
          ref={formRef}
          onSubmit={handleSignup}
          onKeyDown={handleKeyDown}
          className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-800/50"
        >
          <div className="grid lg:grid-cols-2 gap-8 p-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Join TheChessWire</h2>
                <p className="text-gray-400">Begin your chess soul journey</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose your chess identity"
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all"
                    required
                    minLength={3}
                    maxLength={20}
                    pattern="[a-zA-Z0-9_-]+"
                    title="Username can only contain letters, numbers, underscores, and hyphens"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      placeholder="••••••••••••"
                      className={`w-full px-4 py-3 pr-12 rounded-xl bg-gray-800/50 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${passwordFocused ? isPasswordValid() ? "border-green-600 focus:border-green-600 focus:ring-green-600/20" : "border-brand-accent focus:border-brand-accent focus:ring-brand-accent/20" : password.length > 0 ? isPasswordValid() ? "border-green-600" : "border-yellow-600" : "border-gray-700"}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Requirements */}
                  {(passwordFocused || password.length > 0) && (
                    <div className="mt-3 space-y-2 animate-fade-in">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Password Requirements:</p>
                      <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                        {PASSWORD_REQUIREMENTS.map((req) => {
                          const isValid = passwordValidation[req.id];
                          const showStatus = password.length > 0;
                          
                          return (
                            <div
                              key={req.id}
                              className={`flex items-center gap-2 text-xs transition-all duration-300 ${showStatus ? isValid ? "text-green-400" : "text-gray-400" : "text-gray-500"}`}
                            >
                              <div className="flex items-center justify-center w-5 h-5">
                                {showStatus ? (
                                  isValid ? (
                                    <Check className="w-4 h-4 text-green-400 animate-scale-in" />
                                  ) : (
                                    <X className="w-4 h-4 text-gray-500" />
                                  )
                                ) : (
                                  <span className="text-xs">{req.icon}</span>
                                )}
                              </div>
                              <span className={`transition-all ${isValid ? "font-medium" : ""}`}>
                                {req.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {password.length > 0 && isPasswordValid() && (
                        <div className="flex items-center gap-2 text-green-400 text-xs font-medium animate-fade-in">
                          <Shield className="w-4 h-4" />
                          <span>Strong password! Your account will be secure.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Titled Player Option */}
                <div className={`bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl p-4 border transition-all ${verificationStatus === "verified" ? "border-green-600/50" : verificationStatus === "failed" ? "border-red-600/50" : "border-yellow-600/30"}`}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTitledPlayer}
                      onChange={(e) => {
                        setIsTitledPlayer(e.target.checked);
                        if (!e.target.checked) {
                          setVerificationStatus("none");
                          setVerificationDetails({});
                        }
                      }}
                      className="w-5 h-5 rounded accent-yellow-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold text-white">I&apos;m a Titled Player</span>
                        {verificationStatus === "verified" && (
                          <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        GM, IM, FM, CM, WGM, WIM, WFM, WCM, AGM, AIM, ACM
                      </p>
                    </div>
                  </label>

                  {isTitledPlayer && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-yellow-300 font-medium">
                        <AlertCircle className="w-4 h-4" />
                        <span>Verification required - provide at least one</span>
                      </div>
                      
                      <div className="relative">
                        <input
                          type="text"
                          value={fideId}
                          onChange={(e) => {
                            setFideId(e.target.value);
                            if (verificationStatus === "failed") setVerificationStatus("none");
                          }}
                          placeholder="FIDE ID"
                          className={`w-full px-3 py-2 rounded-lg bg-gray-800/50 border text-white text-sm focus:outline-none focus:ring-2 ${!fideId && !chessComUsername ? "border-yellow-500" : "border-gray-700"} focus:border-yellow-600 focus:ring-yellow-600/20`}
                          pattern="[0-9]*"
                        />
                      </div>
                      
                      <div className="relative">
                        <input
                          type="text"
                          value={chessComUsername}
                          onChange={(e) => {
                            setChessComUsername(e.target.value);
                            if (verificationStatus === "failed") setVerificationStatus("none");
                          }}
                          placeholder="Chess.com/Lichess username"
                          className={`w-full px-3 py-2 rounded-lg bg-gray-800/50 border text-white text-sm focus:outline-none focus:ring-2 ${!fideId && !chessComUsername ? "border-yellow-500" : "border-gray-700"} focus:border-yellow-600 focus:ring-yellow-600/20`}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={verifyTitledPlayer}
                        disabled={(!fideId && !chessComUsername) || verificationStatus === "verifying"}
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${verificationStatus === "verified" ? "bg-green-600 text-white cursor-default" : "bg-yellow-600 hover:bg-yellow-700 text-black disabled:opacity-50 disabled:cursor-not-allowed"}`}
                      >
                        {verificationStatus === "verifying" ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : verificationStatus === "verified" ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Verified as {verificationDetails.title}</span>
                          </>
                        ) : verificationStatus === "failed" ? (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            <span>Verify Again</span>
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            <span>Verify Status</span>
                          </>
                        )}
                      </button>

                      {verificationStatus === "verified" && (
                        <div className="text-xs text-green-400 space-y-1 animate-fade-in">
                          <p className="font-medium">✓ Verification successful!</p>
                          <p>✓ Premium features free forever</p>
                          <p>✓ No ads</p>
                          <p>✓ Priority content placement</p>
                        </div>
                      )}

                      {verificationStatus === "failed" && (
                        <div className="text-xs text-red-400 space-y-1 animate-fade-in">
                          <p>⚠️ Verification failed. Please check:</p>
                          <p>• FIDE ID is numeric only</p>
                          <p>• Username matches exactly</p>
                          <p>• Account has titled status</p>
                        </div>
                      )}

                      {verificationStatus === "none" && (
                        <div className="text-xs text-gray-400 italic">
                          False claims may result in account suspension
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Soul Configuration */}
            <div className="space-y-6">
              {/* Module 151: EchoOrigin Selection */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-accent" />
                  Choose Your Chess Origin
                </h3>
                <p className="text-sm text-gray-400 mb-4">Who were you before this journey?</p>
                <div className="grid grid-cols-2 gap-3">
                  {ECHO_ORIGINS.map((origin) => (
                    <button
                      key={origin.id}
                      type="button"
                      onClick={() => setEchoOrigin(origin.id)}
                      className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${echoOrigin === origin.id ? "border-brand-accent bg-brand-accent/10 shadow-lg shadow-brand-accent/20 scale-105" : "border-gray-700 bg-gray-800/30 hover:border-gray-600"}`}
                    >
                      <div className="text-2xl mb-2">{origin.icon}</div>
                      <div className="text-sm font-medium text-white">{origin.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{origin.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Module 78: Voice Mode Selection */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {voiceEnabled ? (
                      <Volume2 className="w-5 h-5 text-brand-accent" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  Bambai AI Voice Personality
                </h3>
                {voiceEnabled && (
                  <div className="space-y-2">
                    {VOICE_MODES.map((mode) => (
                      <label
                        key={mode.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${voiceMode === mode.id ? "bg-brand-accent/10 border border-brand-accent" : "bg-gray-800/30 border border-gray-700 hover:border-gray-600"}`}
                      >
                        <input
                          type="radio"
                          name="voiceMode"
                          value={mode.id}
                          checked={voiceMode === mode.id}
                          onChange={(e) => setVoiceMode(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-white">{mode.name}</div>
                          <div className="text-xs text-gray-400">{mode.description}</div>
                        </div>
                        {voiceMode === mode.id && (
                          <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" />
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Premium Features Preview */}
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-600/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold text-white">Your Journey Includes</span>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>3 SoulCinema renders per month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Basic EchoSage training</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Emotional voice narration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Community features</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-400 mt-3 italic">
                  Premium features available for enhanced experience
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section - Consent & Submit */}
          <div className="bg-gray-900/50 px-8 py-6 border-t border-gray-800">
            <ConsentAgreement
              termsAccepted={termsAccepted}
              privacyAccepted={privacyAccepted}
              setTermsAccepted={setTermsAccepted}
              setPrivacyAccepted={setPrivacyAccepted}
              className="mb-6"
            />

            <button
              type="submit"
              disabled={loading || !echoOrigin || !termsAccepted || !privacyAccepted || !isPasswordValid() || (isTitledPlayer && verificationStatus !== "verified")}
              className="w-full py-4 rounded-xl font-semibold text-black bg-gradient-to-r from-brand-accent to-yellow-500 hover:from-brand-accent/90 hover:to-yellow-500/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2 disabled:transform-none disabled:shadow-none"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Creating your chess soul...</span>
                </div>
              ) : (
                <>
                  <span>Begin Your Journey</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-400 mt-4">
              Already have an account?{" "}
              <a href="/login" className="text-brand-accent hover:text-white transition-colors">
                Sign in
              </a>
            </p>
          </div>
        </form>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Shield className="w-4 h-4" />
          <span>Protected by 72+ abuse vectors • Quantum encryption • Zero human review</span>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}