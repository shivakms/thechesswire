// File: /components/onboarding/UsernameSelection.tsx
'use client';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { User, Mail, Lock, CheckCircle, XCircle, AlertCircle, Sparkles, Shield, FileText, ShieldCheck, Crown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import BambaiNarrator from './BambaiNarrator';
import Image from 'next/image';
import Link from 'next/link';
import { username as usernameApi } from '@/services/api';
import toast from 'react-hot-toast';

interface UsernameSelectionProps {
  onComplete: (username: string, email: string) => void;
  voiceEnabled: boolean;
}

export default function UsernameSelection({ onComplete, voiceEnabled }: UsernameSelectionProps) {
  const [loginCredential, setLoginCredential] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [credentialAvailable, setCredentialAvailable] = useState<boolean | null>(null);
  const [errors, setErrors] = useState({
    credential: '',
    password: '',
    confirmPassword: '',
    terms: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [focusedField, setFocusedField] = useState('');
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (voiceEnabled) {
      BambaiNarrator.speak('Forge your identity. Choose wisely, for this name shall echo through eternity.', 'poetic');
    }
  }, [voiceEnabled]);

  // Mouse tracking for 3D effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Detect if input is email or username
  const isEmail = (value: string) => value.includes('@');

  // Check availability (debounced)
  useEffect(() => {
    if (loginCredential.length < 3) {
      setCredentialAvailable(null);
      return;
    }

    // Only check username availability, not email
    if (isEmail(loginCredential)) {
      setCredentialAvailable(null);
      setErrors(prev => ({ ...prev, credential: '' }));
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingAvailability(true);
      try {
        // Convert to lowercase only for the API check, not the display
        const response = await usernameApi.checkAvailability(loginCredential.toLowerCase());
        setCredentialAvailable(response.available);
        
        if (!response.available) {
          setErrors(prev => ({ 
            ...prev, 
            credential: 'Username already taken. Try another.' 
          }));
        } else {
          setErrors(prev => ({ ...prev, credential: '' }));
        }
      } catch (error: any) {
        console.error('Username check failed:', error);
        // Don't block the user if the check fails
        setCredentialAvailable(true);
        toast.error('Unable to check username availability');
      } finally {
        setCheckingAvailability(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [loginCredential]);

  // Password strength checker
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 12) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;

    setPasswordStrength(strength);
  }, [password]);

  const validateForm = () => {
    let valid = true;
    const newErrors = { credential: '', password: '', confirmPassword: '', terms: '' };

    // Credential validation
    if (!loginCredential) {
      newErrors.credential = 'Username or email is required';
      valid = false;
    } else if (isEmail(loginCredential)) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginCredential)) {
        newErrors.credential = 'Please enter a valid email address';
        valid = false;
      }
    } else {
      if (loginCredential.length < 3) {
        newErrors.credential = 'Username must be at least 3 characters';
        valid = false;
      } else if (!/^[a-zA-Z0-9_-]+$/.test(loginCredential)) {
        newErrors.credential = 'Username can only contain letters, numbers, - and _';
        valid = false;
      }
      // Check if username is available
      if (credentialAvailable === false) {
        newErrors.credential = 'Username is not available';
        valid = false;
      }
    }

    // Password validation
    if (password.length < 12) {
      newErrors.password = 'Password must be at least 12 characters';
      valid = false;
    } else if (passwordStrength < 60) {
      newErrors.password = 'Password is too weak. Add uppercase, lowercase, numbers, and special characters.';
      valid = false;
    }

    // Confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    // Terms acceptance
    if (!acceptTerms) {
      newErrors.terms = 'You must accept the Terms &amp; Conditions and Privacy Policy';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For emails, we skip the availability check
    const canProceed = isEmail(loginCredential) ? true : credentialAvailable !== false;
    
    if (validateForm() && canProceed) {
      if (voiceEnabled) {
        const name = isEmail(loginCredential) ? 'warrior' : loginCredential;
        BambaiNarrator.speak(`Welcome to TheChessWire, ${name}. Your legend begins now.`, 'dramatic');
      }
      
      // Extract username and email - normalize username to lowercase for storage
      const username = isEmail(loginCredential) ? loginCredential.split('@')[0].toLowerCase() : loginCredential.toLowerCase();
      const email = isEmail(loginCredential) ? loginCredential.toLowerCase() : '';
      
      // Store credentials in session storage for the auth gateway
      const onboardingData = JSON.parse(sessionStorage.getItem('chesswire_onboarding') || '{}');
      sessionStorage.setItem('chesswire_onboarding', JSON.stringify({
        ...onboardingData,
        username,
        email,
        password, // Will be used in auth gateway
        acceptedTerms: acceptTerms,
        credentialType: isEmail(loginCredential) ? 'email' : 'username'
      }));
      
      onComplete(username, email);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return '#EF4444';
    if (passwordStrength < 60) return '#F59E0B';
    if (passwordStrength < 80) return '#10B981';
    return '#40E0D0';
  };

  const getStrengthText = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 60) return 'Fair';
    if (passwordStrength < 80) return 'Good';
    return 'Strong';
  };

  return (
    <div className="max-w-xl w-full" style={{ perspective: '1000px' }}>
      {/* 3D Card Container */}
      <motion.div
        ref={cardRef}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative"
      >
        {/* Glow effects */}
        <div className="absolute -inset-4 bg-gradient-to-r from-[#40E0D0] via-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20 animate-pulse" />
        <div className="absolute -inset-1 bg-gradient-to-r from-[#40E0D0]/20 via-purple-600/20 to-pink-600/20 rounded-3xl" />
        
        {/* Main card */}
        <div className="relative bg-black/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-10 shadow-2xl overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`,
                animation: 'slide 20s linear infinite',
              }} 
            />
          </div>

          {/* Header with animated logo */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 relative z-10"
          >
            <motion.div 
              className="inline-block mb-6"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#40E0D0] blur-3xl opacity-50" />
                <Image
                  src="/assets/chesswire-logo-white.svg"
                  alt="TheChessWire"
                  width={80}
                  height={80}
                  className="relative z-10"
                />
              </div>
            </motion.div>

            <motion.h2 
              className="text-5xl font-black mb-3"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '-0.02em',
                textShadow: '0 0 30px rgba(64, 224, 208, 0.5)',
                backgroundImage: 'linear-gradient(90deg, #40E0D0, #9333EA, #EC4899, #40E0D0)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              Forge Your Identity
            </motion.h2>
            <p className="text-gray-400 text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Choose a name worthy of legends
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Username/Email Field - FIXED: Removed .toLowerCase() from onChange */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="relative group"
            >
              <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                focusedField === 'credential' ? 'ring-2 ring-[#40E0D0] shadow-lg shadow-[#40E0D0]/20' : ''
              }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10" />
                <input
                  type="text"
                  value={loginCredential}
                  onChange={(e) => setLoginCredential(e.target.value)}
                  onFocus={() => setFocusedField('credential')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Username / Email address"
                  className="w-full px-14 py-5 bg-transparent backdrop-blur-sm text-white placeholder-gray-500 focus:outline-none relative z-10"
                  style={{ 
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '16px'
                  }}
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 z-20">
                  {isEmail(loginCredential) ? (
                    <Mail className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                
                {/* Availability indicator - only for usernames */}
                {loginCredential && !isEmail(loginCredential) && (
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20">
                    {checkingAvailability ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-[#40E0D0] border-t-transparent rounded-full"
                      />
                    ) : credentialAvailable !== null && (
                      credentialAvailable ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )
                    )}
                  </div>
                )}
              </div>
              
              {errors.credential && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2 flex items-center gap-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.credential}
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                focusedField === 'password' ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20' : ''
              }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Password"
                  className="w-full px-14 py-5 bg-transparent backdrop-blur-sm text-white placeholder-gray-500 focus:outline-none relative z-10"
                  style={{ 
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '16px'
                  }}
                />
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 z-20 w-5 h-5" />
                
                {/* Strength indicator */}
                {password && (
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20">
                    <Shield 
                      className="w-5 h-5 transition-colors duration-300" 
                      style={{ color: getStrengthColor() }}
                    />
                  </div>
                )}
              </div>
              
              {/* Password strength bar */}
              {password && (
                <div className="mt-2">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength}%` }}
                      transition={{ duration: 0.3 }}
                      style={{ backgroundColor: getStrengthColor() }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs" style={{ color: getStrengthColor() }}>
                      {getStrengthText()}
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {passwordStrength}/100
                    </p>
                  </div>
                </div>
              )}
              
              {/* Single line password requirements */}
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <Sparkles className="w-3 h-3 text-[#40E0D0]" />
                12+ chars • uppercase • lowercase • number • special char
              </p>
              
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-1 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative group"
            >
              <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                focusedField === 'confirmPassword' ? 'ring-2 ring-pink-500 shadow-lg shadow-pink-500/20' : ''
              }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Confirm Password"
                  className="w-full px-14 py-5 bg-transparent backdrop-blur-sm text-white placeholder-gray-500 focus:outline-none relative z-10"
                  style={{ 
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '16px'
                  }}
                />
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 z-20 w-5 h-5" />
                
                {confirmPassword && password === confirmPassword && (
                  <CheckCircle className="absolute right-5 top-1/2 -translate-y-1/2 text-green-400 z-20 w-5 h-5" />
                )}
              </div>
              
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </motion.p>
              )}
            </motion.div>

            {/* Terms &amp; Conditions Checkbox */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className={`p-5 rounded-2xl bg-white/5 border ${acceptTerms ? 'border-[#40E0D0]/50 bg-[#40E0D0]/5' : 'border-white/10'} transition-all duration-300`}>
                <label className="flex items-start gap-4 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-md border-2 transition-all duration-300 ${
                      acceptTerms 
                        ? 'bg-gradient-to-br from-[#40E0D0] to-purple-500 border-[#40E0D0]' 
                        : 'bg-white/10 border-white/30 group-hover:border-white/50'
                    }`}>
                      {acceptTerms && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', bounce: 0.5 }}
                          className="w-full h-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-black" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <span className="text-gray-300 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      I&apos;ve read and accept the{' '}
                      <Link 
                        href="/terms" 
                        className="text-[#40E0D0] hover:text-[#40E0D0]/80 underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                        target="_blank"
                      >
                        Terms &amp; Conditions
                        <FileText className="w-3 h-3" />
                      </Link>
                      {' and '}
                      <Link 
                        href="/privacy" 
                        className="text-[#40E0D0] hover:text-[#40E0D0]/80 underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                        target="_blank"
                      >
                        Privacy Policy
                        <ShieldCheck className="w-3 h-3" />
                      </Link>
                    </span>
                    
                    {/* Legal notice */}
                    <p className="text-xs text-gray-500 mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      By registering, you confirm that you are 18 years or older and legally permitted to access this content.
                    </p>
                  </div>
                </label>
              </div>
              
              {errors.terms && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mt-2 flex items-center gap-2"
                >
                  <AlertCircle className="w-3 h-3" />
                  {errors.terms}
                </motion.p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={(!isEmail(loginCredential) && !credentialAvailable) || checkingAvailability || !acceptTerms}
              className="relative w-full py-5 font-bold text-lg rounded-2xl overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#40E0D0] via-purple-600 to-pink-600 transition-all duration-300 group-hover:scale-110" />
              
              {/* Glowing effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-white/20 blur-xl" />
              </div>
              
              {/* Button text */}
              <span className="relative z-10 text-black flex items-center justify-center gap-3">
                Choose Your Identity
                <Crown className="w-5 h-5" />
              </span>
              
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>
          </form>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes slide {
          from {
            transform: translate(0, 0);
          }
          to {
            transform: translate(70px, 70px);
          }
        }
      `}</style>
    </div>
  );
}
