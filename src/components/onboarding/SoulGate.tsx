// File: /src/components/onboarding/SoulGate.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Volume2, VolumeX, Star, Sparkles, Zap, Crown } from 'lucide-react';
import Image from 'next/image';
import EchoOriginSelector from './EchoOriginSelector';
import VoiceModeSelector from './VoiceModeSelector';
import TitledPlayerVerification from './TitledPlayerVerification';
import UsernameSelection from './UsernameSelection';
import SecurityGate from './SecurityGate';
import BambaiNarrator from './BambaiNarrator';
import AgeConfirmationModal from './AgeConfirmationModal';
import { useRouter } from 'next/navigation';

const INTRO_SEQUENCES = [
  "Welcome to TheChessWire...",
  "Where every move tells a story",
  "Not just a result, but an echo of your soul",
  "The board remembers everything",
  "You only have to listen..."
];

export default function SoulGate() {
  const router = useRouter();
  const [stage, setStage] = useState<'intro' | 'origin' | 'voice' | 'titled' | 'username' | 'auth'>('intro');
  const [introIndex, setIntroIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showAgeConfirmation, setShowAgeConfirmation] = useState(false);
  const [userData, setUserData] = useState({
    echoOrigin: '',
    voiceMode: 'calm',
    isTitledPlayer: false,
    titledPlayerVerified: false,
    username: '',
    email: '',
    consent: false,
    ageConfirmed: false
  });
  const [securityPassed, setSecurityPassed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Mouse tracking for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced particle system with neural network effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mounted) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      pulse: number;
    }> = [];
    const particleCount = 150;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: Math.random() > 0.5 ? '#40E0D0' : '#9333EA',
        pulse: Math.random() * Math.PI * 2
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulse += 0.02;

        // Bounce off walls
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle with glow
        const size = particle.size + Math.sin(particle.pulse) * 0.5;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = particle.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw connections
        particles.slice(i + 1).forEach(otherParticle => {
          const distance = Math.hypot(
            particle.x - otherParticle.x,
            particle.y - otherParticle.y
          );

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(64, 224, 208, ${0.2 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mounted]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Security check on mount
  useEffect(() => {
    const checkSecurity = async () => {
      const result = await SecurityGate.check();
      setSecurityPassed(result.allowed);
      if (!result.allowed) {
        console.warn('Access restricted:', result.reason);
        router.push('/restricted');
      }
    };
    checkSecurity();
  }, [router]);

  // Auto-advance intro with typewriter effect
  useEffect(() => {
    if (stage === 'intro' && introIndex < INTRO_SEQUENCES.length) {
      const timer = setTimeout(() => {
        setIntroIndex(prev => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (stage === 'intro' && introIndex === INTRO_SEQUENCES.length) {
      setTimeout(() => setStage('origin'), 2000);
    }
  }, [introIndex, stage]);

  // Bambai AI voice narration
  useEffect(() => {
    if (voiceEnabled && stage === 'intro' && introIndex < INTRO_SEQUENCES.length) {
      BambaiNarrator.speak(INTRO_SEQUENCES[introIndex], userData.voiceMode);
    }
  }, [introIndex, stage, voiceEnabled, userData.voiceMode]);

  const handleOriginSelect = (origin: string) => {
    setUserData({ ...userData, echoOrigin: origin });
    setStage('voice');
  };

  const handleVoiceModeSelect = (mode: string) => {
    setUserData({ ...userData, voiceMode: mode });
    setStage('titled');
  };

  const handleTitledPlayerResponse = (verified: boolean, skipReason?: string) => {
    setUserData({ 
      ...userData, 
      isTitledPlayer: false,
      titledPlayerVerified: verified 
    });
    
    if (verified) {
      setUserData(prev => ({ ...prev, isTitledPlayer: true }));
    }
    
    if (!verified && skipReason) {
      console.log('Titled verification skipped:', skipReason);
    }
    
    setStage('username');
  };

  const handleUsernameSelect = (username: string, email: string) => {
    setUserData({ ...userData, username, email });
    setStage('auth');
  };

  const handleAuth = () => {
    // Show age confirmation modal first
    setShowAgeConfirmation(true);
  };

  const handleAgeConfirm = () => {
    setShowAgeConfirmation(false);
    setUserData({ ...userData, ageConfirmed: true });
    
    // Log consent and session data (GDPR compliant)
    const sessionData = {
      ...userData,
      ageConfirmed: true,
      timestamp: new Date().toISOString(),
      sessionHash: generateQuantumHash(),
      consent: true,
      securityCheck: securityPassed,
      ipHash: generateIPHash(),
    };
    
    // Store in secure session
    sessionStorage.setItem('chesswire_onboarding', JSON.stringify(sessionData));
    
    if (voiceEnabled) {
      BambaiNarrator.speak('Your journey begins now. Welcome to TheChessWire.', 'dramatic');
    }
    
    // Navigate to auth gateway after a brief delay
    setTimeout(() => {
      router.push('/auth/gateway');
    }, 2000);
  };

  const handleAgeCancel = () => {
    setShowAgeConfirmation(false);
    if (voiceEnabled) {
      BambaiNarrator.speak('Perhaps another time, when you are ready.', 'calm');
    }
  };

  const generateQuantumHash = () => {
    return `qh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateIPHash = () => {
    return `ip_${Date.now()}_secure`;
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Neural network particle canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 opacity-60"
        style={{ filter: 'blur(0.5px)' }}
      />

      {/* Animated background layers */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a]" />
        
        {/* Animated orbs */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(64, 224, 208, 0.2) 0%, transparent 40%)',
              'radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.2) 0%, transparent 40%)',
              'radial-gradient(circle at 50% 20%, rgba(236, 72, 153, 0.2) 0%, transparent 40%)',
              'radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.2) 0%, transparent 40%)',
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
        />

        {/* Mesh gradient overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 35px,
                rgba(64, 224, 208, 0.03) 35px,
                rgba(64, 224, 208, 0.03) 70px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 35px,
                rgba(147, 51, 234, 0.03) 35px,
                rgba(147, 51, 234, 0.03) 70px
              )
            `,
          }}
        />
      </div>
      
      {/* Floating chess pieces with advanced effects */}
      {mounted && [...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            fontSize: `${80 + i * 20}px`,
            filter: 'drop-shadow(0 0 20px currentColor)',
            textShadow: '0 0 40px currentColor',
          }}
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotate: 0,
            scale: 0,
          }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
            rotate: [0, 180, 360],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{ 
            duration: 30 + i * 5, 
            repeat: Infinity, 
            repeatType: 'reverse',
            ease: 'easeInOut'
          }}
        >
          <motion.span
            animate={{
              color: [
                '#40E0D0',
                '#9333EA',
                '#EC4899',
                '#F59E0B',
                '#40E0D0'
              ]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            {['♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛'][i]}
          </motion.span>
        </motion.div>
      ))}

      {/* Holographic grid effect */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(64, 224, 208, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(64, 224, 208, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'perspective(1000px) rotateX(60deg)',
          transformOrigin: 'center center',
        }}
      />

      {/* Voice toggle with glow effect */}
      <motion.button
        onClick={() => setVoiceEnabled(!voiceEnabled)}
        className="absolute top-6 right-6 z-50 p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all border border-white/20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={voiceEnabled ? 'Disable voice' : 'Enable voice'}
        style={{
          boxShadow: voiceEnabled 
            ? '0 0 30px rgba(64, 224, 208, 0.5)' 
            : '0 0 10px rgba(255, 255, 255, 0.1)'
        }}
      >
        {voiceEnabled ? (
          <Volume2 className="w-6 h-6 text-[#40E0D0]" />
        ) : (
          <VolumeX className="w-6 h-6 text-gray-400" />
        )}
      </motion.button>

      <AnimatePresence mode="wait">
        {/* Intro Stage with cinematic effects */}
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex items-center justify-center min-h-screen perspective-1000"
          >
            <motion.div 
              className="text-center px-6 max-w-6xl"
              style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* 3D Logo with holographic effect */}
              <motion.div
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', duration: 2, bounce: 0.5 }}
                className="mb-16 flex justify-center"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="relative">
                  {/* Multiple glow layers */}
                  <div className="absolute inset-0 bg-[#40E0D0] blur-3xl opacity-50 scale-150 animate-pulse" />
                  <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-30 scale-125 animate-pulse animation-delay-1000" />
                  <div className="absolute inset-0 bg-pink-500 blur-xl opacity-20 scale-110 animate-pulse animation-delay-2000" />
                  
                  {/* Main logo with 3D effect */}
                  <motion.div
                    animate={{ 
                      rotateY: [0, 360],
                      rotateZ: [0, 5, -5, 0],
                    }}
                    transition={{ 
                      rotateY: { duration: 20, repeat: Infinity, ease: 'linear' },
                      rotateZ: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                    }}
                    style={{
                      transform: 'translateZ(50px)',
                    }}
                  >
                    <Image
                      src="/assets/chesswire-logo-white.svg"
                      alt="TheChessWire"
                      width={256}
                      height={256}
                      className="w-48 h-48 md:w-64 md:h-64 drop-shadow-2xl"
                      style={{
                        filter: 'drop-shadow(0 0 50px rgba(64, 224, 208, 0.8))',
                      }}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Typewriter text with cinematic styling */}
              <AnimatePresence mode="wait">
                {introIndex < INTRO_SEQUENCES.length && (
                  <motion.div
                    key={introIndex}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 1.1 }}
                    transition={{ duration: 0.8 }}
                  >
                    <h1 className="text-4xl md:text-7xl font-black mb-8 leading-tight">
                      {INTRO_SEQUENCES[introIndex].split('').map((char, i) => (
                        <motion.span
                          key={i}
                          initial={{ 
                            opacity: 0, 
                            y: 20,
                            rotateX: -90,
                            filter: 'blur(10px)'
                          }}
                          animate={{ 
                            opacity: 1, 
                            y: 0,
                            rotateX: 0,
                            filter: 'blur(0px)'
                          }}
                          transition={{ 
                            delay: i * 0.03,
                            duration: 0.5,
                            ease: 'easeOut'
                          }}
                          className="inline-block"
                          style={{
                            fontFamily: "'Orbitron', 'Inter', sans-serif",
                            fontWeight: 900,
                            background: 'linear-gradient(135deg, #40E0D0 0%, #9333EA 50%, #EC4899 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 0 80px rgba(64, 224, 208, 0.5)',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {char === ' ' ? '\u00A0' : char}
                        </motion.span>
                      ))}
                    </h1>

                    {/* Cinematic underline */}
                    <motion.div
                      className="h-1 bg-gradient-to-r from-transparent via-[#40E0D0] to-transparent mx-auto"
                      initial={{ width: 0 }}
                      animate={{ width: '60%' }}
                      transition={{ delay: 0.5, duration: 1 }}
                      style={{
                        boxShadow: '0 0 20px rgba(64, 224, 208, 0.8)',
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floating particles around text */}
              {mounted && [...Array(20)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-1 h-1 bg-[#40E0D0] rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    boxShadow: '0 0 10px rgba(64, 224, 208, 0.8)',
                  }}
                  animate={{
                    x: [0, (Math.random() - 0.5) * 300],
                    y: [0, (Math.random() - 0.5) * 300],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Echo Origin Selection with enhanced visuals */}
        {stage === 'origin' && (
          <motion.div
            key="origin"
            initial={{ opacity: 0, x: 100, filter: 'blur(20px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -100, filter: 'blur(20px)' }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="relative z-10 flex items-center justify-center min-h-screen px-6"
          >
            <EchoOriginSelector onSelect={handleOriginSelect} voiceEnabled={voiceEnabled} />
          </motion.div>
        )}

        {/* Voice Mode Selection */}
        {stage === 'voice' && (
          <motion.div
            key="voice"
            initial={{ opacity: 0, x: 100, filter: 'blur(20px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -100, filter: 'blur(20px)' }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="relative z-10 flex items-center justify-center min-h-screen px-6"
          >
            <VoiceModeSelector onSelect={handleVoiceModeSelect} voiceEnabled={voiceEnabled} />
          </motion.div>
        )}

        {/* Titled Player Check */}
        {stage === 'titled' && (
          <motion.div
            key="titled"
            initial={{ opacity: 0, x: 100, filter: 'blur(20px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -100, filter: 'blur(20px)' }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="relative z-10 flex items-center justify-center min-h-screen px-6"
          >
            <TitledPlayerVerification onComplete={handleTitledPlayerResponse} voiceEnabled={voiceEnabled} />
          </motion.div>
        )}

        {/* Username Selection */}
        {stage === 'username' && (
          <motion.div
            key="username"
            initial={{ opacity: 0, x: 100, filter: 'blur(20px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -100, filter: 'blur(20px)' }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="relative z-10 flex items-center justify-center min-h-screen px-6"
          >
            <UsernameSelection onComplete={handleUsernameSelect} voiceEnabled={voiceEnabled} />
          </motion.div>
        )}

        {/* Final Auth Gateway with celebration effect */}
        {stage === 'auth' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="relative z-10 flex items-center justify-center min-h-screen px-6"
          >
            <div className="text-center max-w-lg relative">
              {/* Celebration particles */}
              {mounted && [...Array(30)].map((_, i) => (
                <motion.div
                  key={`celebration-${i}`}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.5) * 400,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.05,
                    ease: 'easeOut',
                  }}
                >
                  <Star 
                    className="w-4 h-4" 
                    style={{
                      color: ['#40E0D0', '#9333EA', '#EC4899', '#F59E0B'][i % 4],
                      filter: 'drop-shadow(0 0 10px currentColor)',
                    }}
                  />
                </motion.div>
              ))}

              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="inline-block mb-6"
                >
                  <Sparkles 
                    className="w-24 h-24 text-[#40E0D0] mx-auto" 
                    style={{
                      filter: 'drop-shadow(0 0 30px rgba(64, 224, 208, 0.8))',
                    }}
                  />
                </motion.div>

                <motion.h2 
                  className="text-5xl font-black mb-6"
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    background: 'linear-gradient(135deg, #40E0D0, #9333EA, #EC4899)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 40px rgba(64, 224, 208, 0.5)',
                  }}
                >
                  Your Journey Begins
                </motion.h2>

                <motion.p 
                  className="text-xl text-gray-300 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  Welcome <span className="text-[#40E0D0] font-bold">{userData.username}</span>! 
                  {userData.echoOrigin && (
                    <span className="block mt-2">
                      As a <span className="text-purple-400 font-bold capitalize">{userData.echoOrigin}</span>,
                    </span>
                  )}
                  {userData.titledPlayerVerified && (
                    <span className="block mt-2 text-yellow-400 font-bold">
                      with your titled status verified,
                    </span>
                  )}
                  <span className="block mt-2">you&apos;re ready to enter TheChessWire.</span>
                </motion.p>
              </motion.div>

              <motion.button
                onClick={handleAuth}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-12 py-6 text-lg font-bold rounded-2xl overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {/* Multi-layer gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#40E0D0] via-purple-500 to-pink-500 opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-[#40E0D0] to-purple-500 opacity-0 group-hover:opacity-90 transition-opacity duration-500" />
                
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                
                {/* Particle explosion on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        left: '50%',
                        top: '50%',
                      }}
                      animate={{
                        x: [(Math.random() - 0.5) * 100],
                        y: [(Math.random() - 0.5) * 100],
                        opacity: [1, 0],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </div>

                <span className="relative z-10 text-black flex items-center gap-3">
                  Choose Your Identity
                  <Zap className="w-6 h-6" />
                </span>
              </motion.button>

              <motion.p 
                className="text-xs text-gray-500 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                By joining, you agree to our Terms and Privacy Policy
              </motion.p>

              {userData.titledPlayerVerified && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-yellow-400/10 border border-yellow-400/30 rounded-full"
                >
                  <Crown className="w-6 h-6 text-yellow-400" />
                  <span className="text-sm text-yellow-400 font-bold">
                    Verified Titled Player Benefits Active
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Age Confirmation Modal */}
      <AgeConfirmationModal
        isOpen={showAgeConfirmation}
        onConfirm={handleAgeConfirm}
        onCancel={handleAgeCancel}
        voiceEnabled={voiceEnabled}
        username={userData.username}
      />
    </div>
  );
}