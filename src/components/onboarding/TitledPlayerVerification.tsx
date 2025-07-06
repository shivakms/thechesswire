// File: /components/onboarding/TitledPlayerVerification.tsx
'use client';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import BambaiNarrator from './BambaiNarrator';
import Image from 'next/image';
import { titledPlayer } from '@/services/api';
import toast from 'react-hot-toast';

// Complete list of all recognized titles
const RECOGNIZED_TITLES = {
  // Traditional Over-the-Board FIDE Titles
  traditional: ['GM', 'IM', 'FM', 'CM', 'WGM', 'WIM', 'WFM', 'WCM'],
  
  // Arena (Online) FIDE Titles
  arena: ['AGM', 'AIM', 'AFM', 'ACM'],
  
  // National Master Titles
  national: ['NM', 'WNM', 'LM'],
  
  // FIDE Instructor/Trainer Titles (optional - remove if not needed)
  instructor: ['FST', 'FT', 'FI', 'FA', 'NI', 'DI']
};

// Flatten all titles into one array for easy checking
const ALL_TITLES = Object.values(RECOGNIZED_TITLES).flat();

interface TitledPlayerVerificationProps {
  onComplete: (verified: boolean, skipReason?: string) => void;
  voiceEnabled: boolean;
}

export default function TitledPlayerVerification({ onComplete, voiceEnabled }: TitledPlayerVerificationProps) {
  const [verifying, setVerifying] = useState(false);
  const [username, setUsername] = useState('');
  const [platform, setPlatform] = useState<'fide' | 'chesscom' | 'lichess'>('chesscom');
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (voiceEnabled) {
      BambaiNarrator.speak('Are you a titled player? We honor those who have earned their crowns.', 'calm');
    }
  }, [voiceEnabled]);

  const handleVerify = async () => {
    if (!username.trim()) {
      setError('Please enter your username or FIDE ID');
      return;
    }

    setVerifying(true);
    setError('');
    setVerificationAttempts(prev => prev + 1);

    try {
      // Call backend API
      const response = await titledPlayer.verify({
        platform,
        username: username.trim(),
        fideId: platform === 'fide' ? username.trim() : undefined
      });

      if (response.verified && response.title) {
        // Check if the returned title is in our recognized list
        if (ALL_TITLES.includes(response.title)) {
          toast.success(`Welcome, ${response.title} ${response.name || username}!`);
          
          if (voiceEnabled) {
            const titleCategory = getTitleCategory(response.title);
            const message = titleCategory === 'arena' 
              ? `Welcome, ${response.title}. The digital battlefield recognizes its warriors.`
              : `Welcome, ${response.title}. Your crown is recognized.`;
            BambaiNarrator.speak(message, 'calm');
          }
          
          // Store verified data in sessionStorage for signup
          const onboardingData = JSON.parse(sessionStorage.getItem('chesswire_onboarding') || '{}');
          sessionStorage.setItem('chesswire_onboarding', JSON.stringify({
            ...onboardingData,
            titledPlayerVerified: true,
            titledPlayerData: {
              title: response.title,
              platform,
              username,
              verifiedAt: new Date().toISOString()
            }
          }));
          
          setTimeout(() => onComplete(true), 2000);
        } else {
          setError('Title not recognized. Please contact support.');
          setVerifying(false);
        }
      } else {
        setError('Verification failed. Please check your username.');
        if (verificationAttempts >= 3) {
          setError('Too many attempts. You can continue without verification.');
        }
        setVerifying(false);
      }
    } catch (err: unknown) {
      console.error('Verification error:', err);
      
      if ((err as { response?: { status?: number } }).response?.status === 404) {
        setError('Player not found. Please check your username.');
      } else if ((err as { response?: { status?: number } }).response?.status === 429) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError('Verification service unavailable. Please try again.');
      }
      setVerifying(false);
    }
  };

  const getTitleCategory = (title: string): string => {
    for (const [category, titles] of Object.entries(RECOGNIZED_TITLES)) {
      if (titles.includes(title)) return category;
    }
    return 'unknown';
  };

  const handleContinueWithoutVerification = () => {
    if (voiceEnabled) {
      BambaiNarrator.speak('No title found, but every master was once a student.', 'calm');
    }
    onComplete(false, 'user_choice');
  };

  return (
    <div className="max-w-md w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Image
          src="/assets/chesswire-logo-white.svg"
          alt="TheChessWire"
          width={64}
          height={64}
          className="mx-auto mb-4"
        />
        <h2 className="text-3xl font-bold text-white mb-4">Titled Player Verification</h2>
        <p className="text-gray-300">Verify your title for exclusive benefits</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
          <div className="grid grid-cols-3 gap-2">
            {['fide', 'chesscom', 'lichess'].map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p as 'fide' | 'chesscom' | 'lichess')}
                disabled={verifying}
                className={`p-3 rounded-lg border transition-all ${
                  platform === p 
                    ? 'border-[#40E0D0] bg-[#40E0D0]/20 text-white' 
                    : 'border-white/20 text-gray-400 hover:border-white/40'
                } ${verifying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {p === 'fide' ? 'FIDE' : p === 'chesscom' ? 'Chess.com' : 'Lichess'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {platform === 'fide' ? 'FIDE ID' : 'Username'}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={platform === 'fide' ? '12345678' : 'your_username'}
            disabled={verifying}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-[#40E0D0] focus:outline-none transition-colors disabled:opacity-50"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleVerify}
          disabled={!username || verifying || verificationAttempts >= 3}
          className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {verifying ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              Verifying...
            </span>
          ) : (
            'Verify Title'
          )}
        </motion.button>

        <button
          onClick={handleContinueWithoutVerification}
          disabled={verifying}
          className="w-full py-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          Continue Without Verification
        </button>
      </motion.div>

      {/* Benefits Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10"
      >
        <h3 className="text-sm font-semibold text-[#40E0D0] mb-2">Verified Titled Player Benefits:</h3>
        <ul className="space-y-1 text-xs text-gray-300">
          <li>• Featured article spots</li>
          <li>• No advertisements</li>
          <li>• Voice interview narration</li>
          <li>• Special crown badge</li>
          <li>• Auto-featured content</li>
          <li>• Unlimited SoulCinema renders</li>
          <li>• Priority support</li>
        </ul>
        
        {/* Accepted Titles Section */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-xs font-semibold text-gray-400 mb-2">Accepted Titles:</p>
          
          <div className="space-y-2 text-xs text-gray-500">
            <div>
              <span className="text-[#40E0D0]">Traditional:</span>
              <span className="ml-2">GM, IM, FM, CM, WGM, WIM, WFM, WCM</span>
            </div>
            
            <div>
              <span className="text-purple-400">Arena Online:</span>
              <span className="ml-2">AGM, AIM, AFM, ACM</span>
            </div>
            
            <div>
              <span className="text-yellow-400">National:</span>
              <span className="ml-2">NM, WNM, LM</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
