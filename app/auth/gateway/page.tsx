// File: /app/auth/gateway/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Eye, EyeOff, Sparkles, Zap } from 'lucide-react';
import BambaiNarrator from '@/components/onboarding/BambaiNarrator';
import Image from 'next/image';
import { auth } from '@/services/api';
import toast from 'react-hot-toast';

export default function AuthGateway() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [formData, setFormData] = useState({
    loginCredential: '', // Can be username or email
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({
    login: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [inputFocused, setInputFocused] = useState('');
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animated background particles - only run on client
  useEffect(() => {
    if (!mounted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    let animationFrame: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;

        ctx.fillStyle = `rgba(64, 224, 208, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [mounted, dimensions]);

  // Check if coming from onboarding (for signup mode)
  useEffect(() => {
    if (!mounted) return;
    
    const onboardingData = sessionStorage.getItem('chesswire_onboarding');
    if (!onboardingData && mode === 'signup') {
      // If no onboarding data and trying to signup, redirect to start
      router.push('/');
    }
  }, [router, mode, mounted]);

  const detectLoginType = (value: string) => {
    return value.includes('@') ? 'email' : 'username';
  };

  const validateForm = () => {
    const newErrors = { login: '', password: '' };
    let valid = true;

    // Validate login credential
    if (!formData.loginCredential) {
      newErrors.login = 'Username or email is required';
      valid = false;
    } else {
      const loginType = detectLoginType(formData.loginCredential);
      if (loginType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.loginCredential)) {
        newErrors.login = 'Please enter a valid email address';
        valid = false;
      } else if (loginType === 'username' && formData.loginCredential.length < 3) {
        newErrors.login = 'Username must be at least 3 characters';
        valid = false;
      }
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (mode === 'signup' && formData.password.length < 12) {
      newErrors.password = 'Password must be at least 12 characters';
      valid = false;
    }

    // Validate confirm password for signup
    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      newErrors.password = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({ login: '', password: '' });

    try {
      const loginType = detectLoginType(formData.loginCredential);
      
      if (mode === 'signin') {
        // Sign In
        const response = await auth.login({
          [loginType]: formData.loginCredential,
          password: formData.password
        });

        if (response.success) {
          toast.success('Welcome back!');
          
          if (mounted && typeof window !== 'undefined' && BambaiNarrator?.speak) {
            BambaiNarrator.speak(
              `Welcome back, ${response.user.username}. Your board awaits.`,
              'calm'
            );
          }
          
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        }
      } else {
        // Sign Up - get onboarding data
        const onboardingDataStr = sessionStorage.getItem('chesswire_onboarding');
        if (!onboardingDataStr) {
          toast.error('Please complete onboarding first');
          router.push('/');
          return;
        }

        const onboardingData = JSON.parse(onboardingDataStr);
        
        // Prepare signup data
        const signupData = {
          [loginType]: formData.loginCredential,
          username: loginType === 'email' ? onboardingData.username : formData.loginCredential,
          email: loginType === 'email' ? formData.loginCredential : onboardingData.email,
          password: formData.password,
          acceptTerms: formData.acceptTerms,
          echoOrigin: onboardingData.echoOrigin,
          voiceMode: onboardingData.voiceMode,
          isTitledPlayer: onboardingData.isTitledPlayer,
          titledPlayerVerified: onboardingData.titledPlayerVerified,
        };

        const response = await auth.register(signupData);

        if (response.success) {
          toast.success('Account created successfully!');
          
          if (mounted && typeof window !== 'undefined' && BambaiNarrator?.speak) {
            BambaiNarrator.speak(
              'Welcome to TheChessWire. Your destiny begins now.',
              'dramatic'
            );
          }
          
          // Clear onboarding data
          sessionStorage.removeItem('chesswire_onboarding');
          
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      }
    } catch (error: unknown) {
      console.error('Auth error:', error);
      
      // Handle specific error cases
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 
          'data' in error.response && error.response.data && 
          typeof error.response.data === 'object' && 'message' in error.response.data) {
        const message = (error.response.data as { message: string }).message;
        
        if (message.includes('already exists')) {
          setErrors({ 
            login: 'This username or email is already taken', 
            password: '' 
          });
        } else if (message.includes('Invalid credentials')) {
          setErrors({ 
            login: '', 
            password: 'Invalid username/email or password' 
          });
        } else {
          setErrors({ 
            login: message, 
            password: '' 
          });
        }
      } else {
        // Generic error
        toast.error('Something went wrong. Please try again.');
        setErrors({ 
          login: 'Network error. Please check your connection.', 
          password: '' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Animated particle background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 opacity-50"
        style={{ width: dimensions.width, height: dimensions.height }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-[#0a0a0a]" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(64, 224, 208, 0.15) 0%, transparent 40%)',
              'radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.15) 0%, transparent 40%)',
              'radial-gradient(circle at 50% 80%, rgba(255, 0, 128, 0.15) 0%, transparent 40%)',
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse' }}
        />
      </div>

      {/* Floating chess pieces with glow - only render after mount */}
      <div className="absolute inset-0 overflow-hidden">
        {['♔', '♕', '♖', '♗', '♘', '♙'].map((piece, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl md:text-8xl"
            style={{
              color: i % 2 === 0 ? '#40E0D0' : '#9333EA',
              textShadow: `0 0 30px ${i % 2 === 0 ? '#40E0D0' : '#9333EA'}`,
              filter: 'blur(1px)',
            }}
            initial={{ 
              x: Math.random() * dimensions.width,
              y: -100,
              rotate: Math.random() * 360
            }}
            animate={{
              y: dimensions.height + 100,
              rotate: Math.random() * 720,
              x: Math.random() * dimensions.width
            }}
            transition={{ 
              duration: 20 + Math.random() * 20,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 20
            }}
          >
            {piece}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="max-w-md w-full"
        >
          {/* Glowing card container */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#40E0D0] via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-30 animate-pulse" />
            
            {/* Main card */}
            <div className="relative bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
              {/* Animated logo */}
              <motion.div 
                className="flex justify-center mb-8"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-[#40E0D0] blur-2xl opacity-50" />
                  <Image
                    src="/assets/chesswire-logo-white.svg"
                    alt="TheChessWire"
                    width={80}
                    height={80}
                    className="relative z-10"
                  />
                </div>
              </motion.div>

              {/* Title with gradient animation */}
              <div className="text-center mb-8">
                <motion.h1 
                  className="text-4xl md:text-5xl font-black mb-2"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #40E0D0, #9333EA, #EC4899, #40E0D0)',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {mode === 'signin' ? 'Welcome Back' : 'Join The Elite'}
                </motion.h1>
                <motion.p 
                  className="text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {mode === 'signin' ? 'Your throne awaits' : 'Claim your destiny'}
                </motion.p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username/Email Input with floating label */}
                <motion.div 
                  className="relative"
                  animate={{ 
                    scale: inputFocused === 'login' ? 1.02 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <input
                    type="text"
                    value={formData.loginCredential}
                    onChange={(e) => setFormData({ ...formData, loginCredential: e.target.value })}
                    onFocus={() => setInputFocused('login')}
                    onBlur={() => setInputFocused('')}
                    className="w-full px-12 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-transparent focus:border-[#40E0D0] focus:bg-white/10 transition-all peer"
                    placeholder="Username or Email"
                    id="loginCredential"
                    required
                  />
                  <label 
                    htmlFor="loginCredential"
                    className="absolute left-12 top-4 text-gray-400 transition-all peer-placeholder-shown:top-4 peer-focus:-top-6 peer-focus:left-2 peer-focus:text-xs peer-focus:text-[#40E0D0] peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs"
                  >
                    Username or Email
                  </label>
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  
                  {/* Animated underline */}
                  <motion.div 
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#40E0D0] to-purple-500"
                    initial={{ width: '0%' }}
                    animate={{ width: inputFocused === 'login' ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
                {errors.login && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    {errors.login}
                  </motion.p>
                )}

                {/* Password Input */}
                <motion.div 
                  className="relative"
                  animate={{ 
                    scale: inputFocused === 'password' ? 1.02 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={() => setInputFocused('password')}
                    onBlur={() => setInputFocused('')}
                    className="w-full px-12 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-transparent focus:border-[#40E0D0] focus:bg-white/10 transition-all peer"
                    placeholder="Password"
                    id="password"
                    required
                  />
                  <label 
                    htmlFor="password"
                    className="absolute left-12 top-4 text-gray-400 transition-all peer-placeholder-shown:top-4 peer-focus:-top-6 peer-focus:left-2 peer-focus:text-xs peer-focus:text-[#40E0D0] peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs"
                  >
                    Password
                  </label>
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  
                  {/* Animated underline */}
                  <motion.div 
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: '0%' }}
                    animate={{ width: inputFocused === 'password' ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>

                {/* Single line password requirements */}
                {mode === 'signup' && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-gray-500 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-[#40E0D0]" />
                    Min 12 chars • Use a strong, unique password
                  </motion.p>
                )}

                {/* Confirm Password (signup only) */}
                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div 
                      className="relative"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        onFocus={() => setInputFocused('confirmPassword')}
                        onBlur={() => setInputFocused('')}
                        className="w-full px-12 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-transparent focus:border-[#40E0D0] focus:bg-white/10 transition-all peer"
                        placeholder="Confirm Password"
                        id="confirmPassword"
                        required
                      />
                      <label 
                        htmlFor="confirmPassword"
                        className="absolute left-12 top-4 text-gray-400 transition-all peer-placeholder-shown:top-4 peer-focus:-top-6 peer-focus:left-2 peer-focus:text-xs peer-focus:text-[#40E0D0] peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs"
                      >
                        Confirm Password
                      </label>
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    {errors.password}
                  </motion.p>
                )}

                {/* Terms (signup only) */}
                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <input
                        type="checkbox"
                        id="terms"
                        checked={formData.acceptTerms}
                        onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                        className="w-4 h-4 mt-1 bg-white/10 border-white/20 rounded text-[#40E0D0] focus:ring-[#40E0D0]"
                        required
                      />
                      <label htmlFor="terms" className="text-sm text-gray-400">
                        I agree to the{' '}
                        <Link href="/terms" className="text-[#40E0D0] hover:text-[#40E0D0]/80 transition-colors">
                          Terms
                        </Link>
                        {' & '}
                        <Link href="/privacy" className="text-[#40E0D0] hover:text-[#40E0D0]/80 transition-colors">
                          Privacy Policy
                        </Link>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button with hover effects */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="relative w-full py-4 font-bold rounded-xl overflow-hidden group disabled:cursor-not-allowed"
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#40E0D0] via-purple-500 to-pink-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  <span className="relative z-10 text-black flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        {mode === 'signin' ? 'Enter The Game' : 'Begin Your Legacy'}
                        <Zap className="w-5 h-5" />
                      </>
                    )}
                  </span>
                </motion.button>

                {/* Forgot Password (signin only) */}
                <AnimatePresence>
                  {mode === 'signin' && (
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <a 
                        href="/auth/forgot-password" 
                        className="text-sm text-gray-400 hover:text-[#40E0D0] transition-colors"
                      >
                        Forgot your password?
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              {/* Mode Toggle with animation */}
              <motion.div 
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  onClick={() => {
                    setMode(mode === 'signin' ? 'signup' : 'signin');
                    setErrors({ login: '', password: '' });
                    setFormData({ ...formData, password: '', confirmPassword: '' });
                  }}
                  className="text-sm text-gray-400 hover:text-white transition-colors group"
                >
                  {mode === 'signin' ? (
                    <>
                      New to TheChessWire?{' '}
                      <span className="text-[#40E0D0] group-hover:text-[#40E0D0]/80">
                        Create an account
                      </span>
                    </>
                  ) : (
                    <>
                      Already a member?{' '}
                      <span className="text-[#40E0D0] group-hover:text-[#40E0D0]/80">
                        Sign in
                      </span>
                    </>
                  )}
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
